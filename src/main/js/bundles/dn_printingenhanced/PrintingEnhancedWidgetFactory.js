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
import TimeSliderWidget from "./PrintingEnhancedWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";
import ct_when from "ct/_when";

export default class PrintingEnhancedWidgetFactory {

    activate() {
        this._initComponent();
    }

    createInstance() {
        return new VueDijit(this.vm);
    }

    _initComponent() {
        const vm = this.vm = new Vue(TimeSliderWidget);
        const printWidget = this._printingWidget;
        const printingPreviewController = this._printingPreviewController;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;
        const templateOptions = esriPrintWidget.templateOptions;
        const url = esriPrintWidget.printServiceUrl;

        esriPrintWidget.exportedLinks.on("after-add", function (event) {
            const item = event.item;
            const exportedItem = {
                id: item.count,
                name: item.formattedName,
                loading: true,
                error: false,
                url: ""
            };
            vm.exportedLinks.push(exportedItem);
            event.item.watch("state", (state) => {
                if (state === "ready") {
                    exportedItem.loading = false;
                    exportedItem.url = item.url;
                } else if (state === "error") {
                    exportedItem.loading = false;
                    exportedItem.url = null;
                    exportedItem.error = true;
                }
            });
        });

        ct_when(this._printingInfosAnalyzer.getPrintInfos(url), (printInfos) => {
            const templateInfos = printInfos.templateInfos;
            if (printViewModel.templatesInfo) {
                this._setTemplatesInfos(templateInfos, printViewModel.templatesInfo);
            }
            printViewModel.watch("templatesInfo", (templatesInfo) => {
                this._setTemplatesInfos(templateInfos, templatesInfo);
            });
        });

        vm.i18n = this._i18n.get().ui;
        vm.exportedItems = [];
        // listen to view model methods
        vm.$on('startup', () => {

        });
        vm.$on('print', () => {
            esriPrintWidget._handlePrintMap();
        });
        vm.$on('resetScale', () => {
            esriPrintWidget._resetToCurrentScale();
        });

        Binding.for(vm, printingPreviewController)
            .syncAll("showPrintPreview")
            .enable()
            .syncToLeftNow();

        Binding.for(vm, printViewModel)
            .syncAllToLeft("templatesInfo")
            .enable()
            .syncToLeftNow();

        Binding.for(vm, templateOptions)
            .syncAll("attributionEnabled", "author", "copyright", "dpi", "forceFeatureAttributes", "format", "height", "layout", "legendEnabled", "scale", "scaleEnabled", "title", "width")
            .enable()
            .syncToLeftNow();
    }

    _setTemplatesInfos(templateInfos, templatesInfo) {
        this.vm.formatList = templatesInfo.format.choiceList.map((format) => {
            return {
                value: format,
                text: format.toUpperCase()
            }
        });
        const layoutStrings = this._i18n.get().ui.layouts;
        this.vm.layoutList = templatesInfo.layout.choiceList.map((layout) => {
            return {
                value: layout,
                text: layoutStrings[layout] || layout
            }
        });
    }
}
