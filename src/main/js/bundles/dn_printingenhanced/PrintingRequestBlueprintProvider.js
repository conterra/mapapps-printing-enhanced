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
import esriConfig from "@arcgis/core/config";
import QueryablePromiseHelper from "./QueryablePromiseHelper"

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function () {
    return {
        activate() {
            this.url = this._properties.printingURLtoIntercept;
            this._cancelRequestOnIntercept = this._properties.cancelRequestOnIntercept !== false;
            this._requestUrlMatchers = this._createRequestUrlMatchers(this.url);
        },

        deactivate() {
            if (this.qpm) this.qpm.reject();
            this.removeRequestInterceptor();
        },

        async getPrintingRequestBlueprint(extentToUseInBlueprint) {
            this.qpm = new QueryablePromiseHelper();
            this._lastInterceptCandidate = undefined;
            this._addRequestInterceptor(extentToUseInBlueprint);
            try {
                return await this._waitForPrintingRequestBlueprint();
            } finally {
                this.removeRequestInterceptor();
            }
        },

        getLastPrintingRequestBlueprint() {
            if (!this.PrintingRequestBlueprint) {
                return null;
            }
            // return a deep copy of the blueprint to prevent changes to the original blueprint
            return JSON.parse(JSON.stringify(this.PrintingRequestBlueprint));
        },

        setLastPrintingRequestBlueprint(blueprint) {
            if (!blueprint) {
                this.PrintingRequestBlueprint = undefined;
                return null;
            }
            this.PrintingRequestBlueprint = JSON.parse(JSON.stringify(blueprint));
            return this.getLastPrintingRequestBlueprint();
        },

        createPrintingRequestBlueprintFromState(
            printState,
            baseBlueprint = this.PrintingRequestBlueprint
        ) {
            if (!baseBlueprint?.body?.Web_Map_as_JSON) {
                return null;
            }
            const blueprint = JSON.parse(JSON.stringify(baseBlueprint));
            return this._applyPrintStateToBlueprint(blueprint, printState);
        },

        async _waitForPrintingRequestBlueprint() {
            if (!this.qpm) this.qpm = new QueryablePromiseHelper();
            const timeoutInMs = Number(this._properties.blueprintRequestTimeoutInMs) || 30000;
            let timeoutId;
            const timeoutPromise = new globalThis.Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    const msg = "Timed out while waiting for intercepted print request blueprint.";
                    console.error(msg, {
                        configuredPrintUrl: this.url,
                        interceptorCount: esriConfig.request.interceptors?.length,
                        lastInterceptCandidate: this._lastInterceptCandidate
                    });
                    try {
                        this.qpm?.reject(new Error(msg));
                    } catch (e) {
                        // ignore - promise may already be settled
                    }
                    reject(new Error(msg));
                }, timeoutInMs);
            });

            try {
                return await globalThis.Promise.race([
                    this.qpm.waitForPromiseToResolve(),
                    timeoutPromise
                ]);
            } finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        },

        // Requests are not really intercepted anymore, because the interception code cannot be used
        // in parallel with the tokenRequestIntercepter in "before".
        // see https://conterrade.atlassian.net/browse/MAPAPPS-6898
        _addRequestInterceptor(extentToUseInBlueprint) {
            const tokenRequestInterceptor = esriConfig.request.interceptors[0];
            this._requestInterceptor = {
                urls: this._requestUrlMatchers,
                before: tokenRequestInterceptor?.before,
                after: async (request) => {
                    const requestUrl = this._resolveRequestUrl(request);
                    const requestParams = this._extractPrintRequestParams(request);
                    this._lastInterceptCandidate = {
                        requestUrl,
                        matchesConfiguredUrl: this._requestMatchesConfiguredUrl(requestUrl),
                        hasFormat: Boolean(requestParams?.Format),
                        hasLayoutTemplate: Boolean(requestParams?.Layout_Template),
                        hasResponseFormat: Boolean(requestParams?.f),
                        hasWebMapAsJson: Boolean(requestParams?.Web_Map_as_JSON)
                    };
                    if (this._requestIsValid(requestParams, requestUrl) === false) {
                        return;
                    }
                    this._updateWebMapAsJsonBlueprint(requestUrl, requestParams, extentToUseInBlueprint);
                    if (this._cancelRequestOnIntercept) this._cancelRequest(request);
                    this.qpm?.resolve(JSON.parse(JSON.stringify(this.PrintingRequestBlueprint)));
                }
            }
            esriConfig.request.interceptors.unshift(this._requestInterceptor);
        },

        removeRequestInterceptor() {
            const interceptorIndex = esriConfig.request.interceptors.indexOf(this._requestInterceptor);
            if (interceptorIndex === -1)
                return;
            esriConfig.request.interceptors.splice(interceptorIndex, 1);
            this._requestInterceptor = undefined;
        },

        rejectPendingBlueprintRequest(error) {
            const rejectionError = error instanceof Error ? error : new Error(String(error));
            try {
                this.qpm?.reject(rejectionError);
            } catch (e) {
                // ignore - promise may already be settled
            }
            this.removeRequestInterceptor();
        },

        _cancelRequest(request) {
            request.url = "";
            if (request?.requestOptions) {
                request.requestOptions.url = "";
            }
        },

        _updateWebMapAsJsonBlueprint(requestUrl, requestParams, extentToUseInBlueprint) {
            if (!requestParams) {
                return;
            }

            let webMapAsJson = requestParams.Web_Map_as_JSON;
            if (extentToUseInBlueprint) {
                webMapAsJson = this.updateExtent(webMapAsJson, extentToUseInBlueprint);
            }

            this.PrintingRequestBlueprint = {
                url: requestUrl,
                body: {
                    Format: requestParams.Format,
                    Layout_Template: requestParams.Layout_Template,
                    f: requestParams.f,
                    Web_Map_as_JSON: webMapAsJson
                },
            };
        },

        _applyPrintStateToBlueprint(blueprint, printState) {
            if (!blueprint?.body?.Web_Map_as_JSON) {
                return blueprint;
            }

            blueprint.url = blueprint.url || this.url;
            blueprint.body.Format = printState?.format || blueprint.body.Format;
            blueprint.body.Layout_Template =
                printState?.layoutTemplate || blueprint.body.Layout_Template;
            blueprint.body.f = printState?.f || blueprint.body.f || "json";

            let webMapAsJson = blueprint.body.Web_Map_as_JSON;
            if (printState?.extent) {
                webMapAsJson = this.updateExtent(webMapAsJson, printState.extent);
            }

            const webMapAsJsonObject =
                typeof webMapAsJson === "string" ? JSON.parse(webMapAsJson) : webMapAsJson;
            webMapAsJsonObject.layoutOptions = webMapAsJsonObject.layoutOptions || {};

            if (printState?.titleText !== undefined) {
                webMapAsJsonObject.layoutOptions.titleText = printState.titleText;
            }
            if (printState?.authorText !== undefined) {
                webMapAsJsonObject.layoutOptions.authorText = printState.authorText;
            }
            if (printState?.copyrightText !== undefined) {
                webMapAsJsonObject.layoutOptions.copyrightText = printState.copyrightText;
            }
            if (printState?.customTextElements !== undefined) {
                webMapAsJsonObject.layoutOptions.customTextElements = JSON.parse(
                    JSON.stringify(printState.customTextElements)
                );
            }
            if (printState?.legendEnabled !== undefined) {
                webMapAsJsonObject.layoutOptions.legendEnabled = printState.legendEnabled;
            }
            if (printState?.scalebarEnabled !== undefined) {
                webMapAsJsonObject.layoutOptions.scalebarEnabled = printState.scalebarEnabled;
            }

            webMapAsJsonObject.mapOptions = webMapAsJsonObject.mapOptions || {};
            if (printState?.scaleEnabled && Number.isFinite(printState?.scale)) {
                webMapAsJsonObject.mapOptions.scale = printState.scale;
            } else if (webMapAsJsonObject.mapOptions.scale) {
                delete webMapAsJsonObject.mapOptions.scale;
            }

            const dpi = Number(printState?.dpi);
            const width = Number(printState?.width);
            const height = Number(printState?.height);
            webMapAsJsonObject.exportOptions = webMapAsJsonObject.exportOptions || {};
            if (Number.isFinite(dpi)) {
                webMapAsJsonObject.exportOptions.dpi = dpi;
            } else if (!Number.isFinite(webMapAsJsonObject.exportOptions.dpi)) {
                webMapAsJsonObject.exportOptions.dpi = 150;
            }
            if (Number.isFinite(width)) {
                webMapAsJsonObject.exportOptions.width = width;
            }
            if (Number.isFinite(height)) {
                webMapAsJsonObject.exportOptions.height = height;
            }

            blueprint.body.Web_Map_as_JSON = JSON.stringify(webMapAsJsonObject);
            return blueprint;
        },

        _resolveRequestUrl(request) {
            return request?.url || request?.requestOptions?.url || this.url;
        },

        _createRequestUrlMatchers(configuredUrl) {
            const matchers = [];
            if (configuredUrl) {
                matchers.push(configuredUrl);
            }

            const urlSuffix = this._extractConfiguredUrlSuffix(configuredUrl);
            if (urlSuffix) {
                matchers.push(new RegExp(escapeRegExp(urlSuffix) + "(?:\\?.*)?$", "i"));
            }
            return matchers.length ? matchers : configuredUrl;
        },

        _extractConfiguredUrlSuffix(configuredUrl) {
            if (!configuredUrl) {
                return "";
            }
            try {
                const url = new URL(configuredUrl);
                const pathSegments = url.pathname.split("/").filter(Boolean);
                return pathSegments.slice(-3).join("/");
            } catch (error) {
                return String(configuredUrl)
                    .split("?")[0]
                    .split("/")
                    .filter(Boolean)
                    .slice(-3)
                    .join("/");
            }
        },

        _requestMatchesConfiguredUrl(requestUrl) {
            if (!requestUrl || !this.url) {
                return false;
            }
            if (requestUrl === this.url || requestUrl.includes(this.url)) {
                return true;
            }

            const configuredUrlSuffix = this._extractConfiguredUrlSuffix(this.url);
            return Boolean(configuredUrlSuffix) && requestUrl.includes(configuredUrlSuffix);
        },

        _extractPrintRequestParams(request) {
            const query = request?.requestOptions?.query;
            if (query && typeof query.get === "function") {
                return this._extractPrintRequestParamsFromGettable(query);
            }
            if (typeof query === "string") {
                const queryParams = new URLSearchParams(query);
                return this._extractPrintRequestParamsFromGettable(queryParams);
            }
            if (query && typeof query === "object") {
                return this._extractPrintRequestParamsFromObject(query);
            }

            const body = request?.requestOptions?.body;
            if (!body) {
                return;
            }

            if (body && typeof body.get === "function") {
                return this._extractPrintRequestParamsFromGettable(body);
            }

            if (typeof body === "string") {
                const bodyParams = new URLSearchParams(body);
                return this._extractPrintRequestParamsFromGettable(bodyParams);
            }

            if (typeof body === "object") {
                return this._extractPrintRequestParamsFromObject(body);
            }
        },

        _extractPrintRequestParamsFromObject(obj) {
            return {
                Format: obj.Format || obj.format,
                Layout_Template: obj.Layout_Template || obj.layout_template,
                f: obj.f || obj.F,
                Web_Map_as_JSON: obj.Web_Map_as_JSON || obj.web_map_as_json
            };
        },

        _extractPrintRequestParamsFromGettable(params) {
            return {
                Format: params.get("Format") || params.get("format"),
                Layout_Template: params.get("Layout_Template") || params.get("layout_template"),
                f: params.get("f") || params.get("F"),
                Web_Map_as_JSON: params.get("Web_Map_as_JSON") || params.get("web_map_as_json")
            };
        },

        updateExtent(webMapAsJson, extentToUseInBlueprint) {
            const webMapAsJsonObject = typeof webMapAsJson === "string" ? JSON.parse(webMapAsJson) : webMapAsJson;
            webMapAsJsonObject.mapOptions.extent = {
                xmin: extentToUseInBlueprint.xmin,
                xmax: extentToUseInBlueprint.xmax,
                ymin: extentToUseInBlueprint.ymin,
                ymax: extentToUseInBlueprint.ymax,
                spatialReference: {
                    wkid: extentToUseInBlueprint.spatialReference.wkid
                }
            };
            if (webMapAsJsonObject.mapOptions.scale) delete webMapAsJsonObject.mapOptions.scale;
            return JSON.stringify(webMapAsJsonObject);
        },

        _requestIsValid(requestParams, requestUrl) {
            return (
                this._requestMatchesConfiguredUrl(requestUrl) &&
                Boolean(requestParams?.Format) &&
                Boolean(requestParams?.Layout_Template) &&
                Boolean(requestParams?.f) &&
                Boolean(requestParams?.Web_Map_as_JSON)
            );
        }
    };
}
