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
import ct_when from "ct/_when";
import Connect from "ct/_Connect";
import apprt_request from "apprt-request";
import Observers from "apprt-core/Observers";
import Deferred from "dojo/Deferred";
import d_aspect from "dojo/aspect";
import Geoprocessor from "esri/tasks/Geoprocessor";

const _templateOptions = Symbol("_templateOptions");
const _printInfos = Symbol("_printInfos");
const _printServiceUrl = Symbol("_printServiceUrl");
const _templatesInfo = Symbol("_templatesInfo");
const _connect = Symbol("_connect");
const _observers = Symbol("_observers");

export default class PrintingPreviewController {

    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;

        // get print infos
        let url = this[_printServiceUrl] = esriPrintWidget.printServiceUrl;
        this[_printInfos] = this._getPrintInfos(url).then(() => {
            this._handleDrawTemplateDimensions();
        });

        // watch for changes
        this[_observers] = new Observers();
        this._watchForPrintTemplateChanges(esriPrintWidget);
        this._watchForTemplateInfos(printViewModel);

        // handle print preview before and after printing
        d_aspect.before(printViewModel, "print", (args) => {
            this._printingPreviewDrawer.removeGraphicFromView();
        });
        d_aspect.after(printViewModel, "print", (promise) => {
            promise.then(() => {
                this._handleDrawTemplateDimensions();
            });
            return promise;
        });
    }

    deactivate() {
        this._printingPreviewDrawer.removeGraphicFromView();
        this[_connect].disconnect();
        this[_observers].destroy();
    }

    setMapWidgetModel(mapWidgetModel) {
        if (mapWidgetModel.view) {
            this._watchForExtentChange(mapWidgetModel.view);
        } else {
            mapWidgetModel.watch("view", ({value: view}) => {
                this._watchForExtentChange(view)
            });
        }
    }

    setTool(tool) {
        this._tool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onActivate", () => {
            this._handleDrawTemplateDimensions();
        });
        connect.connect(tool, "onDeactivate", () => {
            this._printingPreviewDrawer.removeGraphicFromView();
        });
    }

    _watchForTemplateInfos(printViewModel) {
        this[_observers].add(printViewModel.watch("templatesInfo", (value) => {
            this[_templatesInfo] = value;
        }));
    }

    _watchForPrintTemplateChanges(esriPrintWidget) {
        let templateOptions = this[_templateOptions] = esriPrintWidget.templateOptions;
        this[_observers].add(templateOptions.watch("layout", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("scale", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("scaleEnabled", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("width", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("height", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("dpi", () => {
            this._handleDrawTemplateDimensions();
        }));
    }

    _watchForExtentChange(view) {
        this[_observers].add(view.watch("stationary", (response) => {
            if (response) {
                this._handleDrawTemplateDimensions();
            }
        }));
        /*this[_observers].add(view.watch("interacting", (response) => {
            if (response) {
                this._printingPreviewDrawer.removeGraphicFromView();
            }
        }));*/
    }

    _handleDrawTemplateDimensions() {
        const properties = this._properties;
        const showPrintPreview = properties.showPrintPreview;
        if (this._tool.active && showPrintPreview) {
            this._printingPreviewDrawer.drawTemplateDimensions(this[_printInfos], this[_templateOptions], this._properties.defaultPageUnit);
        }
    }

    _getPrintInfos(url) {
        // check if printInfos are cached
        if (this[_printInfos]) {
            return this[_printInfos];
        }
        // otherwise request them from server
        return ct_when(apprt_request(url, {
            "query": {
                "f": "json"
            }
        }), function (printInfos) {
            // side effect (cache infos and template infos)
            this[_printInfos] = printInfos;
            return ct_when(this._fetchTemplateInfos(url), function (templateInfos) {
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
        let that = this;
        let properties = that._properties;
        let printUrl = url;
        let templateUrl = printUrl.substr(0, printUrl.lastIndexOf("/") + 1) + properties.layoutTemplatesInfoTaskName;
        let gp = Geoprocessor(templateUrl);
        if (this._isAsync()) {
            return that._fetchTemplateInfosAsync(gp);
        } else {
            return that._fetchTemplateInfosSync(gp);
        }
    }

    _fetchTemplateInfosSync(gp) {
        return gp.execute({}).then((response) => {
            return response.results[0].value;
        });
    }

    _fetchTemplateInfosAsync(gp) {
        let outputParamName = this._properties.layoutTemplatesInfoTaskResultParameter || "Output_JSON";
        let deferred = new Deferred();
        gp.submitJob({},
            (jobInfo) => {
                gp.getResultData(jobInfo.jobId, outputParamName, (results) => {
                    deferred.resolve(results.value);
                });
            },
            () => {
                // progress ignored
            },
            (error) => {
                // try to fetch sync
                deferred.reject(error);
            });
        return deferred;
    }

    _isAsync() {
        let infos = this._printInfos;
        if (infos) {
            return infos.executionType !== "esriExecutionTypeSynchronous";
        }
        // fallback to async flag
        return !!this._properties.async;
    }

    _printError(error) {
        let i18nErrors = this._i18n.get().ui.error;
        let errorMsg = i18nErrors.unknown;
        let errorCode = error.status;
        let customError = i18nErrors["code" + errorCode];
        if (customError) {
            errorMsg = customError;
        }
        console.error(errorMsg, error);
        if (this._logger) {
            this._logger.error(errorMsg, error.toString(), error);
        }
    }
}
