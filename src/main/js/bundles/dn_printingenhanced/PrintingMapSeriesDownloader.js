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
import Promise from "bluebird";
import {Evented_Mixin} from "apprt-core/Events";
import {apprtFetch, ContentType} from "apprt-fetch";
import {createFormData} from "./utils";
import { apprtFetchJson } from "apprt-fetch";

export default function () {
    return {
        async downloadMapSeries(mapSeriesPrintingRequests, mapSeriesTitle, legendExtent, esriPrintWidget, vm, templateOptions, properties, numberOfConcurrentRequests, printRunOptions) {
            if (!mapSeriesPrintingRequests || mapSeriesPrintingRequests.length === 0)
                return this._createMapSeriesErrorJob(this._i18n.get().mapSeriesRequestsInvalid);

            numberOfConcurrentRequests = numberOfConcurrentRequests ?? this._properties.numberOfConcurrentDownloads;

            const stablePrintRunOptions = this._createStablePrintRunOptions(vm, printRunOptions);

            let totalLegendJobsCounts; // legend request is started below (need to wait for series print jobs to be finished before printing legend)
            stablePrintRunOptions.legendEnabled ? totalLegendJobsCounts = 1 : totalLegendJobsCounts = 0;

            let totalJobCount = mapSeriesPrintingRequests.length + totalLegendJobsCounts;
            const mapSeriesJob = this._createMapSeriesJob(mapSeriesTitle, totalJobCount, templateOptions.format);

            const that = this;
            const resultInfos = this._executeAndDownloadConcurrentMapSeriesPrintingRequests(
                mapSeriesJob, mapSeriesPrintingRequests, numberOfConcurrentRequests
            );
            resultInfos.then(async (resultInfos) => {
                // need to wait for series print jobs to be finished before printing legend
                let legendResultInfos;
                if (stablePrintRunOptions.legendEnabled) {
                    legendResultInfos = await this._executeMapSeriesLegendRequest(esriPrintWidget, vm, templateOptions, properties, mapSeriesJob, legendExtent, stablePrintRunOptions);
                    if (!legendResultInfos) {
                        // there was an error, which should not block the download of the map series
                        mapSeriesJob.completedSinglePrintJobCount = mapSeriesJob.completedSinglePrintJobCount + 1;
                    }
                }

                mapSeriesJob.resultZipAsBlobs = resultInfos;

                if (legendResultInfos) {
                    const legendBlobs = await that._downloadAndZipHelper.downloadAsBlobs([legendResultInfos], numberOfConcurrentRequests, vm);
                    if (legendBlobs.length > 0) {
                        mapSeriesJob.legendResultZipAsBlob = legendBlobs[0];
                    }
                }

                mapSeriesJob.downloadFinished = true;
                mapSeriesJob.emit("downloadFinished");
            }, error => {
                console.error(error);
                this._logService.error(this._i18n.get().ui.errors.error);
            })
            return mapSeriesJob;
        },

        async _executeMapSeriesLegendRequest(esriPrintWidget, vm, templateOptions, properties, mapSeriesJob, legendExtent, stablePrintRunOptions) {
            let legendPrintingRequest = await this._createLegendRequestBlueprint(esriPrintWidget, vm, templateOptions, properties, legendExtent, stablePrintRunOptions);
            if (!legendPrintingRequest) { // no legend printed
                this._attachCompletionCountFunction(mapSeriesJob, new Promise((res, rej) => {
                    res()
                }));
                return
            }

            const formData = createFormData(legendPrintingRequest.body);
            const requestPromise = apprtFetch(legendPrintingRequest.url, {
               method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "Accept": ContentType.JSON
                },
                timeoutMillis: this._properties.printingRequestTimeout,
                proxyMode: "force-off"
            });

            this._attachCompletionCountFunction(mapSeriesJob, requestPromise);

            return requestPromise.then(async (res) => {
                const responseJson = await res.json();
                const resultUrl = await this._extractResultURLFromResponse(responseJson, legendPrintingRequest.url);
                if (!resultUrl) {
                    return;
                }
                return {
                    url: resultUrl,
                    fileName: `${this._properties.legendFileNamePrefix}.${mapSeriesJob.fileFormat}`
                };
            }, (err) => {
                console.error(err);
                this._logService.error(this._i18n.get().ui.errors.error);
            });
        },

        _createStablePrintRunOptions(vm, printRunOptions) {
            const legendEnabledValue =
                printRunOptions?.legendEnabled !== undefined
                    ? printRunOptions.legendEnabled
                    : vm.mapSeriesLegendEnabled !== undefined
                        ? vm.mapSeriesLegendEnabled
                        : vm.legendEnabled;

            return {
                legendEnabled: this._toBoolean(legendEnabledValue, true)
            };
        },

        _toBoolean(value, fallback = false) {
            if (value === undefined || value === null) {
                return fallback;
            }
            if (typeof value === "string") {
                const normalized = value.trim().toLowerCase();
                if (normalized === "true") {
                    return true;
                }
                if (normalized === "false") {
                    return false;
                }
            }
            return Boolean(value);
        },

        /**
         * Creates a blueprint for a legend request based on the previous map image blueprint which had to run first!
         * This is done manually to avoid the expensive legend request to be done twice because canceling the request
         * of a blueprint cannot be done right now (see https://conterrade.atlassian.net/browse/MAPAPPS-6898
         */
        async _createLegendRequestBlueprint(esriPrintWidget, vm, templateOptions, properties, legendExtent, stablePrintRunOptions) {
            let legendTitle = templateOptions.title || properties.legend.legendNameIfNoneIsGiven;
            legendTitle += properties.legend.legendTitleAppendText;

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
            return Promise.map(
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
                {concurrency: numberOfConcurrentRequests}
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
                await new globalThis.Promise(resolve => setTimeout(resolve, interval));
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
                    this.errorMsg = "";
                }
            });
            return new mapSeriesJobClazz();
        },

        _createMapSeriesErrorJob(message) {
            return {
                totalSinglePrintJobCount: 0,
                completedSinglePrintJobCount: 0,
                downloadFinished: true,
                mapSeriesTitle: "",
                resultZipAsBlobs: null,
                legendResultZipAsBlob: null,
                fileFormat: "",
                errorMsg: message
            };
        }
    }
}
