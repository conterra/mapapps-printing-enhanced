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
export default function () {
    return {
        printingRequestBlueprint: null,
        _blueprintCacheState: "missing",
        _lastBlueprintInvalidationReason: undefined,

        async getAllMapSeriesPrintingRequests(mapSeriesMainFrames, singlePageLayout, printState) {
            if (!mapSeriesMainFrames || mapSeriesMainFrames.length === 0) return;
            try {
                return await this._createAllMapSeriesPrintingRequests(
                    mapSeriesMainFrames,
                    singlePageLayout,
                    printState
                );
            } catch (error) {
                console.error("Could not create map series printing requests", error);
                throw error;
            }
        },

        invalidatePrintingRequestBlueprint(reason) {
            if (this._hasBlueprint(this.printingRequestBlueprint)) {
                this._blueprintCacheState = "stale";
                this._lastBlueprintInvalidationReason = reason;
            } else {
                this._blueprintCacheState = "missing";
                this._lastBlueprintInvalidationReason = reason;
            }
        },

        async primePrintingRequestBlueprint(printState, options = {}) {
            if (this._blueprintPrimePromise) {
                return this._blueprintPrimePromise;
            }

            this._blueprintPrimePromise = this._primePrintingRequestBlueprint(
                printState,
                options
            ).finally(() => {
                this._blueprintPrimePromise = undefined;
            });
            return this._blueprintPrimePromise;
        },

        async _primePrintingRequestBlueprint(printState, options = {}) {
            const forceFresh = options.forceFresh === true;
            const cachedBlueprint = this._createBlueprintFromCachedState(printState);
            if (!forceFresh && this._hasBlueprint(cachedBlueprint)) {
                return this._storeBaseBlueprint(cachedBlueprint);
            }

            return this._createLegacyFallbackBlueprint(printState);
        },

        _createBlueprintFromCachedState(printState, baseBlueprint = this.printingRequestBlueprint) {
            return this._printingRequestBlueprintProvider.createPrintingRequestBlueprintFromState(
                printState,
                baseBlueprint
            );
        },

        _hasBlueprint(blueprint) {
            return Boolean(blueprint?.body?.Web_Map_as_JSON);
        },

        async _createAllMapSeriesPrintingRequests(
            mapSeriesMainFrames,
            singlePageLayout,
            printState
        ) {
            const allPrintingRequests = [];
            let baseBlueprint = await this.primePrintingRequestBlueprint(printState, {
                forceFresh: this._blueprintCacheState !== "valid",
                reason: this._lastBlueprintInvalidationReason
            });
            baseBlueprint =
                this._createBlueprintFromCachedState(printState, baseBlueprint) || baseBlueprint;
            if (!this._hasBlueprint(baseBlueprint)) {
                throw new Error("Invalid print request blueprint for map series");
            }

            this._storeBaseBlueprint(baseBlueprint);

            let pagelayout = singlePageLayout || baseBlueprint.body.Layout_Template;
            if (mapSeriesMainFrames && mapSeriesMainFrames.length > 1) {
                pagelayout = singlePageLayout || baseBlueprint.body.Layout_Template;
            }
            mapSeriesMainFrames?.forEach((mainFrame, idx) => {
                const singleRequestBlueprint = JSON.parse(JSON.stringify(baseBlueprint));
                this._updateExtent(singleRequestBlueprint, mainFrame?.geometry?.extent, mainFrame?.geometry);
                singleRequestBlueprint.col = mainFrame.col;
                singleRequestBlueprint.row = mainFrame.row;
                singleRequestBlueprint.pagenumber = idx;
                singleRequestBlueprint.body.Layout_Template = pagelayout;
                singleRequestBlueprint.body.Web_Map_as_JSON = this._createCustomTextElementNumberForPage(singleRequestBlueprint.body.Web_Map_as_JSON, idx + 1);
                allPrintingRequests.push(singleRequestBlueprint);
            })
            return allPrintingRequests;
        },

        _storeBaseBlueprint(baseBlueprint) {
            this.printingRequestBlueprint = JSON.parse(JSON.stringify(baseBlueprint));
            this._blueprintCacheState = "valid";
            this._lastBlueprintInvalidationReason = undefined;
            return this._printingRequestBlueprintProvider.setLastPrintingRequestBlueprint(
                baseBlueprint
            );
        },

        async _createLegacyFallbackBlueprint(printState) {
            const esriTemplateOptions = this._printingWidget?._esriWidget?.templateOptions;
            const originalLayout = esriTemplateOptions?.layout;
            const interceptBlueprintPromise =
                this._printingRequestBlueprintProvider.getPrintingRequestBlueprint();
            try {
                if (esriTemplateOptions && printState?.overviewLayoutTemplate) {
                    esriTemplateOptions.layout = printState.overviewLayoutTemplate;
                }
                this._printingWidget._esriWidget._handlePrintMap();
            } catch (error) {
                this._printingRequestBlueprintProvider.rejectPendingBlueprintRequest(error);
                throw error;
            }
            try {
                const interceptedBlueprint = await interceptBlueprintPromise;
                if (!this._hasBlueprint(interceptedBlueprint)) {
                    throw new Error("Invalid intercepted print request blueprint");
                }

                const baseBlueprint =
                    this._createBlueprintFromCachedState(printState, interceptedBlueprint) ||
                    interceptedBlueprint;
                return this._storeBaseBlueprint(baseBlueprint);
            } finally {
                if (esriTemplateOptions) {
                    esriTemplateOptions.layout = originalLayout;
                }
            }
        },

        _updateExtent(printingRequestBlueprint, extent, geometry) {
            if (!printingRequestBlueprint?.url || !printingRequestBlueprint?.body?.Web_Map_as_JSON || (!extent?.spatialReference?.latestWkid && !extent?.spatialReference?.wkid))
                return printingRequestBlueprint;
            const webMapAsJsonObj = JSON.parse(printingRequestBlueprint.body.Web_Map_as_JSON);
            if(geometry?.rings.length === 0) {
                console.error("no rings");
                return;
            }
            webMapAsJsonObj.mapOptions.extent = {
                xmin: geometry?.rings[0][0][0],
                ymax: geometry?.rings[0][0][1],
                xmax: geometry?.rings[0][2][0],
                ymin: geometry?.rings[0][1][1],
                spatialReference: {
                    latestWkid: extent?.spatialReference?.latestWkid,
                    wkid: extent?.spatialReference?.wkid
                }
            };
            printingRequestBlueprint.body.Web_Map_as_JSON = JSON.stringify(webMapAsJsonObj);
            return printingRequestBlueprint;
        },

        _createCustomTextElementNumberForPage(Web_Map_as_JSON, pageNumberToAdd) {
            const webmapAsJSON = JSON.parse(Web_Map_as_JSON);
            if (!Array.isArray(webmapAsJSON?.layoutOptions?.customTextElements)) {
                webmapAsJSON.layoutOptions = webmapAsJSON.layoutOptions || {};
                webmapAsJSON.layoutOptions.customTextElements = [];
            }
            webmapAsJSON.layoutOptions.customTextElements.push({ "pagenumber": pageNumberToAdd.toString() || "{pageNumber}" });
            return JSON.stringify(webmapAsJSON);
        }
    }
}
