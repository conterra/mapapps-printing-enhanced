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
import { getProxiedUrl } from "apprt-fetch";
import ScaleCorrection from "./ScaleCorrection";

export default class PrintingEnhancedWidgetFactory {

    activate() {
        this._initComponent();
        this._scaleCorrection = new ScaleCorrection();
    }

    createInstance() {
        const vm = this.vm;
        const widget = new VueDijit(vm, { class: "printing-enhanced-widget" });
        const mapWidgetModel = this.mapWidgetModel;
        const printingPreviewController = this._printingPreviewController;
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        this._ensureTemplateOptionsBinding(vm);

        this.printingPreviewControllerBinding = Binding.for(vm, printingPreviewController)
            .syncToRight("enablePrintPreview", "drawPrintPreview", (enablePrintPreview) => {
                return !!(enablePrintPreview && vm.scaleEnabled);
            })
            .syncToRight("scaleEnabled", "drawPrintPreview", (scaleEnabled) => {
                return !!(scaleEnabled && vm.enablePrintPreview);
            });

        widget.activateTool = () => {
            const templateOptions = this._ensureTemplateOptionsBinding(vm);
            this.exportedLinksWatcher = esriPrintWidget.exportedLinks.on("after-add", (event) => {
                const item = event.item;
                const liveTemplateOptions = this._getTemplateOptions() || templateOptions;
                const format = liveTemplateOptions?.format || vm.format || "pdf";
                // "Nur Karte" tab uses fileName; other tabs use title
                const baseName =
                    vm.activeTab === 1
                        ? liveTemplateOptions?.fileName ||
                          liveTemplateOptions?.title ||
                          item.formattedName
                        : liveTemplateOptions?.title ||
                          liveTemplateOptions?.fileName ||
                          item.formattedName;
                // Remove file extension if already present
                const extension = "." + String(format).toLowerCase();
                const name = baseName.toLowerCase().includes(extension)
                    ? baseName
                    : baseName + extension;
                const exportedItem = {
                    id: item.formattedName,
                    name: name,
                    loading: true,
                    error: false,
                    url: ""
                };
                vm.exportedLinks.push(exportedItem);

                let resolved = false;
                const applyReady = (url) => {
                    if (resolved) return;
                    resolved = true;
                    exportedItem.loading = false;
                    exportedItem.error = false;
                    exportedItem.url = String(getProxiedUrl(url));
                };
                const applyError = () => {
                    exportedItem.loading = false;
                    exportedItem.url = "";
                    exportedItem.error = true;
                };

                event.item.watch("state", (state) => {
                    if (state === "ready") {
                        applyReady(item.url);
                    } else if (state === "error") {
                        applyError();
                    }
                });
                event.item.watch("url", (url) => {
                    if (url) {
                        applyReady(url);
                    }
                });
                if (item.url) {
                    applyReady(item.url);
                } else if (item.state === "ready") {
                    applyReady(item.url);
                } else if (item.state === "error") {
                    applyError();
                }
            });

            this.currentMapScaleWatchSignal = this._syncViewModelWithCurrentMapScale(
                vm,
                mapWidgetModel.view
            );

            this.printingPreviewControllerBinding.enable().syncToLeftNow();
            if (templateOptions) {
                this.templateOptionsBinding.enable().syncToLeftNow();
            }
        };
        widget.deactivateTool = () => {
            this.currentMapScaleWatchSignal?.remove();
            this.currentMapScaleWatchSignal = undefined;
            this.printingPreviewControllerBinding.disable();
            this.templateOptionsBinding.disable();
            this.exportedLinksWatcher?.remove();
        };

        widget.own({
            remove: () => {
                this.currentMapScaleWatchSignal?.remove();
                this.printingPreviewControllerBinding?.unbind();
                this.templateOptionsBinding?.unbind();
                vm.$off();
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
        vm.exportedLinks = [];
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

        // listen to view model methods
        vm.$on("print", () => {
            esriPrintWidget._handlePrintMap();
        });

        vm.$on("resetScale", () => {
            esriPrintWidget._resetToCurrentScale();
        });
    }

    _syncViewModelWithCurrentMapScale(vm, mapView) {
        return mapView.watch("scale", () => {
            const mapWidgetModel = this.mapWidgetModel;
            const correctedScale = this._scaleCorrection.computedScale(
                mapWidgetModel.view,
                mapWidgetModel.extent,
                mapWidgetModel.spatialReference
            );
            vm.currentMapScale = Math.round(correctedScale);
        });
    }

    _getTemplateOptions() {
        return this._printingWidget?._esriWidget?.templateOptions;
    }

    _createTemplateOptionsBinding(vm, templateOptions) {
        return Binding.for(vm, templateOptions).syncAll(
            "attributionEnabled",
            "author",
            "copyright",
            "dpi",
            "fileName",
            "forceFeatureAttributes",
            "format",
            "height",
            "layout",
            "legendEnabled",
            "scale",
            "scaleEnabled",
            "title",
            "width"
        );
    }

    _ensureTemplateOptionsBinding(vm = this.vm) {
        const templateOptions = this._getTemplateOptions();
        if (!templateOptions || !vm) {
            return templateOptions;
        }
        if (this.templateOptionsBinding && templateOptions === this._templateOptions) {
            return templateOptions;
        }

        this.templateOptionsBinding?.disable();
        this.templateOptionsBinding?.unbind();
        this._templateOptions = templateOptions;
        this.templateOptionsBinding = this._createTemplateOptionsBinding(vm, templateOptions);
        return templateOptions;
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
