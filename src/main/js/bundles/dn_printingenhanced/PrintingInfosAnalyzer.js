/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
import apprt_when from "apprt-core/when";
import apprt_request from "apprt-request";
import Geoprocessor from "esri/tasks/Geoprocessor";

const _printInfos = Symbol("_printInfos");

export default class PrintingInfosAnalyzer {

    getPrintInfos(url) {
        // check if printInfos are cached
        if (this[_printInfos]) {
            return this[_printInfos];
        }
        // otherwise request them from server
        return apprt_when(apprt_request(url, {
            "query": {
                "f": "json"
            }
        }), function (printInfos) {
            // side effect (cache infos and template infos)
            this[_printInfos] = printInfos;
            return apprt_when(this._fetchTemplateInfos(url), function (templateInfos) {
                printInfos.templateInfos = templateInfos;
                return printInfos;
            }, function () {
                // ignore missing template info
                return printInfos;
            }, this);
        }, function (error) {
            this._printError(error);
            this.onPrintInfosError({
                src: this,
                error: error
            });
            throw error;
        }, this);
    }

    _fetchTemplateInfos(url) {
        const properties = this._printingEnhancedProperties._properties;
        const printUrl = url;
        const templateUrl = printUrl.substr(0, printUrl.lastIndexOf("/") + 1) + properties.layoutTemplatesInfoTaskName;
        const gp = Geoprocessor(templateUrl);
        if (this._isAsync()) {
            return this._fetchTemplateInfosAsync(gp);
        } else {
            return this._fetchTemplateInfosSync(gp);
        }
    }

    _fetchTemplateInfosSync(gp) {
        return gp.execute({}).then((response) => {
            return response.results[0].value;
        });
    }

    _fetchTemplateInfosAsync(gp) {
        const properties = this._printingEnhancedProperties._properties;
        const outputParamName = properties.layoutTemplatesInfoTaskResultParameter || "Output_JSON";
        return new Promise((resolve, reject) => {
            gp.submitJob({}).then((jobInfo) => {
                if (jobInfo.jobStatus === "job-succeeded") {
                    gp.getResultData(jobInfo.jobId, outputParamName).then((results) => {
                        resolve(results.value);
                    });
                } else if (jobInfo.jobStatus === "job-failed") {
                    reject(jobInfo.messages[0]);
                }
            });
        });
    }

    _isAsync() {
        const infos = this[_printInfos];
        if (infos) {
            return infos.executionType !== "esriExecutionTypeSynchronous";
        }
    }

    _printError(error) {
        const i18nErrors = this._i18n.get().ui.error;
        let errorMsg = i18nErrors.unknown;
        const errorCode = error.status;
        const customError = i18nErrors["code" + errorCode];
        if (customError) {
            errorMsg = customError;
        }
        console.error(errorMsg, error);
        if (this._logger) {
            this._logger.error(errorMsg, error.toString(), error);
        }
    }
}
