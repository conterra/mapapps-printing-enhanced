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
import LayoutHelper from "./LayoutHelper";

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

    setUserService(userService) {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const properties = this._printingEnhancedProperties._properties;
        if (properties.useUsernameAsAuthor) {
            const authentication = userService.getAuthentication();
            if (!authentication.isAuthenticated()) {
                console.log("User not authenticated!");
                return;
            }
            const user = authentication.getUser();
            let username = "";
            properties.usernameAttributes.forEach(function (nameAttribute) {
                username += user.get(nameAttribute);
                username += " ";
            });
            username = username.trim();
            if (username.length === 0) {
                username = user.getName();
            }
            esriPrintWidget.templateOptions.author = username;
        }
    }

    _setDefaultValues(templateOptions) {
        const properties = this._printingEnhancedProperties._properties;
        if (properties.defaultFormat) {
            templateOptions.format = properties.defaultFormat.toLowerCase();
        }
        if (properties.defaultTemplate) {
            templateOptions.layout = LayoutHelper.getLayoutId(properties.defaultTemplate);
        }
        if (properties.defaultDpi) {
            templateOptions.dpi = properties.defaultDpi;
        }
    }

    _filterChoiceLists(templatesInfo) {
        const properties = this._printingEnhancedProperties._properties;
        templatesInfo.format.choiceList = this._filterFormatChoiceList(templatesInfo.format.choiceList, properties.hideFormats);
        templatesInfo.layout.choiceList = this._filterLayoutChoiceList(templatesInfo.layout.choiceList, properties.hideTemplates);
        return templatesInfo;
    }

    _watchForTemplateInfos(printViewModel) {
        this[_observers].add(printViewModel.watch("templatesInfo", (value) => {
            this._filterChoiceLists(value);
        }));
    }

    _filterFormatChoiceList(choiceList, filterList) {
        if (filterList && filterList.length) {
            filterList = filterList.map((format) => format.toLowerCase());
            return choiceList.filter((format) => !filterList.includes(format));
        } else {
            return choiceList;
        }
    }

    _filterLayoutChoiceList(choiceList, filterList) {
        if (filterList && filterList.length) {
            filterList = filterList.map((format) => LayoutHelper.getLayoutId(format));
            return choiceList.filter((format) => !filterList.includes(format));
        } else {
            return choiceList;
        }
    }
}
