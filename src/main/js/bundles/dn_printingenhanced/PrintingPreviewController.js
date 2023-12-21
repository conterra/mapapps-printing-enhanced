/*
 * Copyright (C) 2023 con terra GmbH (info@conterra.de)
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

const _templateOptions = Symbol("_templateOptions");
const _printInfos = Symbol("_printInfos");
const _printServiceUrl = Symbol("_printServiceUrl");
const _connect = Symbol("_connect");
const _observers = Symbol("_observers");
const _lastPopupState = Symbol("_lastPopupState");
const _view = Symbol("_view");

export default declare({

    enablePrintPreview: false,

    activate() {
        const printWidget = this._printingWidget;
        const esriPrintWidget = printWidget._esriWidget;
        const printViewModel = esriPrintWidget.viewModel;
        const properties = this._printingEnhancedProperties._properties;
        this.enablePrintPreview = properties.enablePrintPreview;

        // get print infos
        const url = this[_printServiceUrl] = esriPrintWidget.printServiceUrl;
        this[_printInfos] = {};
        apprt_when(this._printingInfosAnalyzer.getPrintInfos(url), (printInfos) => {
            this[_printInfos] = printInfos;
            this._handleDrawTemplateDimensions();
        });

        if (!this[_observers]) {
            this[_observers] = new Observers();
        }
        // watch for changes
        this._watchForTemplateOptionsChanges(esriPrintWidget);

        // handle print preview before and after printing
        d_aspect.before(printViewModel, "print", (printTemplate) => {
            // show print preview
            this._printingPreviewDrawer.showGraphicsLayer(false);

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
                            element[name] = d_string.substitute(value, this._user);
                        });
                        customTextElements.push(element);
                    });
                } else {
                    properties.customTextElements.forEach((element) => {
                        customTextElements.push(element);
                    });
                }
            }
            // set sketching properties to view
            const view = printViewModel.view;
            this._oldRotation = null;
            this._oldScale = view.scale;
            if (properties.enablePrintPreviewMovement) {
                if (this._printExtent) {
                    view.extent = this._printExtent;
                    this._oldRotation = view.rotation;
                    view.rotation = this._printRotation;
                } else {
                    this._oldRotation = view.rotation;
                    view.rotation = 0;
                }
            }
            view.scale = printTemplate.outScale;
        });

        d_aspect.after(printViewModel, "print", (promise) => {
            async(() => {
                const view = printViewModel.view;

                // reset view properties
                view.scale = this._oldScale;
                if (this._oldRotation !== null) {
                    view.rotation = this._oldRotation;
                    this._oldRotation = null;
                }
                this._printingPreviewDrawer.showGraphicsLayer(true);
            }, 2000);
            return promise;
        });

        this.watch("enablePrintPreview", (args) => {
            this._handleDrawTemplateDimensions();
        });
    },

    deactivate() {
        this._printingPreviewDrawer.removeGraphicFromGraphicsLayer();
        this[_connect].disconnect();
        this[_observers].destroy();
        this[_lastPopupState]?.reset();
    },

    setMapWidgetModel(mapWidgetModel) {
        if (mapWidgetModel.view) {
            this._watchForExtentChange(mapWidgetModel.view);
            this[_view] = mapWidgetModel.view;
        } else {
            mapWidgetModel.watch("view", ({value: view}) => {
                this._watchForExtentChange(view);
                this[_view] = mapWidgetModel.view;
            });
        }
    },

    setPrintSettings(event) {
        const geometry = event.getProperty("geometry");
        this._printExtent = geometry.extent;
        this._printRotation = this._computeAngle(geometry.rings[0][0], geometry.rings[0][1]);
    },

    resetPrintGeometry() {
        this._printExtent = null;
        this._printRotation = null;
    },

    setPrintingToggleTool(tool) {
        this._printingToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onActivate", () => {
            this._handleDrawTemplateDimensions();
            this[_lastPopupState] = this._disablePopups();
        });
        connect.connect(tool, "onDeactivate", () => {
            this._printingPreviewDrawer.removeGraphicFromGraphicsLayer();
            this[_lastPopupState]?.reset();
        });
    },

    setPrintingEnhancedToggleTool(tool) {
        this._printingEnhancedToggleTool = tool;
        const connect = this[_connect] = new Connect();
        connect.connect(tool, "onActivate", () => {
            this._handleDrawTemplateDimensions();
            this[_lastPopupState] = this._disablePopups();
        });
        connect.connect(tool, "onDeactivate", () => {
            this._printingPreviewDrawer.removeGraphicFromGraphicsLayer();
            this[_lastPopupState]?.reset();
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

    _watchForTemplateOptionsChanges(esriPrintWidget) {
        const templateOptions = this[_templateOptions] = esriPrintWidget.templateOptions;
        this[_observers].add(templateOptions.watch("layout", () => {
            this._handleDrawTemplateDimensions(true);
        }));
        this[_observers].add(templateOptions.watch("scale", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("scaleEnabled", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("width", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("height", () => {
            this._handleDrawTemplateDimensions();
        }));
        this[_observers].add(templateOptions.watch("dpi", () => {
            this._handleDrawTemplateDimensions();
        }));
    },

    _watchForExtentChange(view) {
        if (!this[_observers]) {
            this[_observers] = new Observers();
        }
        const properties = this._printingEnhancedProperties;
        if (!properties.enablePrintPreviewMovement) {
            this[_observers].add(view.watch("stationary", (response) => {
                if (response) {
                    this._handleDrawTemplateDimensions();
                }
            }));
        }
    },

    _handleDrawTemplateDimensions(zoomTo) {
        this._printingPreviewDrawer.removeGraphicFromGraphicsLayer();
        const properties = this._printingEnhancedProperties._properties;
        async(() => {
            if (((this._printingToggleTool && this._printingToggleTool.active) ||
                this._printingEnhancedToggleTool.active) && this.enablePrintPreview) {
                const geometry = this._printingPreviewDrawer
                    .drawTemplateDimensions(this[_printInfos], this[_templateOptions], properties.defaultPageUnit);
                if (geometry && zoomTo && this[_templateOptions].scaleEnabled) {
                    this._zoomToTemplateExtent(geometry);
                }
            }
        }, 100);
    },

    _zoomToTemplateExtent(geometry) {
        if (!this[_view]) {
            return;
        }
        const expandFactor = 1.2;
        this[_view].goTo(geometry.extent.expand(expandFactor));
    },

    _computeAngle(pointA, pointB) {
        return Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]) * 180 / Math.PI;
    },

    _enablePopups() {
        if (!this[_view]) {
            return;
        }
    },

    _disablePopups() {
        const properties = this._printingEnhancedProperties._properties;
        if (!this[_view] || !properties.enablePrintPreview) {
            return;
        }
        const view = this[_view];
        const savedState = view.popup.autoOpenEnabled;
        view.popup.autoOpenEnabled = false;
        let executed = false;
        return {
            reset() {
                if (!executed && view.popup && !view.popup.destroyed) {
                    view.popup.autoOpenEnabled = savedState;
                }
                executed = true;
            }
        };
    }

});
