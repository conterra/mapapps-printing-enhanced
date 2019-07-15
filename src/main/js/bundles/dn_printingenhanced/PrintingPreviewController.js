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
import Connect from "ct/_Connect";
import Observers from "apprt-core/Observers";
import d_aspect from "dojo/aspect";
import ct_when from "ct/_when";

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
        const url = this[_printServiceUrl] = esriPrintWidget.printServiceUrl;
        this[_printInfos] = {};
        ct_when(this._printingInfosAnalyzer.getPrintInfos(url), (printInfos) => {
            this[_printInfos] = printInfos;
            this._handleDrawTemplateDimensions();
        });

        // watch for changes
        this[_observers] = new Observers();
        this._watchForTemplateOptionsChanges(esriPrintWidget);
        this._watchForTemplateInfos(printViewModel);

        this._setDefaultValues(esriPrintWidget.templateOptions);

        // handle print preview before and after printing
        d_aspect.before(printViewModel, "print", () => {
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

    _setDefaultValues(templateOptions) {
        const properties = this._printingEnhancedProperties._properties;
        if (properties.defaultFormat) {
            templateOptions.format = this._reformatValue(properties.defaultFormat);
        }
        if (properties.defaultTemplate) {
            templateOptions.layout = this._reformatValue(properties.defaultTemplate);
        }
    }

    _filterChoiceLists(templatesInfo) {
        const properties = this._printingEnhancedProperties._properties;
        templatesInfo.format.choiceList = this._filterChoiceList(templatesInfo.format.choiceList, properties.hideFormats);
        templatesInfo.layout.choiceList = this._filterChoiceList(templatesInfo.layout.choiceList, properties.hideTemplates);
        return templatesInfo;
    }

    _watchForTemplateInfos(printViewModel) {
        this[_observers].add(printViewModel.watch("templatesInfo", (value) => {
            value = this._filterChoiceLists(value);
            this[_templatesInfo] = value;
        }));
    }

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
    }

    _watchForExtentChange(view) {
        this[_observers].add(view.watch("stationary", (response) => {
            if (response) {
                this._handleDrawTemplateDimensions();
            }
        }));
    }

    _handleDrawTemplateDimensions() {
        const properties = this._printingEnhancedProperties._properties;
        const showPrintPreview = properties.showPrintPreview;
        if (this._tool.active && showPrintPreview) {
            this._printingPreviewDrawer.drawTemplateDimensions(this[_printInfos], this[_templateOptions], properties.defaultPageUnit);
        }
    }

    _filterChoiceList(choiceList, filterList) {
        if (filterList && filterList.length) {
            filterList = filterList.map((format) => {
                return this._reformatValue(format);
            });
            return choiceList.filter((format) => {
                return !filterList.includes(format);
            });
        } else {
            return choiceList;
        }
    }

    _reformatValue(value) {
        value = value.toLowerCase();
        return value.replace(new RegExp(" ", 'g'), "-");
    }
}
