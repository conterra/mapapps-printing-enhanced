/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
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

export default class PrintingPropertiesOverWriter {

    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;

        this._watchForTemplateInfos(printViewModel);
        this._setDefaultValues(esriPrintWidget.templateOptions);
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
            templateOptions.format = properties.defaultFormat;
        }
        if (properties.defaultLayout) {
            templateOptions.layout = properties.defaultLayout;
        }
        if (properties.defaultDpi) {
            templateOptions.dpi = properties.defaultDpi;
        }
    }

    _watchForTemplateInfos(printViewModel) {
        if (printViewModel.templatesInfo) {
            this._filterChoiceLists(printViewModel.templatesInfo);
        } else {
            const watcher = printViewModel.watch("templatesInfo", (templatesInfo) => {
                this._filterChoiceLists(templatesInfo);
                watcher.remove();
            });
        }
    }

    _filterChoiceLists(templatesInfo) {
        const properties = this._printingEnhancedProperties._properties;
        templatesInfo.format.choiceList = this._filterChoiceList(templatesInfo.format.choiceList, properties.allowedFormats);
        templatesInfo.layout.choiceList = this._filterChoiceList(templatesInfo.layout.choiceList, properties.allowedLayouts);
        return templatesInfo;
    }

    _filterChoiceList(choiceList, allowedList) {
        if (allowedList === "all") {
            return choiceList;
        } else {
            return choiceList.filter((format) => allowedList.includes(format));
        }
    }

}
