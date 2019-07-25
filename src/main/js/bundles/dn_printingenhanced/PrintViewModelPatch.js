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
import PrintViewModel from "esri/widgets/Print/PrintViewModel";
import PrintTask from "esri/tasks/PrintTask";
import f from "esri/core/Error";
import u from "esri/request";
import S from "esri/tasks/support/PrintParameters";

export default class PrintingPropertiesOverWriter {

    activate() {
        PrintViewModel.prototype.printExtent = null;
        PrintViewModel.prototype.print = this.print;
        const properties = this._printingEnhancedProperties;
        PrintViewModel.prototype._allowSketching = properties.allowSketching;
    }

    print(e) {
        let extent;
        if (!this.view) return f.reject(new u("print:view-required", "view is not set"));
        this.scaleEnabled ? (this._viewpoint || (this._viewpoint = this.view.viewpoint.clone()), extent = this._getExtent(this._viewpoint, e.outScale)) : (this._viewpoint = null, extent = this._getExtent(this.view.viewpoint));
        const r = new S({view: this.view, template: e, extent: extent});
        if (this._allowSketching) {
            if (this.printExtent) {
                r.extent = this.printExtent;
                const oldRotation = r.view.rotation;
                r.view.rotation = this.printRotation;
                setTimeout(() => {
                    r.view.rotation = oldRotation;
                }, 500);
            } else {
                const oldRotation = r.view.rotation;
                r.view.rotation = 0;
                setTimeout(() => {
                    r.view.rotation = oldRotation;
                }, 500);
            }
        }
        return this._printTask.execute(r).catch(function (e) {
            return f.reject(new u("print:export-error", "An error occurred while exporting the web map.", {error: e}))
        });
    }

    setPrintSettings(event) {
        const geometry = event.getProperty("geometry");
        PrintViewModel.prototype.printExtent = geometry.extent;
        const rotation = this._computeAngle(geometry.rings[0][0], geometry.rings[0][1]);
        PrintViewModel.prototype.printRotation = rotation;
        PrintTask.prototype.printRotation = rotation;
    }

    _computeAngle(pointA, pointB) {
        return Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]) * 180 / Math.PI;
    }
}
