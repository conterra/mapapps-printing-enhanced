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
import Observers from "apprt-core/Observers";

const _observers = Symbol("_observers");

export default class PrintingPropertiesOverWriter {

    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;

        // watch for changes
        this[_observers] = new Observers();
        this._watchForTemplateInfos(printViewModel);
        this._setDefaultValues(esriPrintWidget.templateOptions);
    }

    deactivate() {
        this[_observers].destroy();
    }

    _setDefaultValues(templateOptions) {
        const properties = this._printingEnhancedProperties._properties;
        if (properties.defaultFormat) {
            templateOptions.format = this._reformatValue(properties.defaultFormat);
        }
        if (properties.defaultTemplate) {
            templateOptions.layout = this._reformatValue(properties.defaultTemplate);
        }
        if (properties.defaultDpi) {
            templateOptions.dpi = properties.defaultDpi;
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
            this._filterChoiceLists(value);
        }));
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
