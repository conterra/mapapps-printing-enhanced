/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Evented_Mixin} from "apprt-core/Events";
import {apprtFetch, ContentType} from "apprt-fetch";
import {createFormData, delay, mapWithConcurrency} from "./utils";
import {applyLegendEnabled} from "./LegendLayers";
import { apprtFetchJson } from "apprt-fetch";

export default function () {
    return {
        async downloadMapSeries(mapSeriesPrintingRequests, mapSeriesTitle, legendExtent, templateOptions, properties, numberOfConcurrentRequests, printRunOptions) {
            if (!mapSeriesPrintingRequests || mapSeriesPrintingRequests.length === 0)
                return this._createMapSeriesErrorJob(mapSeriesTitle, templateOptions?.format, this._i18n.get().ui.mapSeriesRequestsInvalid);

            numberOfConcurrentRequests = numberOfConcurrentRequests ?? this._properties.numberOfConcurrentDownloads;

            // the legend page is printed after the map series pages (it is built from their last request)
            const printLegendOwnPage = printRunOptions?.legendOwnPage === true;
            const totalJobCount = mapSeriesPrintingRequests.length + (printLegendOwnPage ? 1 : 0);
            const mapSeriesJob = this._createMapSeriesJob(mapSeriesTitle, totalJobCount, templateOptions.format);

            const resultInfos = this._executeAndDownloadConcurrentMapSeriesPrintingRequests(
                mapSeriesJob, mapSeriesPrintingRequests, numberOfConcurrentRequests
            );
            resultInfos.then(async (resultInfos) => {
                if (printLegendOwnPage) {
                    // never throws: a failing legend must not block the download of the map series
                    mapSeriesJob.legendResultZipAsBlob = await this._printMapSeriesLegend(
                        templateOptions, properties, mapSeriesJob, legendExtent
                    );
                    mapSeriesJob.completedSinglePrintJobCount = mapSeriesJob.completedSinglePrintJobCount + 1;
                }

                mapSeriesJob.resultZipAsBlobs = resultInfos;
                mapSeriesJob.downloadFinished = true;
                mapSeriesJob.emit("downloadFinished");
            }).catch(error => {
                console.error(error);
                this._logService.error(this._i18n.get().ui.errors.error);
                this._markMapSeriesJobAsFailed(mapSeriesJob, error?.message || String(error));
            });
            return mapSeriesJob;
        },

        /**
         * Prints and downloads the legend of a map series.
         * Never throws: if anything fails (e.g. the legend layout does not exist on the print service),
         * the user is notified and undefined is returned, so the map series can be downloaded without legend.
         * @returns {Promise<{blob: Blob, fileName: string}|undefined>}
         */
        async _printMapSeriesLegend(templateOptions, properties, mapSeriesJob, legendExtent) {
            try {
                const legendResultInfo = await this._executeMapSeriesLegendRequest(
                    templateOptions, properties, mapSeriesJob, legendExtent
                );
                const blob = await this._downloadAndZipHelper.fetchBlobWithRetry(legendResultInfo.url);
                if (!blob) {
                    throw new Error(`Legend print result could not be downloaded from '${legendResultInfo.url}'`);
                }
                return {
                    blob,
                    fileName: legendResultInfo.fileName
                };
            } catch (error) {
                console.error("[PrintingMapSeriesDownloader] Legend could not be printed:", error);
                this._logService.warn(this._i18n.get().ui.errors.legendPrintFailed);
                return undefined;
            }
        },

        /**
         * @returns {Promise<{url: string, fileName: string}>} rejects if the legend could not be printed
         */
        async _executeMapSeriesLegendRequest(templateOptions, properties, mapSeriesJob, legendExtent) {
            const legendPrintingRequest = this._createLegendRequestBlueprint(templateOptions, properties, legendExtent);
            if (!legendPrintingRequest) {
                throw new Error("No printing request blueprint available to create the legend request from");
            }

            const formData = createFormData(legendPrintingRequest.body);
            const response = await apprtFetch(legendPrintingRequest.url, {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "Accept": ContentType.JSON
                },
                timeoutMillis: this._properties.printingRequestTimeout,
                proxyMode: "force-off"
            });
            const responseJson = await response.json();
            // throws if the print service reports an error, e.g. an unknown Layout_Template
            const resultUrl = await this._extractResultURLFromResponse(responseJson, legendPrintingRequest.url);
            if (!resultUrl) {
                throw new Error("Print service returned no result URL for the legend");
            }
            return {
                url: resultUrl,
                fileName: `${this._properties.legendFileNamePrefix}.${mapSeriesJob.fileFormat}`
            };
        },

        /**
         * Creates a blueprint for a legend request based on the previous map image blueprint which had to run first!
         * This is done manually to avoid the expensive legend request to be done twice because canceling the request
         * of a blueprint cannot be done right now (see https://conterrade.atlassian.net/browse/MAPAPPS-6898
         */
        _createLegendRequestBlueprint(templateOptions, properties, legendExtent) {
            const legendTitle = (templateOptions.title || properties.filenameIfNoneIsGiven)
                + properties.legend.legendTitleAppendText;

            const printingRequestBlueprint = this._createLegendBlueprintFromMapImageBlueprint(legendTitle, legendExtent, properties.layoutNames.legend, templateOptions.customTextElements);

            return printingRequestBlueprint;
        },

        /**
         * Modifies the last map image blueprint to create a legend blueprint
         */
        _createLegendBlueprintFromMapImageBlueprint(legendTitle, legendExtent, legendTemplateName, customTextElements) {
            const lastMapImageBlueprintCopy = this._printingRequestBlueprintProvider.getLastPrintingRequestBlueprint();
            if (!lastMapImageBlueprintCopy?.body?.Web_Map_as_JSON) {
                return;
            }
            const webMapAsJsonString = this._printingRequestBlueprintProvider.updateExtent(lastMapImageBlueprintCopy.body.Web_Map_as_JSON, legendExtent);
            const webMapAsJson = JSON.parse(webMapAsJsonString);
            lastMapImageBlueprintCopy.body.Layout_Template = legendTemplateName;
            webMapAsJson.layoutOptions.titleText = legendTitle;
            webMapAsJson.layoutOptions.customTextElements = customTextElements;
            // the map series pages are printed without legend (empty legend layers), the legend page needs them
            applyLegendEnabled(lastMapImageBlueprintCopy, webMapAsJson.layoutOptions, true);
            lastMapImageBlueprintCopy.body.Web_Map_as_JSON = JSON.stringify(webMapAsJson);
            delete lastMapImageBlueprintCopy.col;
            delete lastMapImageBlueprintCopy.row;
            return lastMapImageBlueprintCopy;
        },

        /**
         * Submits each print request and downloads its result file as one unit, so that with
         * concurrency 1 the requests to the print service happen strictly one at a time:
         * print -> download -> print -> download -> ... Previously printing and downloading
         * were two separate batch phases (all prints, then all downloads), which meant
         * "concurrency 1" only serialized each phase internally, not the print/download pairing.
         */
        async _executeAndDownloadConcurrentMapSeriesPrintingRequests(
            mapSeriesJob, mapSeriesPrintingRequests, numberOfConcurrentRequests = 2
        ) {
            const that = this;
            return mapWithConcurrency(
                mapSeriesPrintingRequests,
                async singleMapSeriesPrintingRequest => {
                    const formData = createFormData(singleMapSeriesPrintingRequest.body);
                    const requestPromise = apprtFetch(singleMapSeriesPrintingRequest.url, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Accept": ContentType.JSON
                        },
                        timeoutMillis: this._properties.printingRequestTimeout,
                        proxyMode: "force-off"
                    });
                    that._attachCompletionCountFunction(mapSeriesJob, requestPromise);
                    const response = await requestPromise;
                    const result = await response.json();
                    let fileName;
                    if (singleMapSeriesPrintingRequest.row === undefined || singleMapSeriesPrintingRequest.col === undefined) {
                        fileName = `${mapSeriesJob.mapSeriesTitle}-${this._properties.fileNameSuffixOverviewPage}.${mapSeriesJob.fileFormat}`;
                    } else {
                        const pageNumber = singleMapSeriesPrintingRequest.pagenumber + 1;
                        fileName = `${mapSeriesJob.mapSeriesTitle}-${pageNumber}.${mapSeriesJob.fileFormat}`;
                    }
                    const url = await that._extractResultURLFromResponse(result, singleMapSeriesPrintingRequest.url);
                    const blob = await that._downloadAndZipHelper.fetchBlobWithRetry(url);
                    return {
                        blob: blob,
                        fileName: fileName,
                        col: singleMapSeriesPrintingRequest.col,
                        row: singleMapSeriesPrintingRequest.row,
                        extent: singleMapSeriesPrintingRequest
                    };
                },
                numberOfConcurrentRequests
            );
        },

        _attachCompletionCountFunction(mapSeriesJob, requestPromise, singleMapSeriesPrintingRequest) {
            requestPromise.then(() => {
                mapSeriesJob.completedSinglePrintJobCount =
                    mapSeriesJob.completedSinglePrintJobCount + 1;
            });
        },

        _extractResultUrls(printingRequestResults) {
            if (!printingRequestResults || printingRequestResults.length === 0)
                return [];
            return printingRequestResults.map(singleResultObject => this._extractResultURL(singleResultObject));
        },

        _extractResultURL(singleResultObject) {
            return singleResultObject.results[0].value.url;
        },

        /**
         * Polls an async GP job until completion and returns the result URL.
         * @param {string} baseUrl - The GP service base URL (e.g. .../Export Web Map)
         * @param {string} jobId - The job ID from the submitJob response
         * @param {number} interval - Polling interval in ms
         * @returns {Promise<string>} The output URL
         */
        async _waitForAsyncJobResult(baseUrl, jobId, interval = 2000) {
            const jobUrl = `${baseUrl}/jobs/${jobId}`;
            const outputParamName = "Output_File";
            // Poll until job completes
            while (true) {
                const statusData = await apprtFetchJson(`${jobUrl}?f=json`);
                const status = statusData.jobStatus;
                if (status === "esriJobSucceeded") {
                    // Fetch the result
                    const resultData = await apprtFetchJson(`${jobUrl}/results/${outputParamName}?f=json`);
                    return resultData?.value?.url;
                } else if (status === "esriJobFailed" || status === "esriJobCancelled" || status === "esriJobTimedOut") {
                    const msg = statusData.messages?.map(m => m.description).join("; ") || status;
                    throw new Error(`Print job failed: ${msg}`);
                }
                // Still running, wait and try again
                await delay(interval);
            }
        },

        /**
         * Extracts the result URL from a GP service response, handling both
         * synchronous (results[]) and asynchronous (jobId) response formats.
         */
        async _extractResultURLFromResponse(result, requestUrl) {
            // Error response from the GP service
            if (result.error) {
                const details = result.error.details?.join("; ") || "";
                const msg = `Print service error (${result.error.code}): ${result.error.message}${details ? "; " + details : ""}`;
                console.error("[PrintingMapSeriesDownloader]", msg, result.error);
                throw new Error(msg);
            }
            // Synchronous response: results array present
            if (result.results && result.results.length > 0) {
                return result.results[0].value.url;
            }
            // Asynchronous response: jobId present, need to poll for completion
            if (result.jobId) {
                // We need the base GP task URL (without /submitJob or /execute)
                const baseUrl = this._normalizeGpTaskBaseUrl(requestUrl);
                return this._waitForAsyncJobResult(baseUrl, result.jobId);
            }
            console.error("[PrintingMapSeriesDownloader] Unexpected response format:", result);
            throw new Error("Unexpected print service response format — neither results[] nor jobId found.");
        },

        _normalizeGpTaskBaseUrl(requestUrl) {
            if (!requestUrl || typeof requestUrl !== "string") {
                return requestUrl;
            }
            return requestUrl.replace(/\/(submitJob|execute)$/i, "");
        },

        _createMapSeriesJob(mapSeriesTitle, totalJobCount, fileFormat) {
            // Event_Mixin is used here because "declare" does not work properly with updating the completedJobCount
            // to be displayed in the UI
            const mapSeriesJobClazz = Evented_Mixin(class {
                constructor() {
                    this.totalSinglePrintJobCount = totalJobCount;
                    this.completedSinglePrintJobCount = 0;
                    this.downloadFinished = false;
                    this.mapSeriesTitle = mapSeriesTitle;
                    this.resultZipAsBlobs = null;
                    this.legendResultZipAsBlob = null;
                    this.fileFormat = fileFormat;
                    this.failed = false;
                    this.errorMsg = "";
                }
            });
            return new mapSeriesJobClazz();
        },

        _createMapSeriesErrorJob(mapSeriesTitle, fileFormat, message) {
            const mapSeriesJob = this._createMapSeriesJob(mapSeriesTitle, 0, fileFormat);
            this._markMapSeriesJobAsFailed(mapSeriesJob, message);
            return mapSeriesJob;
        },

        _markMapSeriesJobAsFailed(mapSeriesJob, message) {
            mapSeriesJob.failed = true;
            mapSeriesJob.errorMsg = message || "";
            mapSeriesJob.emit("failed");
        }
    }
}
