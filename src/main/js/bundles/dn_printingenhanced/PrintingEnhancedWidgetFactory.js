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
import PrintingEnhancedWidget from "./PrintingEnhancedWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";
import apprt_request from "apprt-request";
import ScaleCorrection from "./ScaleCorrection";

export default class PrintingEnhancedWidgetFactory {

    activate() {
        this._initComponent();
    }

    createInstance() {
        const vm = this.vm;
        const widget = new VueDijit(vm, { class: "printing-enhanced-widget" });
        const mapWidgetModel = this._mapWidgetModel;

        const printingPreviewController = this._printingPreviewController;
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const templateOptions = esriPrintWidget.templateOptions;

        this.printingPreviewControllerBinding =
            this._createPrintingPreviewControllerBinding(vm, printingPreviewController);
        this.templateOptionsBinding = this._createTemplateBinding(vm, templateOptions);

        widget.activateTool = () => {
            this.exportedLinksWatcher = esriPrintWidget.exportedLinks.on("after-add", function (event) {
                const item = event.item;
                const exportedItem = {
                    id: item.count,
                    name: item.formattedName,
                    loading: true,
                    error: false,
                    url: ""
                };
                vm.exportedLinks.push(exportedItem);
                const stateWatcher = event.item.watch("state", (state) => {
                    stateWatcher.remove();
                    if (state === "ready") {
                        exportedItem.loading = false;
                        exportedItem.url = apprt_request.getProxiedUrl(item.url);
                    } else if (state === "error") {
                        exportedItem.loading = false;
                        exportedItem.url = null;
                        exportedItem.error = true;
                    }
                });
            });

            // listen to view model methods
            vm.$on('print', () => {
                esriPrintWidget._handlePrintMap();
            });
            vm.$on('resetScale', () => {
                esriPrintWidget._resetToCurrentScale();
            });

            this.currentMapScaleWatchSignal = this._syncViewModelWithCurrentMapScale(vm, mapWidgetModel.view);

            this.printingPreviewControllerBinding.enable()
                .syncToLeftNow();

            this.templateOptionsBinding.enable()
                .syncToLeftNow();
        };
        widget.deactivateTool = () => {
            this.vm.$off();
            this.printingPreviewControllerBinding.disable();
            this.templateOptionsBinding.disable();
            this.exportedLinksWatcher.remove();
        };

        widget.own({
            remove() {
                this.currentMapScaleWatchSignal?.remove();
                this.currentMapScaleWatchSignal = undefined;
                this.printingPreviewControllerBinding.unbind();
                this.printingPreviewControllerBinding = undefined;
                this.templateOptionsBinding.unbind();
                this.templateOptionsBinding = undefined;
                this.vm.$off();
                this.printingPreviewController.resetGraphic();
            }
        });

        return widget;
    }

    _initComponent() {
        const properties = this._printingEnhancedProperties;
        const vm = this.vm = new Vue(PrintingEnhancedWidget);
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;

        if (printViewModel.templatesInfo) {
            this._setTemplatesInfos(printViewModel.templatesInfo);
        } else {
            console.info("templatesInfo not yet available. Did you configure the property 'printtask.service.url` in map.apps' application.properties file? Still waiting for templatesInfo to get available...");
            const watcher = printViewModel.watch("templatesInfo", (templatesInfo) => {
                console.info("templatesInfo now available.");
                this._setTemplatesInfos(templatesInfo);
                watcher.remove();
            });
        }

        vm.i18n = this._i18n.get().ui;
        vm.exportedItems = [];
        const defaultVisibleUiElements = {
            "layoutTab": true,
            "mapOnlyTab": false,
            "title": true,
            "fileName": true,
            "author": true,
            "format": true,
            "widthAndHeight": true,
            "dpi": true,
            "layout": true,
            "printPreviewCheckbox": false,
            "scaleEnabled": false,
            "scale": true,
            "copyright": false,
            "legendEnabled": false,
            "attributionEnabled": false
        };
        vm.visibleUiElements = { ...defaultVisibleUiElements, ...properties.visibleUiElements };
        vm.dpiValues = properties.dpiValues;
        vm.scaleValues = properties.scaleValues;
        vm.enablePrintPreview = properties.enablePrintPreview;
    }

    _syncViewModelWithCurrentMapScale(vm, mapView) {
        return mapView.watch("scale", () => {
            const mapWidgetModel = this._mapWidgetModel;
            const correctedScale = new ScaleCorrection().computedScale(mapWidgetModel.view, mapWidgetModel.extent, mapWidgetModel.spatialReference);
            vm.currentMapScale = Math.round(correctedScale);
        });
    }

    _createPrintingPreviewControllerBinding(vm, printingPreviewController) {
        return Binding.for(vm, printingPreviewController)
            .syncToRight("enablePrintPreview", "drawPrintPreview", (enablePrintPreview) => {
                if (enablePrintPreview && vm.scaleEnabled) {
                    return true;
                } else {
                    return false;
                }
            })
            .syncToRight("scaleEnabled", "drawPrintPreview", (scaleEnabled) => {
                if (scaleEnabled && vm.enablePrintPreview) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    _createTemplateBinding(vm, templateOptions) {
        return Binding.for(vm, templateOptions)
            .syncAll("attributionEnabled", "author", "copyright", "dpi", "fileName", "forceFeatureAttributes",
                "format", "height", "layout", "legendEnabled", "scale", "scaleEnabled", "title", "width");
    }

    _setTemplatesInfos(templatesInfo) {
        this.vm.formatList = templatesInfo.format.choiceList.map((format) => {
            return {
                value: format,
                text: format.toUpperCase()
            };
        });
        const layoutStrings = this._i18n.get().ui.layouts;
        this.vm.layoutList = templatesInfo.layout.choiceList.map((layout) => {
            return {
                value: layout,
                text: layoutStrings[layout] || layout
            };
        });
    }
}
