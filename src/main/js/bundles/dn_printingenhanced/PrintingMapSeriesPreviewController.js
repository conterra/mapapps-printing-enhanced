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
import {declare} from "apprt-core/Mutable";
import Connect from "ct/_Connect";
import Observers from "apprt-core/Observers";
import apprt_when from "apprt-core/when";
import async from "apprt-core/async";
import d_aspect from "dojo/aspect";
import d_string from "dojo/string";
import ct_lang from "ct/_lang";
import ct_geometry from "ct/mapping/geometry";
import QueryablePromiseHelper from "./QueryablePromiseHelper";
import Extent from "@arcgis/core/geometry/Extent";

const _templateOptions = Symbol("_templateOptions");
const _templateOptionsWatchHandles = Symbol("_templateOptionsWatchHandles");
const _printInfos = Symbol("_printInfos");
const _printServiceUrl = Symbol("_printServiceUrl");
const _connect = Symbol("_connect");
const _observers = Symbol("_observers");

/**
 * This Code is base upon the file "PrintingPreviewController" of the original bundle dn_printingenhanced
 */
export default declare({
    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;
        this.esriPrintWidget = esriPrintWidget;
        this.mapSeriesMainFrames = [];
        this.minScaleForSeries = this._properties.minScaleForSeries;
        this.scaleModifications = this._properties.scaleModifications;
        this._doNotPrintEmptyTiles = false; // represents the current value selected in the widget; not in sync - do not change here!
        this._mapSeriesExtentType = undefined;
        this._selectedObjectGeoemtry = undefined;
        this._isDisabled = true;
        this._i18n = this._i18n.get();
        this._processId = "printing"
        this._pendingMapSeriesFrameDrawPromise = undefined;
        const that = this;

        // always use set function to change value
        this._mapSeriesExtent = undefined;

        // get print infos
        const url = this[_printServiceUrl] = esriPrintWidget.printServiceUrl;
        this[_printInfos] = {};
        apprt_when(this._printingInfosAnalyzer.getPrintInfos(url), (printInfos) => {
            this[_printInfos] = printInfos;
            this.handleDrawMapSeriesFrames();
        });

        if (!this[_observers]) {
            this[_observers] = new Observers();
        }

        // watch for changes
        this.refreshTemplateOptionsReference(esriPrintWidget);

        // handle print preview before and after printing
        d_aspect.before(printViewModel, "print", (printTemplate) => {
            if (this._isDisabled === true)
                return;
            // show print preview
            this._printingMapSeriesPreviewDrawer.showGraphicsLayer(false);

            const properties = this._printingEnhancedProperties;
            // set customTextElements
            if (properties.customTextElements.length) {
                if (!printTemplate.layoutOptions.customTextElements) {
                    printTemplate.layoutOptions.customTextElements = [];
                }
                const customTextElements = printTemplate.layoutOptions.customTextElements;
                if (this._user) {
                    properties.customTextElements.forEach((element) => {
                        ct_lang.forEachOwnProp(element, (value, name) => {
                            // This fills the properties configured in the _user-Object (authentication)
                            element[name] = d_string.substitute(value, this._user);
                        });
                        this._customTextElements?.forEach(elementWithValue => {
                            if (Object.prototype.hasOwnProperty.call(elementWithValue, element.elementFieldName)) {
                                customTextElements.push(elementWithValue);
                            }
                        });
                    });
                } else {
                    properties.customTextElements.forEach((element) => {
                        this._customTextElements?.forEach(elementWithValue => {
                            if (Object.prototype.hasOwnProperty.call(elementWithValue, element.elementFieldName)) {
                                customTextElements.push(elementWithValue);
                            }
                        });
                    })
                }
            }
            // set sketching properties to view
            const view = printViewModel.view;
            //this._oldScale = view.scale;
            if (properties.enablePrintPreviewMovement) {
                if (this._printExtent) {
                    view.extent = this._printExtent;
                }
            }
            //view.scale = printTemplate.outScale;
        });

        d_aspect.after(printViewModel, "print", (promise) => {
            if (this._isDisabled === true)
                return promise;
            async(() => {
                // const view = printViewModel.view;
                // reset view properties
                //view.scale = that._oldScale;
                that._printingMapSeriesPreviewDrawer.showGraphicsLayer(true);
            }, 2000);
            return promise;
        });
    },

    deactivate() {
        this._printingMapSeriesPreviewDrawer.removeMainFramesFromGraphicsLayer();
        this._printingMapSeriesPreviewDrawer.removeOmittedFramesFromGraphicsLayer();
        this._removeTemplateOptionsWatchHandles();
        this[_connect].disconnect();
        this[_observers].destroy();
        /*this[_lastPopupState]?.reset();*/
    },

    setDisabled(disabled) {
        this._isDisabled = disabled;
    },

    isDisabled() {
        return this._isDisabled;
    },

    removePreviewGraphic() {
        this._printingMapSeriesPreviewDrawer.removeMainFramesFromGraphicsLayer();
        this._printingMapSeriesPreviewDrawer.removeOmittedFramesFromGraphicsLayer();
    },

    setPrintingToggleTool(tool) {
        this._printingToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onDeactivate", () => {
            this._printingMapSeriesPreviewDrawer.removeMainFramesFromGraphicsLayer();
            this._printingMapSeriesPreviewDrawer.removeOmittedFramesFromGraphicsLayer();
        });
    },

    setPrintingEnhancedToggleTool(tool) {
        this._printingEnhancedToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onDeactivate", () => {
            this._printingMapSeriesPreviewDrawer.removeMainFramesFromGraphicsLayer();
            this._printingMapSeriesPreviewDrawer.removeOmittedFramesFromGraphicsLayer();
        });
    },

    setUserService(userService) {
        const properties = this._printingEnhancedProperties._properties;
        if (properties.useUsernameAsAuthor) {
            const authentication = userService.getAuthentication();
            if (!authentication.isAuthenticated()) {
                console.warn("User not authenticated!");
                return;
            }
            this._user = authentication.getUser();
        }
    },

    _removeTemplateOptionsWatchHandles() {
        this[_templateOptionsWatchHandles]?.forEach((watchHandle) => {
            watchHandle?.remove();
        });
        this[_templateOptionsWatchHandles] = [];
    },

    refreshTemplateOptionsReference(esriPrintWidget = this.esriPrintWidget) {
        const templateOptions = esriPrintWidget?.templateOptions;
        if (!templateOptions) {
            return templateOptions;
        }
        if (templateOptions === this[_templateOptions]) {
            return templateOptions;
        }

        this._removeTemplateOptionsWatchHandles();
        this[_templateOptions] = templateOptions;
        this[_templateOptionsWatchHandles] = [
            templateOptions.watch("layout", () => {
                this.handleDrawMapSeriesFrames();
            }),
            templateOptions.watch("scale", () => {
                if (templateOptions.scale >= this.minScaleForSeries) {
                    this.handleDrawMapSeriesFrames();
                }
            }),
            templateOptions.watch("scaleEnabled", () => {
                this.handleDrawMapSeriesFrames();
            }),
            templateOptions.watch("width", () => {
                this.handleDrawMapSeriesFrames();
            }),
            templateOptions.watch("height", () => {
                this.handleDrawMapSeriesFrames();
            }),
            templateOptions.watch("dpi", () => {
                this.handleDrawMapSeriesFrames();
            })
        ];
        return templateOptions;
    },

    _getSinglePageLayoutName(templateOptions) {
        return templateOptions?.layoutSinglePage || templateOptions?.layoutNameSinglePage;
    },

    _getOverviewLayoutName(templateOptions, vm, printingEnhancedProperties) {
        return (
            templateOptions?.layout ||
            printingEnhancedProperties?.layoutNames?.[
                vm.pagePrintSize + "_" + vm.pagePrintOrientation
            ] ||
            ""
        );
    },

    _createMapSeriesPrintState(templateOptions, vm, printingEnhancedProperties) {
        return {
            f: "json",
            format: templateOptions?.format,
            layoutTemplate:
                this._getSinglePageLayoutName(templateOptions) || templateOptions?.layout,
            overviewLayoutTemplate: this._getOverviewLayoutName(
                templateOptions,
                vm,
                printingEnhancedProperties
            ),
            dpi: templateOptions?.dpi,
            width: templateOptions?.width,
            height: templateOptions?.height,
            titleText: templateOptions?.title || "",
            authorText: templateOptions?.author || "",
            copyrightText: templateOptions?.copyright || "",
            customTextElements: templateOptions?.customTextElements || [],
            legendEnabled: templateOptions?.legendEnabled !== false,
            scalebarEnabled: templateOptions?.scaleBarEnabled !== false,
            scale: templateOptions?.scale,
            scaleEnabled: templateOptions?.scaleEnabled && templateOptions?.scale !== -1
        };
    },

    async primePrintingRequestBlueprint(
        esriPrintWidget,
        vm,
        templateOptions,
        printingEnhancedProperties,
        options
    ) {
        const currentTemplateOptions =
            this.refreshTemplateOptionsReference(esriPrintWidget) || templateOptions;
        if (!currentTemplateOptions) {
            return;
        }

        this._setLayoutNameForMapSeries(vm, currentTemplateOptions, printingEnhancedProperties);
        const printState = this._createMapSeriesPrintState(currentTemplateOptions, vm, printingEnhancedProperties);
        return this._printingMapSeriesRequestsProvider.primePrintingRequestBlueprint(printState, options);
    },

    invalidatePrintingRequestBlueprint(reason) {
        this._printingMapSeriesRequestsProvider.invalidatePrintingRequestBlueprint(reason);
    },

    onDoNotPrintEmptyTilesValueChanged(value) {
        this._doNotPrintEmptyTiles = value;
        this.handleDrawMapSeriesFrames(false);
    },

    async handleDrawMapSeriesFrames(zoomTo = true) {
        if (this._isDisabled === true || !this._isValidMapSeriesExtent(this._mapSeriesExtent))
            return;

        const templateOptions = this.refreshTemplateOptionsReference();
        if (!templateOptions) {
            return;
        }

        this._printingMapSeriesPreviewDrawer.removeMainFramesFromGraphicsLayer();
        this._printingMapSeriesPreviewDrawer.removeOmittedFramesFromGraphicsLayer();
        const properties = this._printingEnhancedProperties._properties;
        const drawPromise = async(async () => {
            if (((this._printingToggleTool && this._printingToggleTool.active) ||
                (this._printingEnhancedToggleTool && this._printingEnhancedToggleTool.active))) {
                this.mapSeriesMainFrames = await this._printingMapSeriesPreviewDrawer
                    .drawMapSeriesFrames(this._mapSeriesExtent, this[_printInfos], templateOptions, properties.defaultPageUnit, this._doNotPrintEmptyTiles, this._mapSeriesExtentType, this._selectedObjectGeoemtry);
                zoomTo && this._zoomToMapSeriesFramesExtent(this.mapSeriesMainFrames);
            }
        }, 200);
        const trackedDrawPromise = globalThis.Promise.resolve(drawPromise);
        this._pendingMapSeriesFrameDrawPromise = trackedDrawPromise;
        trackedDrawPromise.then(() => {
            if (this._pendingMapSeriesFrameDrawPromise === trackedDrawPromise) {
                this._pendingMapSeriesFrameDrawPromise = undefined;
            }
        }, () => {
            if (this._pendingMapSeriesFrameDrawPromise === trackedDrawPromise) {
                this._pendingMapSeriesFrameDrawPromise = undefined;
            }
        });
        return trackedDrawPromise;
    },

    async handlePrintMapSeries(mapSeriesTitle, esriPrintWidget, vm, templateOptions, printingEnhancedProperties) {
        const currentTemplateOptions =
            this.refreshTemplateOptionsReference(esriPrintWidget) || templateOptions;
        this._setLayoutNameForMapSeries(vm, currentTemplateOptions, printingEnhancedProperties);
        await this.handleDrawMapSeriesFrames(false);
        await this._waitForPendingMapSeriesFrameDraw();
        await this._ensureMapSeriesFramesAreReadyForPrint();
        if (this.areAllPrerequisitesMetForSeriesPrint() === false) {
            console.warn("Not all prerequisites are met to start printing Map-Series.");
            this._logService.warn(this._i18n.ui.notReadyForMapSeriesPrint);
            return new Promise((res, rej) => {
                rej("Not all prerequisites are met to start printing Map-Series")
            })
        }

        templateOptions = currentTemplateOptions;
        this.invalidatePrintingRequestBlueprint("Preparing fresh map series print blueprint");

        if (this.mapSeriesMainFrames.length > this._properties.askToPrintManyFramesThreshold) {
            try {
                await this._askToPrintManyFrames(this.mapSeriesMainFrames.length);
            } catch (e) {
                return; // do not print if user rejects
            }
        }

        return await this._printMapSeries(vm, mapSeriesTitle, esriPrintWidget, templateOptions, printingEnhancedProperties)
    },

    async _ensureMapSeriesFramesAreReadyForPrint() {
        await this._waitForPendingMapSeriesFrameDraw();

        if (this.areAllPrerequisitesMetForSeriesPrint()) {
            return;
        }

        if (!this._isValidMapSeriesExtent(this._mapSeriesExtent)) {
            return;
        }

        await this.handleDrawMapSeriesFrames(false);
        await this._waitForPendingMapSeriesFrameDraw();
    },

    async _waitForPendingMapSeriesFrameDraw() {
        if (!this._pendingMapSeriesFrameDrawPromise) {
            return;
        }
        try {
            await this._pendingMapSeriesFrameDrawPromise;
        } catch (error) {
            // ignore here; caller checks prerequisites and handles missing frames
        }
    },

    areAllPrerequisitesMetForSeriesPrint() {
        return this.mapSeriesMainFrames !== undefined && this.mapSeriesMainFrames.length > 0;
    },

    _setLayoutNameForMapSeries(vm, templateOptions, printingEnhancedProperties) {
        let layoutName = printingEnhancedProperties.layoutNames[vm.pagePrintSize + "_" + vm.pagePrintOrientation];
        let layoutNameSinglePage = printingEnhancedProperties.layoutNames[vm.pagePrintSize + "_" + vm.pagePrintOrientation + "_singlepage"];
        if (!layoutName) {
            console.error("Could not find layoutName for " + vm.pagePrintSize + "_" + vm.pagePrintOrientation);
            layoutName = "";
        }
        if (!layoutNameSinglePage) {
            console.error("Could not find layoutName for " + vm.pagePrintSize + "_" + vm.pagePrintOrientation);
            layoutNameSinglePage = layoutName;
        }
        templateOptions.layout = layoutName;
        templateOptions.layoutNameSinglePage = layoutNameSinglePage;
        templateOptions.layoutSinglePage = layoutNameSinglePage;
    },

    _askToPrintManyFrames(numberOfFrames) {
        return this._windowManager.createInfoDialogWindow({
            i18n: {
                okButton: this._i18n.ui.print,
                cancelButton: this._i18n.ui.cancelPrint
            },
            message: this._i18n.ui.askToPrintMessage + numberOfFrames,
            title: this._i18n.ui.askToPrintTitle,
            showOk: true,
            showCancel: true,
            modal: true,
            marginBox: {
                w: 450,
                h: 250
            }
        });
    },

    async _printMapSeries(vm, mapSeriesTitle, esriPrintWidget, templateOptions, printingEnhancedProperties) {
        // Show a placeholder for the Map-Series-Job, because adding the real one takes a bit.
        this._showPlaceholderMapSeriesJob(mapSeriesTitle, templateOptions.format);
        let allMapSeriesPrintingRequests;
        try {
            const overviewLayoutName = this._getOverviewLayoutName(
                templateOptions,
                vm,
                printingEnhancedProperties
            );
            const printState = this._createMapSeriesPrintState(
                templateOptions,
                vm,
                printingEnhancedProperties
            );
            allMapSeriesPrintingRequests = await this._printingMapSeriesRequestsProvider.getAllMapSeriesPrintingRequests(this.mapSeriesMainFrames, this._getSinglePageLayoutName(templateOptions), printState);
            if (!allMapSeriesPrintingRequests) {
                console.warn("Could not determine all Map-Series-Printing-Requests.");
                this._logService.error(this._i18n.ui.couldNotDetermineMapSeriesRequests);
                return new Promise((res, rej) => {
                    rej("could not determine all Map-Series-Printing-Requests");
                });
            }

            // Übersicht einfügen
            if(allMapSeriesPrintingRequests.length > 1) {
                const overviewReq = await this._buildOverviewPrintRequest(overviewLayoutName);
                if (overviewReq && allMapSeriesPrintingRequests[0]) {
                    overviewReq.url = allMapSeriesPrintingRequests[0].url; // use same print service
                    allMapSeriesPrintingRequests.unshift(overviewReq);
                } else {
                    console.warn("Could not add overview page to map series print requests.");
                }
            }
        } finally {
            this._hidePlaceholderMapSeriesJob(mapSeriesTitle);
        }

        const legendExtent = this._calcLegendExtent();
        const mapSeriesPrintOptions = {
            legendEnabled: vm.mapSeriesLegendEnabled !== undefined ? vm.mapSeriesLegendEnabled : vm.legendEnabled
        };
        const mapSeriesJob = await this._printingMapSeriesDownloader.downloadMapSeries(allMapSeriesPrintingRequests, mapSeriesTitle, legendExtent, esriPrintWidget, vm, templateOptions, printingEnhancedProperties, 4, mapSeriesPrintOptions);
        this.printingMapSeriesPrintJobsModel.mapSeriesJobs = [...this.printingMapSeriesPrintJobsModel.mapSeriesJobs, mapSeriesJob];
        return this.waitForMapSeriesToFinish(mapSeriesJob); // wird gemacht, um danach legende zu drucken
    },

    _showPlaceholderMapSeriesJob(mapSeriesTitle, fileFormat) {
        const mapSeriesJob = {
            totalSinglePrintJobCount: 1,
            completedSinglePrintJobCount: 0,
            downloadFinished: false,
            mapSeriesTitle: mapSeriesTitle + "...",
            resultZipAsBlobs: null,
            legendResultZipAsBlob: null,
            fileFormat: fileFormat + " ",
            errorMsg: ""
        };
        this.printingMapSeriesPrintJobsModel.mapSeriesJobs = [...this.printingMapSeriesPrintJobsModel.mapSeriesJobs, mapSeriesJob];
    },

    _hidePlaceholderMapSeriesJob(mapSeriesTitle) {
        this.printingMapSeriesPrintJobsModel.mapSeriesJobs = this.printingMapSeriesPrintJobsModel.mapSeriesJobs.filter(job => job.mapSeriesTitle !== mapSeriesTitle + "...",);
    },

    async waitForMapSeriesToFinish(mapSeriesJob) {
        const qpm = new QueryablePromiseHelper();
        mapSeriesJob.on("downloadFinished", () => qpm.resolve());
        return qpm.waitForPromiseToResolve();
    },

    saveJobAsZip(mapSeriesJob, vm) {
        let allblobs = mapSeriesJob.resultZipAsBlobs;
        if (mapSeriesJob.legendResultZipAsBlob) allblobs.push(mapSeriesJob.legendResultZipAsBlob);
        this._downloadAndZipHelper.saveBlobsAsZip(allblobs, mapSeriesJob.mapSeriesTitle, vm);
    },

    _isValidMapSeriesExtent(mapSeriesExtent) {
        return mapSeriesExtent && mapSeriesExtent.xmin && mapSeriesExtent.ymax;
    },

    _zoomToMapSeriesFramesExtent(mapSeriesFrames) {
        if (!this._mapWidgetModel?.view || !mapSeriesFrames?.length || mapSeriesFrames?.length === 0)
            return;

        const expandFactor = 1.2;
        const extent = ct_geometry.calcExtent(mapSeriesFrames.map((item) => item.geometry));
        this._mapWidgetModel.view.goTo(extent.expand(expandFactor));
    },

    // ZoomTo is not enough for use with Object-Selection! You have to update the scale after zooming, too, so the
    // preview-MapFrames are calculated correctly (are based on this scale, not the current extent!)
    async _focusOnSingleMapFrameExtent(singleMapFrameExtent) {
        let neededScale = this._calculateNeededScaleForSingleMapFrame(singleMapFrameExtent, this[_printInfos], this.esriPrintWidget.templateOptions, this._printingEnhancedProperties.defaultPageUnit);

        if (neededScale < this.minScaleForSeries) {
            neededScale = this.minScaleForSeries;
        }

        this.setMapSeriesExtent(singleMapFrameExtent, "object-geometry");
        this._mapWidgetModel.extent = singleMapFrameExtent;
        await async(() => {
            this.esriPrintWidget.templateOptions.scale = Math.round(neededScale);
        }, 200);

        this.handleDrawMapSeriesFrames(false);
    },

    _calculateNeededScaleForSingleMapFrame(mapSeriesExtent, printInfos, templateOptions, defaultPageUnit) {
        if (!printInfos.templateInfos) {
            return this.minScaleForSeries;
        }
        const layoutName = this._getSinglePageLayoutName(templateOptions) || templateOptions.layout;
        const templateInfo = printInfos.templateInfos.filter((info) => info.layoutTemplate === layoutName)[0];
        if (!templateInfo) {
            return this.minScaleForSeries;
        }
        const frameSize = templateInfo.activeDataFrameSize || templateInfo.webMapFrameSize;
        const templateWidth = frameSize[0];
        const templateUnit = printInfos.pageUnits || defaultPageUnit;

        let factor;
        switch (templateUnit) {
            case "MILLIMETER":
                factor = 1000;
                break;
            case "CENTIMETER":
                factor = 100;
                break;
            case "INCH":
                factor = 39.3701;
                break;
        }

        const exactScale = (mapSeriesExtent.width * factor / templateWidth);
        const scaleMod = this._getScaleModification(exactScale);
        return this._getRoundedScale(exactScale * scaleMod.extentFactor, scaleMod.roundUpTo);
    },

    _getScaleModification(scale) {
        // Array is pre-sorted by toScale in activate!
        const scaleMods = this.scaleModifications?.sort((scaleModA, scaleModB) => scaleModA.toScale - scaleModB.toScale);
        return scaleMods?.find(scaleMod => scale <= scaleMod.toScale);
    },

    _getRoundedScale(scale, roundUpTo) {
        if (roundUpTo <= 1)
            return scale;
        return (scale - (scale % roundUpTo) + roundUpTo);
    },

    _getWidthToHeightRatioOfCurrentLayout() {
        const templateOptions = this.refreshTemplateOptionsReference();
        const currentSelectedLayout = this._getSinglePageLayoutName(templateOptions) || templateOptions?.layout;
        if (!this[_printInfos].templateInfos) {
            return 1;
        }
        const currentTemplateInfos = this[_printInfos].templateInfos.filter(templateInfo => templateInfo.layoutTemplate === currentSelectedLayout)[0];
        if (!currentTemplateInfos || !currentTemplateInfos.webMapFrameSize) {
            return 1;
        }
        return currentTemplateInfos.webMapFrameSize[0] / currentTemplateInfos.webMapFrameSize[1];
    },

    // To ensure, that there is only one Map-Frame in the end. This is used to zoom to and setting the scale, just before calculating the Preview-MapFrames
    _calcSingleMapFrameExtent(extentOfSelectedObject) {
        const widthToHeightRatio = this._getWidthToHeightRatioOfCurrentLayout();

        const objectWidth = extentOfSelectedObject.xmax - extentOfSelectedObject.xmin;
        const objectHeight = extentOfSelectedObject.ymax - extentOfSelectedObject.ymin;

        let mapFrameWidth, mapFrameHeight;

        // The highest value of width/height will be preserved and the other one will be calculated according to
        // the widthToHeightRatio.
        if (objectWidth >= objectHeight) {
            mapFrameWidth = objectWidth;
            mapFrameHeight = mapFrameWidth / widthToHeightRatio;
            // Sometimes the resulting MapFrame wont be big enough for the extent of the Object, so it has to be corrected.
            if (mapFrameHeight < objectHeight) {
                const correctionFactor = objectHeight / mapFrameHeight;
                mapFrameHeight = correctionFactor * mapFrameHeight;
                mapFrameWidth = correctionFactor * mapFrameWidth;
            }
        } else {
            mapFrameHeight = objectHeight
            mapFrameWidth = mapFrameHeight * widthToHeightRatio;
            // Sometimes the resulting MapFrame wont be big enough for the extent of the Object, so it has to be corrected.
            if (mapFrameWidth < objectWidth) {
                const correctionFactor = objectWidth / mapFrameWidth;
                mapFrameHeight = correctionFactor * mapFrameHeight;
                mapFrameWidth = correctionFactor * mapFrameWidth;
            }
        }

        return new Extent({
            xmin: extentOfSelectedObject.center.x - (mapFrameWidth / 2.0),
            ymin: extentOfSelectedObject.center.y - (mapFrameHeight / 2.0),
            xmax: extentOfSelectedObject.center.x + (mapFrameWidth / 2.0),
            ymax: extentOfSelectedObject.center.y + (mapFrameHeight / 2.0),
            spatialReference: extentOfSelectedObject.spatialReference
        });
    },

    _calcLegendExtent() {
        if (!this.mapSeriesMainFrames?.length > 0)
            return

        // Ratio needs to be calculated before running calcExtent, because otherwise the function alters the extent somehow?!
        const widthToHeightRatio = this.mapSeriesMainFrames[0].geometry.extent.width / this.mapSeriesMainFrames[0].geometry.extent.height;
        const mapSeriesFramesExtent = ct_geometry.calcExtent(this.mapSeriesMainFrames.map((item) => item.geometry));

        const width = mapSeriesFramesExtent.xmax - mapSeriesFramesExtent.xmin;
        const height = mapSeriesFramesExtent.ymax - mapSeriesFramesExtent.ymin;

        let legendWidth, legendHeight;
        if (width >= height) {
            legendWidth = width;
            legendHeight = legendWidth / widthToHeightRatio;
        } else {
            legendHeight = height
            legendWidth = legendHeight * widthToHeightRatio;
        }

        return new Extent({
            xmin: mapSeriesFramesExtent.xmin,
            ymin: mapSeriesFramesExtent.ymin,
            xmax: mapSeriesFramesExtent.xmin + legendWidth,
            ymax: mapSeriesFramesExtent.ymin + legendHeight,
            spatialReference: mapSeriesFramesExtent.spatialReference
        });
    },

    setCustomTextElements(event) {
        this._customTextElements = event.getProperty("customTextElements");
    },

    useCurrentMapExtent() {
        this.setMapSeriesExtent(this._mapWidgetModel.view.extent, "map-extent");
        this.handleDrawMapSeriesFrames();
    },

    useGeometrySelection() {
        let selectionLayerIds = this._properties.selectionLayers?.layerIds;
        let externalServicesIds = this._properties.selectionLayers?.externalServicesIds;
        let mapServerUrl = this._layerConfigurationProvider.getFisboxFachlayerServiceUrl();

        if (!selectionLayerIds?.length < 0 || !externalServicesIds?.length < 0 || !mapServerUrl) {
            console.error("parameter missing");
            this._logService.error(this._i18n.unexpectedError);
            return
        }

        this._geometrySelectionHandler.startGeometrySelection(selectionLayerIds, externalServicesIds, mapServerUrl, this._processId, "point", false, "printingEnhancedToggleTool");
        // --> onGeometrySelected(evt)
    },

    async onGeometrySelected(evt) {
        let startedBy = evt.getProperty("startedBy");
        if (startedBy !== this._processId)
            return;

        let object = evt.getProperty("objects")[0];
        if (!object?.srcObj?.geometry) {
            console.error("selected object has no geometry");
            this._logService.error(this._i18n.unexpectedError);
            return;
        }

        let extent;
        if (object.srcObj.geometry.type === "point") {
            extent = ct_geometry.calcExtent([object.srcObj.geometry]);
            // extent needs to have a width and height > 0
            extent.xmin = extent.xmin - 1;
            extent.ymax = extent.ymax + 1;
        } else {
            extent = object.srcObj.geometry.extent;
        }

        this._selectedObjectGeoemtry = object.srcObj.geometry;

        const singleMapFrameExtent = this._calcSingleMapFrameExtent(extent);
        await this._focusOnSingleMapFrameExtent(singleMapFrameExtent);

        //restart again (tool usually still active)
        this.useGeometrySelection()
    },

    cancelGeometrySelection() {
        this._geometrySelectionHandler.cancelSelectionProcess(this._processId, true);
    },

    async useRectangleDraw() {
        try {
            while (true) {
                const geometry = await this._rectangleDrawer.activateRectangleDrawing();
                this.setMapSeriesExtent(geometry.extent, "rectangle");
                this.handleDrawMapSeriesFrames();
            }
        } catch (e) {
            // todo fallunterscheidung funktioniert nicht
            if (this._isCancelledError(e)) {
                console.warn(`draw has been canceled!`);
            } else {
                console.warn(e);
            }
        }
    },

    _isCancelledError(err) {
        return err.canceled === true;
    },

    cancelRectangleDraw() {
        this._rectangleDrawer.cancelRectangleDrawing();
    },

    setMapSeriesExtent(mapSeriesExt, type) {
        if (mapSeriesExt !== undefined) {
            this._eventService.postEvent("dn_printingenhanced/MAP_SERIES_EXTENT_SET", {"type": type});
            this._mapSeriesExtent = mapSeriesExt;
            this._mapSeriesExtentType = type;

            if (type !== "object-geometry") {
                this._selectedObjectGeoemtry = undefined;
            }
        } else {
            console.error("extent is undefined");
        }
    },

    getMapSeriesExtent() {
        return this._mapSeriesExtent;
    },

    getMapSeriesExtentType() {
        return this._mapSeriesExtentType;
    },

    /**
     * Builds a print request for an overview page showing all map series frames with labels.
     */
    async _buildOverviewPrintRequest(layoutname) {
        if (!this.mapSeriesMainFrames?.length) return null;
        if (!layoutname) {
            console.warn("Could not determine overview layout name for map series print.");
            return null;
        }

        const blueprint = this._printingMapSeriesRequestsProvider.printingRequestBlueprint;
        if (!blueprint?.body?.Web_Map_as_JSON) return null;

        // Clone original body to avoid mutating blueprint
        const bodyClone = { ...blueprint.body };
        const webMapObj = JSON.parse(bodyClone.Web_Map_as_JSON);

        // Build polygon features (frames) and separate centroid point features for perfectly centered labels
        const frameFeatures = this.mapSeriesMainFrames.map((f, idx) => ({
            geometry: f.geometry.toJSON(),
            attributes: {
                OBJECTID: idx + 1,
                tile_id: idx + 1
            }
        }));

        const spatialRef = frameFeatures[0]?.geometry?.spatialReference;
        const overviewSymbolCfg = this._printingEnhancedProperties.printingOverviewSymbol;
        // Label symbol (fallback default)
        const labelSymbolCfg = this._printingEnhancedProperties.printingOverviewLabelSymbol || {
            type: "esriTS",
            color: [0, 0, 0, 255],
            font: { size: 18, weight: "bold", family: "Arial" },
            horizontalAlignment: "center",
            verticalAlignment: "middle"
        };
        const framePolygonLayer = {
            id: "mapseries_frames",
            title: "Kachelrahmen",
            layerType: "ArcGISFeatureLayer",
            opacity: 1,
            minScale: 0,
            maxScale: 0,
            featureCollection: {
                layers: [{
                    layerDefinition: {
                        name: "Kachelrahmen",
                        geometryType: "esriGeometryPolygon",
                        objectIdField: "OBJECTID",
                        fields: [
                            { name: "OBJECTID", type: "esriFieldTypeOID", alias: "OBJECTID" },
                            { name: "tile_id", type: "esriFieldTypeInteger", alias: "tile_id" }
                        ],
                        drawingInfo: {
                            renderer: {
                                type: "simple",
                                symbol: overviewSymbolCfg
                            }
                        }
                    },
                    featureSet: {
                        geometryType: "esriGeometryPolygon",
                        features: frameFeatures,
                        spatialReference: spatialRef
                    }
                }]
            }
        };

        // Operational Layer 2: Labelpunkte (fertige Textsymbole)
        const frameLabelLayer = this._createFrameLabelLayer(labelSymbolCfg, spatialRef);

        webMapObj.operationalLayers.push(framePolygonLayer);
        webMapObj.operationalLayers.push(frameLabelLayer);

        this._setMapOptions(webMapObj, layoutname);

        bodyClone.Web_Map_as_JSON = JSON.stringify(webMapObj);

        return {
            url: blueprint.url,
            body: {
                ...bodyClone,
                Layout_Template: layoutname
            }
        };
    },

    /**
     * Creates point features with text symbols for labeling the map series frames.
     */
    _createLabelPointFeaturesFromMapSeriesMainFrames(labelSymbolCfg) {
        return this.mapSeriesMainFrames.map((f, idx) => {
            const centroid = f.geometry.centroid;
            return {
                geometry: {
                    x: centroid.x,
                    y: centroid.y,
                    spatialReference: f.geometry.spatialReference.toJSON()
                },
                // Direktes Textsymbol pro Feature (wie Map Viewer Classic)
                symbol: {
                    ...labelSymbolCfg,
                    type: "esriTS",
                    text: String(idx + 1)
                },
                attributes: {
                    OBJECTID: idx + 1,
                    tile_id: idx + 1
                }
            };
        });
    },

    /**
     * Creates a feature layer with point features for labeling the map series frames.
     */
    _createFrameLabelLayer(labelSymbolCfg, spatialRef) {
        const labelPointFeatures = this._createLabelPointFeaturesFromMapSeriesMainFrames(labelSymbolCfg);
        return {
            id: "mapseries_frame_labels",
            title: "Kachelnummern",
            layerType: "ArcGISFeatureLayer",
            opacity: 1,
            minScale: 0,
            maxScale: 0,
            featureCollection: {
                layers: [{
                    layerDefinition: {
                        name: "Kachelnummern",
                        geometryType: "esriGeometryPoint",
                        objectIdField: "OBJECTID",
                        fields: [
                            {name: "OBJECTID", type: "esriFieldTypeOID", alias: "OBJECTID"},
                            {name: "tile_id", type: "esriFieldTypeInteger", alias: "tile_id"}
                        ],
                        // Renderer egal, da jedes Feature eigenes Symbol besitzt
                        drawingInfo: {
                            renderer: {
                                type: "simple",
                                symbol: {
                                    type: "esriSMS",
                                    style: "esriSMSCircle",
                                    size: 1,
                                    color: [0, 0, 0, 0],
                                    outline: {color: [0, 0, 0, 0], width: 0}
                                }
                            }
                        }
                    },
                    featureSet: {
                        geometryType: "esriGeometryPoint",
                        features: labelPointFeatures,
                        spatialReference: spatialRef
                    }
                }]
            }
        };
    },

    /**
     * Sets map options (extent, spatial reference, scale) for the web map object used in the print request.
     * Extent is calculated from all map series frames.
     * Scale is calculated based on the overview layout (not the currently selected template).
     */
    _setMapOptions(webMapObj, layoutname) {
        // Calculate extent of all frames
        const extent = ct_geometry.calcExtent(this.mapSeriesMainFrames.map(f => f.geometry));
        webMapObj.mapOptions = webMapObj.mapOptions || {};
        webMapObj.mapOptions.extent = extent.toJSON();
        webMapObj.mapOptions.spatialReference = extent.spatialReference.toJSON();

        // Calculate scale based on the overview layout (not the currently selected template)
        const printInfos = this[_printInfos];
        const overviewTemplateInfo = printInfos.templateInfos
            .find(t => t.layoutTemplate === layoutname);
        if (overviewTemplateInfo) {
            const defaultPageUnit = this._printingEnhancedProperties.defaultPageUnit;
            const neededScale = this._calculateScaleForOverview(
                extent,
                overviewTemplateInfo,
                printInfos.pageUnits || defaultPageUnit
            );
            webMapObj.mapOptions.scale = Math.round(neededScale);
        }
    },

    /**
     * Calculate the scale for the overview page considering both width and height.
     * This ensures all frames fit within the map frame without being cut off.
     */
    _calculateScaleForOverview(extent, templateInfo, templateUnit) {
        const frameSize = templateInfo.activeDataFrameSize || templateInfo.webMapFrameSize;
        const templateWidth = frameSize[0];
        const templateHeight = frameSize[1];

        // Convert page units to meters
        let factor;
        switch (templateUnit) {
            case "MILLIMETER":
                factor = 1000;
                break;
            case "CENTIMETER":
                factor = 100;
                break;
            case "INCH":
                factor = 39.3701;
                break;
            default:
                factor = 1000; // fallback to mm
        }

        // Calculate scale needed for width and height
        const scaleForWidth = (extent.width * factor) / templateWidth;
        const scaleForHeight = (extent.height * factor) / templateHeight;

        // Use the larger scale (smaller map) so everything fits
        const exactScale = Math.max(scaleForWidth, scaleForHeight);

        // Add 10% buffer to ensure frames don't touch the edges
        const scaleWithBuffer = exactScale * 1.1;

        // Apply scale modifications and rounding
        const scaleMod = this._getScaleModification(scaleWithBuffer);
        if (scaleMod) {
            return this._getRoundedScale(scaleWithBuffer * scaleMod.extentFactor, scaleMod.roundUpTo);
        }
        return scaleWithBuffer;
    }
});
