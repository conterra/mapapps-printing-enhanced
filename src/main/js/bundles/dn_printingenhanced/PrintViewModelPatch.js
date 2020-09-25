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
import PrintViewModel from "esri/widgets/Print/PrintViewModel";
import f from "esri/core/Error";
import u from "esri/request";
import S from "esri/tasks/support/PrintParameters";
import d_string from "dojo/string";
import ct_lang from "ct/_lang";
import async from "apprt-core/async";

export default class PrintingPropertiesOverWriter {

    activate() {
        PrintViewModel.prototype._printExtent = null;
        PrintViewModel.prototype.print = this.print;
        const properties = this._printingEnhancedProperties;
        PrintViewModel.prototype._enablePrintPreviewMovement = properties.enablePrintPreviewMovement;
        PrintViewModel.prototype._customTextElements = properties.customTextElements;
    }

    print(e) {
        let extent;
        if (!this.view) return f.reject(new u("print:view-required", "view is not set"));
        this.scaleEnabled ? (this._viewpoint || (this._viewpoint = this.view.viewpoint.clone()), extent = this._getExtent(this._viewpoint, e.outScale)) : (this._viewpoint = null, extent = this._getExtent(this.view.viewpoint));
        const r = new S({view: this.view, template: e, extent: extent});
        // set customTextElements
        if (this._customTextElements.length) {
            if (!r.template.layoutOptions.customTextElements) {
                r.template.layoutOptions.customTextElements = [];
            }
            let customTextElements = r.template.layoutOptions.customTextElements;
            if (this._user) {
                this._customTextElements.forEach((element) => {
                    ct_lang.forEachOwnProp(element, (value, name) => {
                        element[name] = d_string.substitute(value, this._user);
                    });
                    customTextElements.push(element)
                });
            } else {
                this._customTextElements.forEach((element) => {
                    customTextElements.push(element);
                })
            }
        }
        // set sketching properties to view
        let oldRotation = null;
        if (this._enablePrintPreviewMovement) {
            if (this._printExtent) {
                r.extent = this._printExtent;
                oldRotation = r.view.rotation;
                r.view.rotation = this._printRotation;
            } else {
                oldRotation = r.view.rotation;
                r.view.rotation = 0;
            }
        }
        const oldScale = r.view.scale;
        r.view.scale = r.template.outScale;
        return async(() => {
            const execute = this._printTask.execute(r);
            execute.catch(function (e) {
                return f.reject(new u("print:export-error", "An error occurred while exporting the web map.", {error: e}))
            });
            async(() => {
                r.view.scale = oldScale;
                if (oldRotation !== null) {
                    r.view.rotation = oldRotation;
                    oldRotation = null;
                }
            }, 500);
            return execute;
        }, 500);
    }

    setPrintSettings(event) {
        const geometry = event.getProperty("geometry");
        PrintViewModel.prototype._printExtent = geometry.extent;
        PrintViewModel.prototype._printRotation = this._computeAngle(geometry.rings[0][0], geometry.rings[0][1]);
    }

    setCustomTextElements(event) {
        PrintViewModel.prototype._customTextElements = event.getProperty("customTextElements");
    }

    setUserService(userService) {
        const properties = this._printingEnhancedProperties._properties;
        if (properties.useUsernameAsAuthor) {
            const authentication = userService.getAuthentication();
            if (!authentication.isAuthenticated()) {
                console.log("User not authenticated!");
                return;
            }
            PrintViewModel.prototype._user = authentication.getUser();
        }
    }

    _computeAngle(pointA, pointB) {
        return Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]) * 180 / Math.PI;
    }
}
