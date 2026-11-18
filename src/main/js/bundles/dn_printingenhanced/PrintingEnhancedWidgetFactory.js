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
        // Print mode tracking
        this._PRINT_MODE_SINGLE = "SINGLE";
        this._PRINT_MODE_SERIES = "SERIES";
        this._printMode = this._PRINT_MODE_SINGLE;
        this._oldMapSeriesExtent = undefined;
        this._oldMapSeriesExtentType = undefined;
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
        const mapSeriesModel = this._printingMapSeriesPrintJobsModel;
        // Event-Topic handler methods (invoked by framework based on manifest Event-Topics)
        widget.onMapSeriesExtentSet = (evt) => this.onMapSeriesExtentSet(evt);

        this.printingPreviewControllerBinding = Binding.for(vm, printingPreviewController)
            .syncToRight("enablePrintPreview", "drawPrintPreview", (enablePrintPreview) => !!(enablePrintPreview && vm.scaleEnabled))
            .syncToRight("scaleEnabled", "drawPrintPreview", (scaleEnabled) => !!(scaleEnabled && vm.enablePrintPreview));

        this.mapSeriesJobsBinding = Binding.for(vm, mapSeriesModel).syncAll("mapSeriesJobs");

        widget.activateTool = () => {
            const templateOptions = this._ensureTemplateOptionsBinding(vm);
            this.exportedLinksWatcher = esriPrintWidget.exportedLinks.on("after-add", (event) => {
                // Skip blueprint prints that belong to series mode
                if (this._printMode !== this._PRINT_MODE_SINGLE) return;
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
            this._refreshTemplateOptionsControllers();
            this.mapSeriesJobsBinding.enable().syncToLeftNow();

            // Restore tool states based on active tab
            if (vm.activeTab === "mapSeries") {
                this._printMode = this._PRINT_MODE_SERIES;
                this._printingPreviewController.setDisabled(true);
                this._printingMapSeriesPreviewController.setDisabled(false);
                if (this._oldMapSeriesExtent && this._oldMapSeriesExtentType) {
                    this._printingMapSeriesPreviewController.setMapSeriesExtent(
                        this._oldMapSeriesExtent,
                        this._oldMapSeriesExtentType
                    );
                    this._oldMapSeriesExtent = undefined;
                    this._oldMapSeriesExtentType = undefined;
                }
            } else {
                this._printMode = this._PRINT_MODE_SINGLE;
                this._printingMapSeriesPreviewController.setDisabled(true);
                this._printingPreviewController.setDisabled(false);
            }
        };
        widget.deactivateTool = () => {
            if (vm.activeTab === "mapSeries") {
                this._oldMapSeriesExtent =
                    this._printingMapSeriesPreviewController.getMapSeriesExtent();
                this._oldMapSeriesExtentType =
                    this._printingMapSeriesPreviewController.getMapSeriesExtentType();
            }
            vm?.$refs?.mapSeriesWidget?.deactivateAllTools();
            this.currentMapScaleWatchSignal?.remove();
            this.currentMapScaleWatchSignal = undefined;
            this.printingPreviewControllerBinding?.disable();
            this.templateOptionsBinding?.disable();
            this.mapSeriesJobsBinding?.disable();
            this.exportedLinksWatcher?.remove();
        };

        widget.own({
            remove: () => {
                this.currentMapScaleWatchSignal?.remove();
                this.printingPreviewControllerBinding?.unbind();
                this.templateOptionsBinding?.unbind();
                this.mapSeriesJobsBinding?.unbind();
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
            "attributionEnabled": false
        };
        vm.visibleUiElements = { ...defaultVisibleUiElements, ...properties.visibleUiElements };
        vm.legendModes = properties.legend.legendModes;
        vm.dpiValues = properties.dpiValues;
        vm.scaleValues = properties.scaleValues;
        vm.enablePrintPreview = properties.enablePrintPreview;
        vm.minScaleForSeries = this._printingMapSeriesPreviewController.minScaleForSeries;
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
            this._invalidateMapSeriesBlueprint("Page print orientation changed");
            this._refreshTemplateOptionsControllers();
            if (vm.activeTab === "mapSeries") {
                this._printingMapSeriesPreviewController.handleDrawMapSeriesFrames();
            } else {
                this._printingPreviewController._handleDrawTemplateDimensions(true);
            }
        });
        vm.$watch("pagePrintSize", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            this._setLayoutName(vm, templateOptions, properties);
            this._invalidateMapSeriesBlueprint("Page print size changed");
            this._refreshTemplateOptionsControllers();
            if (vm.activeTab === "mapSeries") {
                this._printingMapSeriesPreviewController.handleDrawMapSeriesFrames();
            } else {
                this._printingPreviewController._handleDrawTemplateDimensions(true);
            }
        });

        // Tab change handler
        vm.$on("active-tab-changed", (activeTab) => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            if (activeTab === "mapSeries") {
                if (this._oldMapSeriesExtent && this._oldMapSeriesExtentType) {
                    this._printingMapSeriesPreviewController.setMapSeriesExtent(
                        this._oldMapSeriesExtent,
                        this._oldMapSeriesExtentType
                    );
                    this._oldMapSeriesExtent = undefined;
                    this._oldMapSeriesExtentType = undefined;
                } else {
                    this._printingMapSeriesPreviewController.removePreviewGraphic();
                }
            }
            if (activeTab !== "results") {
                this._setLayoutName(vm, templateOptions, properties);
            }
            this._refreshTemplateOptionsControllers();
        });

        vm.$watch("legendValue", () => {
            const templateOptions = this._getTemplateOptions();
            if (!templateOptions) {
                return;
            }
            this._setLayoutName(vm, templateOptions, properties);
        });

        vm.$watch("dpi", () => {
            this._invalidateMapSeriesBlueprint("DPI changed");
        });

        vm.$watch("scale", () => {
            this._invalidateMapSeriesBlueprint("Scale changed");
        });

        vm.$watch("mapSeriesLegendEnabled", () => {
            this._invalidateMapSeriesBlueprint("Map series legend setting changed");
        });

        vm.$watch("format", () => {
            this._invalidateMapSeriesBlueprint("Print format changed");
            this._refreshTemplateOptionsControllers();
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
            // Fall back to a default name for the print request itself, without writing it
            // back into the (two-way bound) title/fileName fields shown in the UI.
            const originalTitle = templateOptions.title;
            const originalFileName = templateOptions.fileName;
            templateOptions.title = originalTitle || properties.filenameIfNoneIsGiven;
            templateOptions.fileName = originalFileName || properties.filenameIfNoneIsGiven;
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
            templateOptions.title = originalTitle;
            templateOptions.fileName = originalFileName;
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

        vm.$on("printMapSeries", async () => {
            try {
                const templateOptions = this._getTemplateOptions();
                if (!templateOptions) {
                    return;
                }
                this._refreshTemplateOptionsControllers();
                const mapSeriesTitle =
                    templateOptions.title || properties.legend.legendNameIfNoneIsGiven;
                await this._printingMapSeriesPreviewController.handlePrintMapSeries(
                    mapSeriesTitle,
                    esriPrintWidget,
                    vm,
                    templateOptions,
                    properties
                );
            } catch (e) {
                console.error(e);
                this._logService.error(this._i18n.get().unexpectedError);
                vm.activeTab = "mapSeries";
            }
        });

        vm.$on("activate-single-print-mode", () => {
            this.activateSinglePrintMode();
        });

        vm.$on("activate-series-print-mode", () => {
            this.activateSeriesPrintMode();
        });

        vm.$on("use-map-view-extent", () => {
            this._printingMapSeriesPreviewController.useCurrentMapExtent();
        });

        vm.$on("use-geometry-selection", () => {
            this._printingMapSeriesPreviewController.useGeometrySelection();
        });

        vm.$on("cancel-geometry-selection", () => {
            this._printingMapSeriesPreviewController.cancelGeometrySelection();
        });

        vm.$on("use-rectangle-draw", () => {
            this._printingMapSeriesPreviewController.useRectangleDraw();
        });

        vm.$on("cancel-rectangle-draw", () => {
            this._printingMapSeriesPreviewController.cancelRectangleDraw();
        });

        vm.$on("save-job-again", (mapSeriesJob) => {
            this._printMode = this._PRINT_MODE_SERIES;
            this._printingMapSeriesPreviewController.saveJobAsZip(mapSeriesJob, vm);
        });

        vm.$on("resetScale", () => {
            esriPrintWidget._resetToCurrentScale();
        });

        vm.$on("trigger-custom-text-elements-update", (ourCustomTextElements) => {
            this._updateCustomTextElementsInTemplateOptions(ourCustomTextElements);
        });

        vm.$on("do-not-print-empty-tiles-changed", (value) => {
            this._printingMapSeriesPreviewController.onDoNotPrintEmptyTilesValueChanged(value);
        });

        this._initDefaultValues(vm, this._getTemplateOptions(), properties);
    }

    _normalizeLegendValue(legendValue, forMapOnly = false) {
        const legendModes = this.vm?.legendModes ?? [];
        return normalizeLegendValue(legendValue, legendModes, forMapOnly);
    }

    _updateCustomTextElementsInTemplateOptions(ourCustomTextElements) {
        const esriCustomTextElements =
            CustomTextElementsMapper.mapToEsriCustomTextElements(ourCustomTextElements);
        this._eventService.sendEvent("dn_printingenhanced/CUSTOM_TEXTELEMENTS", {
            customTextElements: esriCustomTextElements
        });
    }

    activateSinglePrintMode(doNotDrawPreviewGraphic) {
        this._printMode = this._PRINT_MODE_SINGLE;
        this._printingMapSeriesPreviewController.setDisabled(true);
        this._printingMapSeriesPreviewController.removePreviewGraphic();
        if (!doNotDrawPreviewGraphic) {
            this._printingPreviewController.setDisabled(false);
            this._printingPreviewController._handleDrawTemplateDimensions(true);
        }
    }

    activateSeriesPrintMode() {
        this._printMode = this._PRINT_MODE_SERIES;
        this._printingPreviewController.setDisabled(true);
        this._printingPreviewController.removePreviewGraphic();
        this._printingMapSeriesPreviewController.setDisabled(false);
        this._printingMapSeriesPreviewController.handleDrawMapSeriesFrames();
        this._primeMapSeriesBlueprintIfPossible("Series print mode activated");
    }

    onMapSeriesExtentSet(evt) {
        this.vm.mapSeriesExtentSet = true;
        this.vm.mapSeriesExtentType = evt.getProperty("type");
    }

    _setLayoutName(vm, templateOptions, enhancedProperties) {
        const legendValue = this._normalizeLegendValue(vm.legendValue);
        if (vm.activeTab === "mapOnly") {
            templateOptions.layout = enhancedProperties.layoutNames.mapOnly;
            templateOptions.layoutNameSinglePage = null;
            templateOptions.layoutSinglePage = null;
            return;
        }
        if (!enhancedProperties.deriveLayoutFromPageSize) {
            // Opt-in feature disabled: leave templateOptions.layout untouched so the
            // manual layout dropdown (visibleUiElements.layout) stays authoritative.
            return;
        }
        const layoutNames = enhancedProperties.layoutNames;
        const baseLayoutName = layoutNames[vm.pagePrintSize + "_" + vm.pagePrintOrientation];
        let layoutName = baseLayoutName;
        if (legendValue === "integratedLegend" && vm.activeTab !== "mapSeries") {
            // Falls back to the normal layout when no dedicated "..._integratedLegend"
            // layout is configured on the print service; legendEnabled (set at print time)
            // is what actually shows the legend on that layout.
            layoutName =
                layoutNames[
                    vm.pagePrintSize + "_" + vm.pagePrintOrientation + "_integratedLegend"
                ] || baseLayoutName;
        }
        let layoutNameSinglePage =
            layoutNames[vm.pagePrintSize + "_" + vm.pagePrintOrientation + "_singlepage"];
        if (!layoutName) {
            console.error(
                "could not find layoutName for " +
                    vm.pagePrintSize +
                    "_" +
                    vm.pagePrintOrientation
            );
            layoutName = "";
        }
        if (!layoutNameSinglePage) {
            // "_singlepage" entries are optional: fall back to the overview layout
            layoutNameSinglePage = layoutName;
        }
        templateOptions.layout = layoutName;
        templateOptions.layoutNameSinglePage = layoutNameSinglePage;
        templateOptions.layoutSinglePage = layoutNameSinglePage;
    }

    _printLegend(esriPrintWidget, vm, templateOptions, properties, printContext = {}) {
        this._printingPreviewController.setDisabled(true);
        const legendValue = this._normalizeLegendValue(printContext.legendValue ?? vm.legendValue);
        const activeTabForLegend = printContext.activeTab ?? vm.activeTab;
        const layoutBeforePrint = printContext.layoutBeforePrint ?? templateOptions.layout;
        const isMapOnlyMode =
            activeTabForLegend === "mapOnly" ||
            layoutBeforePrint === properties.layoutNames.mapOnly;
        // Values shown in the UI are restored as they are, the default name is only used for the print request
        const fileNameToRestore = templateOptions.fileName;
        const titleToRestore = templateOptions.title;
        const originalFileName =
            fileNameToRestore ||
            printContext.fileNameBeforePrint ||
            properties.filenameIfNoneIsGiven;
        const originalTitle =
            titleToRestore ||
            printContext.titleBeforePrint ||
            properties.filenameIfNoneIsGiven;
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
                templateOptions.fileName = fileNameToRestore;
            }
            templateOptions.title = titleToRestore;
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
        vm.mapSeriesLegendEnabled =
            enhancedProperties?.legend?.defaultLegendEnabled !== undefined
                ? enhancedProperties.legend.defaultLegendEnabled
                : true;
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

    _refreshTemplateOptionsControllers() {
        this._printingPreviewController.refreshTemplateOptionsReference?.(
            this._printingWidget?._esriWidget
        );
        this._printingMapSeriesPreviewController.refreshTemplateOptionsReference?.(
            this._printingWidget?._esriWidget
        );
    }

    _invalidateMapSeriesBlueprint(reason) {
        this._printingMapSeriesPreviewController.invalidatePrintingRequestBlueprint?.(reason);
    }

    _primeMapSeriesBlueprintIfPossible(reason) {
        const templateOptions = this._getTemplateOptions();
        if (!templateOptions) {
            return;
        }
        return this._printingMapSeriesPreviewController
            .primePrintingRequestBlueprint(
                this._printingWidget?._esriWidget,
                this.vm,
                templateOptions,
                this._printingEnhancedProperties,
                { reason }
            )
            ?.catch((error) => {
                console.warn("Could not prime map series print blueprint cache", error);
            });
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
