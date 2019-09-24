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
import {declare} from "apprt-core/Mutable";
import Connect from "ct/_Connect";
import Observers from "apprt-core/Observers";
import d_aspect from "dojo/aspect";
import apprt_when from "apprt-core/when";

const _templateOptions = Symbol("_templateOptions");
const _printInfos = Symbol("_printInfos");
const _printServiceUrl = Symbol("_printServiceUrl");
const _connect = Symbol("_connect");
const _observers = Symbol("_observers");

export default declare({

    showPrintPreview: false,

    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;
        const properties = this._printingEnhancedProperties._properties;
        this.showPrintPreview = properties.showPrintPreview;

        // get print infos
        const url = this[_printServiceUrl] = esriPrintWidget.printServiceUrl;
        this[_printInfos] = {};
        apprt_when(this._printingInfosAnalyzer.getPrintInfos(url), (printInfos) => {
            this[_printInfos] = printInfos;
            this._handleDrawTemplateDimensions();
        });

        // watch for changes
        this[_observers] = new Observers();
        this._watchForTemplateOptionsChanges(esriPrintWidget);

        // handle print preview before and after printing
        d_aspect.before(printViewModel, "print", () => {
            this._printingPreviewDrawer.showGraphicsLayer(false);
        });
        d_aspect.after(printViewModel, "print", (promise) => {
            /*promise.then(() => {
                this._handleDrawTemplateDimensions();
            });*/
            setTimeout(() => {
                this._printingPreviewDrawer.showGraphicsLayer(true);
            }, 1000);
            return promise;
        });

        this.watch("showPrintPreview", (args) => {
            this._handleDrawTemplateDimensions();
        })
    },

    deactivate() {
        this._printingPreviewDrawer._removeGraphicFromGraphicsLayer();
        this[_connect].disconnect();
        this[_observers].destroy();
    },

    setMapWidgetModel(mapWidgetModel) {
        if (mapWidgetModel.view) {
            this._watchForExtentChange(mapWidgetModel.view);
        } else {
            mapWidgetModel.watch("view", ({value: view}) => {
                this._watchForExtentChange(view)
            });
        }
    },

    setPrintingToggleTool(tool) {
        this._printingToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onActivate", () => {
            this._handleDrawTemplateDimensions();
        });
        connect.connect(tool, "onDeactivate", () => {
            this._printingPreviewDrawer._removeGraphicFromGraphicsLayer();
        });
    },

    setPrintingEnhancedToggleTool(tool) {
        this._printingEnhancedToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onActivate", () => {
            this._handleDrawTemplateDimensions();
        });
        connect.connect(tool, "onDeactivate", () => {
            this._printingPreviewDrawer._removeGraphicFromGraphicsLayer();
        });
    },

    _watchForTemplateOptionsChanges(esriPrintWidget) {
        const templateOptions = this[_templateOptions] = esriPrintWidget.templateOptions;
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
    },

    _watchForExtentChange(view) {
        const properties = this._printingEnhancedProperties;
        if (!properties.allowSketching) {
            this[_observers].add(view.watch("stationary", (response) => {
                if (response) {
                    this._handleDrawTemplateDimensions();
                }
            }));
        }
    },

    _handleDrawTemplateDimensions() {
        this._printingPreviewDrawer._removeGraphicFromGraphicsLayer();
        const properties = this._printingEnhancedProperties._properties;
        if ((this._printingToggleTool.active || this._printingEnhancedToggleTool.active) && this.showPrintPreview) {
            this._printingPreviewDrawer.drawTemplateDimensions(this[_printInfos], this[_templateOptions], properties.defaultPageUnit);
        }
    },

    _reformatValue(value) {
        value = value.toLowerCase();
        return value.replace(new RegExp(" ", 'g'), "-");
    }
});
