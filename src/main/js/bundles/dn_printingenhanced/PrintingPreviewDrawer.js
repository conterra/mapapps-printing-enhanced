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
import Polygon from "esri/geometry/Polygon";
import Graphic from "esri/Graphic";
import * as geometryEngine from "esri/geometry/geometryEngine";
import geometry from "ct/mapping/geometry";

export default class PrintingPreviewDrawer {

    drawTemplateDimensions(printInfos, templateOptions, defaultPageUnit) {
        const mapWidgetModel = this._mapWidgetModel;
        if (!printInfos.templateInfos) {
            return;
        }
        let printSize = this._getPrintSize(printInfos, templateOptions, defaultPageUnit);
        if (!printSize) {
            return;
        }
        let width = printSize.width;
        let height = printSize.height;

        let geometryParams = {
            width: width,
            height: height,
            rotation: mapWidgetModel.rotation
        };

        let geometry = this._getMainFrameGeometry(geometryParams);
        this.removeGraphicFromView();
        this.addGraphicToView(geometry);
    }

    _getPrintSize(printInfos, templateOptions, defaultPageUnit) {
        let printSize = {};
        let templateWidth;
        let templateHeight;
        let printScale = templateOptions.scale;
        let dpi = templateOptions.dpi;
        const mapWidgetModel = this._mapWidgetModel;
        const spatialReference = mapWidgetModel.spatialReference;

        // get templateinfo
        let templateInfos = printInfos.templateInfos;
        let layout = templateOptions.layout;
        if (!layout || layout && layout === "MAP_ONLY") {
            let resolution = geometry.calcPixelResolutionAtScale(printScale, spatialReference, dpi);
            templateWidth = templateOptions.width;
            templateHeight = templateOptions.height;
            printSize.width = (templateWidth * resolution);
            printSize.height = (templateHeight * resolution);
        } else {
            let templateInfo = templateInfos.find((templateInfo) => {
                let layoutName = templateInfo.layoutTemplate.toLowerCase();
                layoutName = layoutName.replace(new RegExp(" ", 'g'), "-");
                return layoutName === layout
            });
            let frameSize = templateInfo.activeDataFrameSize || templateInfo.webMapFrameSize;
            templateWidth = frameSize[0];
            templateHeight = frameSize[1];

            // currently only meter is supported
            let templateUnit = templateInfo.pageUnits || defaultPageUnit;

            printSize.width = this._convertTemplateSizeTo(templateWidth, printScale, templateUnit);
            printSize.height = this._convertTemplateSizeTo(templateHeight, printScale, templateUnit);
        }
        return printSize;
    }

    _convertTemplateSizeTo(value, scale, unit) {
        const coordinateTransformer = this._coordinateTransformer;
        //let spatialRederence = this._mapWidgetModel && this._mapWidgetModel.spatialReference;
        //let wkid = spatialRederence && spatialRederence.wkid || spatialRederence.latestWkid;
        let factor;
        switch (unit) {
            case "CENTIMETER":
                factor = 100;
                break;
            case "INCH":
                factor = 39.3701;
                break;
        }
        return value * scale / factor;
    }

    _getMainFrameGeometry(geometryParams) {
        const mapWidgetModel = this._mapWidgetModel;
        const view = mapWidgetModel.view;
        const centerPoint = mapWidgetModel.center;

        let x = centerPoint.x;
        let y = centerPoint.y;
        let halfWidth = geometryParams.width / 2;
        let halfHeight = geometryParams.height / 2;

        const rings = [
            [x - halfWidth, y - halfHeight],
            [x + halfWidth, y - halfHeight],
            [x + halfWidth, y + halfHeight],
            [x - halfWidth, y + halfHeight],
            [x - halfWidth, y - halfHeight]
        ];

        let polygon = new Polygon({
            rings: rings,
            spatialReference: view.spatialReference
        });
        return geometryEngine.rotate(polygon, geometryParams.rotation);
    }

    addGraphicToView(geometry) {
        let view = this._mapWidgetModel.get("view");
        let symbol = {
            type: "simple-fill",
            color: [255, 0, 0, 0.25],
            style: "solid",
            outline: {
                color: [255, 0, 0, 1],
                width: "2px"
            }
        };
        let graphic = this.graphic = new Graphic({
            geometry: geometry,
            symbol: symbol
        });
        view.graphics.add(graphic);
    }

    removeGraphicFromView() {
        if (this.graphic) {
            let view = this._mapWidgetModel.get("view");
            view.graphics.remove(this.graphic);
        }
    }
}
