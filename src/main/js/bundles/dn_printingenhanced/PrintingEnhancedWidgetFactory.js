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
import CustomTextElementsMapper from "./CustomTextElementsMapper";
import { getProxiedUrl } from "apprt-fetch";
import ScaleCorrection from "./ScaleCorrection";
import PrintTemplate from "@arcgis/core/rest/support/PrintTemplate";
import { normalizeLegendValue } from "./LegendValue";

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
            .syncToRight("enablePrintPreview", "drawPrintPreview", (enablePrintPreview) => !!(enablePrintPreview && vm.scaleEnabled))
            .syncToRight("scaleEnabled", "drawPrintPreview", (scaleEnabled) => !!(scaleEnabled && vm.enablePrintPreview));

        widget.activateTool = () => {
            const templateOptions = this._ensureTemplateOptionsBinding(vm);
            this.exportedLinksWatcher = esriPrintWidget.exportedLinks.on("after-add", (event) => {
                const item = event.item;
                const liveTemplateOptions = this._getTemplateOptions() || templateOptions;
                const format = liveTemplateOptions?.format || vm.format || "pdf";
                // "Nur Karte" tab uses fileName; other tabs use title
                const baseName =
                    vm.activeTab === "mapOnly"
                        ? liveTemplateOptions?.fileName ||
                          liveTemplateOptions?.title ||
                          item.formattedName
                        : liveTemplateOptions?.title ||
                          liveTemplateOptions?.fileName ||
                          item.formattedName;
                // Remove file extension if already present
                const extension = "." + String(format).toLowerCase();
                const name = baseName.toLowerCase().endsWith(extension)
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
                    exportedItem.url = null;
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
            vm.legendValue = this._normalizeLegendValue(vm.legendValue);
        };
        widget.deactivateTool = () => {
            this.currentMapScaleWatchSignal?.remove();
            this.currentMapScaleWatchSignal = undefined;
            this.printingPreviewControllerBinding?.disable();
            this.templateOptionsBinding?.disable();
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
        // Always install wrapper. It keeps default behavior, but allows controlled fallback
        // template creation for selected edge cases (e.g. MAP_ONLY legend print).
        this._patchToPrintTemplate(printViewModel, esriPrintWidget);

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
        // Deriving the layout from page size/orientation is opt-in: apps that don't set
        // deriveLayoutFromPageSize keep the original layout dropdown and manual selection.
        const deriveLayoutFromPageSize = !!properties.deriveLayoutFromPageSize;
        const defaultVisibleUiElements = {
            "layoutTab": true,
            "mapOnlyTab": false,
            "title": true,
            "fileName": true,
            "author": true,
            "format": true,
            "widthAndHeight": true,
            "dpi": true,
            "layout": !deriveLayoutFromPageSize,
            "pageSizeOrientation": deriveLayoutFromPageSize,
            "printPreviewCheckbox": false,
            "scaleEnabled": false,
            "scale": true,
            "copyright": false,
            "legendEnabled": true,
            "legendModes": ["integratedLegend", "noLegend"],
            "attributionEnabled": false
        };
        vm.visibleUiElements = { ...defaultVisibleUiElements, ...properties.visibleUiElements };
        vm.dpiValues = properties.dpiValues;
        vm.scaleValues = properties.scaleValues;
        vm.enablePrintPreview = properties.enablePrintPreview;
        vm.pagePrintOrientationValues = properties.printOrientations;
        vm.pagePrintSizeValues = properties.printSizes;
        const interactiveCustomTextElements = properties.customTextElements.filter(
            (element) => "elementFieldName" in element
        );
        vm.customTextElements = CustomTextElementsMapper.addValuePropertyToTextElements(
            interactiveCustomTextElements
        );
        vm.mapOnlyLayoutName = properties.layoutNames.mapOnly;

        // Watch page size/orientation to update layout name and redraw print preview
        vm.$watch("pagePrintOrientation", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            this._setLayoutName(vm, templateOptions, properties);
            this._printingPreviewController._handleDrawTemplateDimensions(true);
        });
        vm.$watch("pagePrintSize", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            this._setLayoutName(vm, templateOptions, properties);
            this._printingPreviewController._handleDrawTemplateDimensions(true);
        });

        // Tab change handler
        vm.$on("activate-tab-changed", (activeTab) => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                this._lastActiveTab = activeTab;
                return;
            }
            if (activeTab !== "results") {
                this._setLayoutName(vm, templateOptions, properties);
            }
            this._lastActiveTab = activeTab;
        });

        vm.$watch("legendValue", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            this._setLayoutName(vm, templateOptions, properties);
        });

        // listen to view model methods
        vm.$on("print", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            // Ensure layout is always set before printing
            this._setLayoutName(vm, templateOptions, properties);
            const legendValue = this._normalizeLegendValue(
                vm.legendValue,
                vm.activeTab === "mapOnly"
            );
            const printContext = {
                activeTab: vm.activeTab,
                legendValue,
                layoutBeforePrint: templateOptions.layout,
                titleBeforePrint: templateOptions.title,
                fileNameBeforePrint: templateOptions.fileName
            };
            if (vm.activeTab !== "mapOnly") {
                templateOptions.legendEnabled = legendValue === "integratedLegend";
            }
            esriPrintWidget._handlePrintMap();
            if (legendValue === "legendOwnPage") {
                setTimeout(() => {
                    this._printLegend(
                        esriPrintWidget,
                        vm,
                        templateOptions,
                        properties,
                        printContext
                    );
                }, properties.legend.legendPrintRequestDelayInMs);
            }
        });

        vm.$on("resetScale", () => {
            esriPrintWidget._resetToCurrentScale();
        });

        vm.$on("trigger-custom-text-elements-update", (ourCustomTextElements) => {
            this._updateCustomTextElementsInTemplateOptions(ourCustomTextElements);
        });

        this._initDefaultValues(vm, this._getTemplateOptions(), properties);
    }

    _normalizeLegendValue(legendValue, forMapOnly = false) {
        const legendModes = this.vm?.visibleUiElements?.legendModes ?? [];
        return normalizeLegendValue(legendValue, legendModes, forMapOnly);
    }

    _updateCustomTextElementsInTemplateOptions(ourCustomTextElements) {
        const esriCustomTextElements =
            CustomTextElementsMapper.mapToEsriCustomTextElements(ourCustomTextElements);
        this._eventService.sendEvent("dn_printingenhanced/CUSTOM_TEXTELEMENTS", {
            customTextElements: esriCustomTextElements
        });
    }

    _setLayoutName(vm, templateOptions, enhancedProperties) {
        const legendValue = this._normalizeLegendValue(vm.legendValue);
        if (vm.activeTab === "mapOnly") {
            templateOptions.layout = enhancedProperties.layoutNames.mapOnly;
            return;
        }

        if (enhancedProperties.deriveLayoutFromPageSize) {
            const layoutNames = enhancedProperties.layoutNames;
            const baseLayoutName = layoutNames[vm.pagePrintSize + "_" + vm.pagePrintOrientation];
            let layoutName = baseLayoutName;
            if (legendValue === "integratedLegend") {
                // Falls back to the normal layout when no dedicated "..._integratedLegend"
                // layout is configured on the print service; legendEnabled (set at print time)
                // is what actually shows the legend on that layout.
                layoutName =
                    layoutNames[
                        vm.pagePrintSize + "_" + vm.pagePrintOrientation + "_integratedLegend"
                    ] || baseLayoutName;
            }
            if (!layoutName) {
                console.error(
                    "could not find layoutName for " +
                        vm.pagePrintSize +
                        "_" +
                        vm.pagePrintOrientation
                );
                layoutName = "";
            }
            templateOptions.layout = layoutName;
        }
    }

    _printLegend(esriPrintWidget, vm, templateOptions, properties, printContext = {}) {
        this._printingPreviewController.setDisabled(true);
        const legendValue = this._normalizeLegendValue(printContext.legendValue ?? vm.legendValue);
        const activeTabForLegend = printContext.activeTab ?? vm.activeTab;
        const layoutBeforePrint = printContext.layoutBeforePrint ?? templateOptions.layout;
        const isMapOnlyMode =
            activeTabForLegend === "mapOnly" ||
            layoutBeforePrint === properties.layoutNames.mapOnly;
        const originalFileName =
            templateOptions.fileName ||
            printContext.fileNameBeforePrint ||
            properties.legend.legendNameIfNoneIsGiven;
        const originalTitle =
            templateOptions.title ||
            printContext.titleBeforePrint ||
            properties.legend.legendNameIfNoneIsGiven;
        const originalLayoutName = layoutBeforePrint || properties.layoutNames.mapOnly;
        const originalLegendEnabled = templateOptions.legendEnabled;
        templateOptions.legendEnabled = true;

        if (isMapOnlyMode) {
            // Title will be available also in MAP_ONLY Mode for the Legend page and must be saved/set/restored
            const newFileName = originalFileName + properties.legend.legendTitleAppendText;
            templateOptions.fileName = templateOptions.title = newFileName;
        } else if (legendValue === "legendOwnPage") {
            templateOptions.title = originalTitle + properties.legend.legendTitleAppendText;
        }
        if (legendValue === "legendOwnPage" && !isMapOnlyMode) {
            templateOptions.layout = properties.layoutNames.legend;
        }
        if (isMapOnlyMode) {
            templateOptions.layout = properties.layoutNames.legend;
            this._fallbackLayoutOverride = properties.layoutNames.legend;
            this._forceFallbackTemplate = true;
        }

        const that = this;
        const restore = () => {
            // Clear the disabled guard first: restoring templateOptions.layout below triggers
            // the preview controller's own watch, which must not be swallowed by the guard.
            that._printingPreviewController.setDisabled(false);
            templateOptions.layout = originalLayoutName;
            that._fallbackLayoutOverride = undefined;
            that._forceFallbackTemplate = false;
            if (isMapOnlyMode) {
                templateOptions.fileName = originalFileName;
            }
            templateOptions.title = originalTitle;
            templateOptions.legendEnabled = originalLegendEnabled;
        };
        try {
            esriPrintWidget._handlePrintMap();
        } catch (error) {
            console.error("Error printing legend:", error);
            restore();
            return;
        }
        // Print Legend: Timeout needed, because of multiple use of "_handlePrintMap" and changing the template
        setTimeout(restore, properties.legend.legendTemplateOptionsRestoreDelayInMs);
    }

    _initDefaultValues(vm, templateOptions, enhancedProperties) {
        const defaultPageSize = enhancedProperties.printSizes.filter(
            (size) => size.isDefault === true
        );
        if (defaultPageSize && defaultPageSize.length > 0) {
            vm.pagePrintSize = defaultPageSize[0].value;
        }
        const defaultPagePrintOrientation = enhancedProperties.printOrientations.filter(
            (orientation) => orientation.isDefault === true
        );
        if (defaultPagePrintOrientation && defaultPagePrintOrientation.length > 0) {
            vm.pagePrintOrientation = defaultPagePrintOrientation[0].value;
        }
        vm.legendValue = this._normalizeLegendValue(vm.legendValue);
        if (templateOptions) {
            this._setLayoutName(vm, templateOptions, enhancedProperties);
        }
        this._updateCustomTextElementsInTemplateOptions(vm.customTextElements);
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

    // patch toPrintTemplate to bypass the read-only templatesInfo check.
    // When the original throws "print:layout-required", we build the PrintTemplate
    _patchToPrintTemplate(printViewModel, esriPrintWidget) {
        if (printViewModel._origToPrintTemplate) {
            return; // already patched
        }
        const origFn = printViewModel.toPrintTemplate.bind(printViewModel);
        printViewModel._origToPrintTemplate = origFn;
        printViewModel.toPrintTemplate = (options) => {
            const shouldUseFallbackTemplate =
                this._forceFallbackTemplate === true || !printViewModel.templatesInfo;

            if (!shouldUseFallbackTemplate) {
                return origFn(options);
            }
            // Build the PrintTemplate ourselves from templateOptions
            const to = esriPrintWidget.templateOptions;
            // Used by fallback template creation (missing templatesInfo or forced fallback mode).
            const fallbackLayoutOverride = this._fallbackLayoutOverride;
            const effectiveLayout = fallbackLayoutOverride || to.layout;
            const isMapOnly = !effectiveLayout || effectiveLayout === "map-only";

            const templateConfig = {
                format: to.format,
                attributionVisible: to.attributionEnabled !== false,
                layoutOptions: {
                    titleText: to.title || "",
                    authorText: to.author || "",
                    copyrightText: to.copyright || "",
                    customTextElements: to.customTextElements || [],
                    legendEnabled: to.legendEnabled !== false,
                    scalebarEnabled: to.scaleBarEnabled !== false
                },
                outScale: to.scaleEnabled && to.scale !== -1 ? to.scale : 0,
                scalePreserved: !!to.scaleEnabled
            };

            if (isMapOnly) {
                templateConfig.layout = "";
                templateConfig.exportOptions = {
                    dpi: to.dpi,
                    width: to.width,
                    height: to.height
                };
            } else {
                templateConfig.layout = effectiveLayout;
                templateConfig.exportOptions = { dpi: to.dpi };
            }

            return new PrintTemplate(templateConfig);
        };
    }
}
