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
import Polygon from "esri/geometry/Polygon";
import Extent from "esri/geometry/Extent";
import Graphic from "esri/Graphic";
import * as geometryEngine from "esri/geometry/geometryEngine";
import geometry from "ct/mapping/geometry";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import LayoutHelper from "./LayoutHelper";
import ScaleCorrection from "./ScaleCorrection";

const _geometry = Symbol("_geometry");
const _graphic = Symbol("_graphic");
const _differenceGraphic = Symbol("_differenceGraphic");
const _graphicsLayer = Symbol("_graphicsLayer");
const _sketchViewModel = Symbol("_sketchViewModel");
const _outsideGraphicsLayer = Symbol("_outsideGraphicsLayer");

export default class PrintingPreviewDrawer {

    activate() {
        const mapWidgetModel = this._mapWidgetModel;
        if (mapWidgetModel.map) {
            this._addGraphicsLayerToMap(mapWidgetModel.map);
        } else {
            mapWidgetModel.watch("map", ({value: map}) => {
                this._addGraphicsLayerToMap(map);
            });
        }
        this[_geometry] = null;
    }

    deactivate() {
        const mapWidgetModel = this._mapWidgetModel;
        const map = mapWidgetModel.map;
        this._removeGraphicsLayerFromMap(map);
    }

    async drawTemplateDimensions(printInfos, templateOptions, defaultPageUnit) {
        const mapWidgetModel = this._mapWidgetModel;
        if (!printInfos.templateInfos) {
            return;
        }
        const printSize = this._getPrintSize(printInfos, templateOptions, defaultPageUnit);
        if (!printSize) {
            return;
        }
        const width = printSize.width;
        const height = printSize.height;

        const geometryParams = {
            width: width,
            height: height,
            rotation: mapWidgetModel.rotation
        };
        const geometry = this._getMainFrameGeometry(geometryParams);
        const differenceGeometry = await this._getOutsideMainFrameGeometry(geometry);
        this.removeGraphicFromGraphicsLayer();
        this._addMainGraphicToGraphicsLayer(geometry);
        this._addOutsideMainGraphicToGraphicsLayer(differenceGeometry);
        return geometry;
    }

    _getPrintSize(printInfos, templateOptions, defaultPageUnit) {
        const printSize = {};
        let templateWidth;
        let templateHeight;
        let printScale = templateOptions.scale;
        const mapWidgetModel = this._mapWidgetModel;

        if (printScale === -1) {
            const correctedScale = new ScaleCorrection().computedScale(mapWidgetModel.view, mapWidgetModel.extent, mapWidgetModel.spatialReference);
            printScale = correctedScale;
        }
        const dpi = templateOptions.dpi;
        const spatialReference = mapWidgetModel.spatialReference;

        // get templateinfo
        const templateInfos = printInfos.templateInfos;
        const layout = templateOptions.layout;
        if (!layout || layout && layout === "MAP_ONLY") {
            const resolution = geometry.calcPixelResolutionAtScale(printScale, spatialReference, dpi);
            templateWidth = templateOptions.width;
            templateHeight = templateOptions.height;
            printSize.width = (templateWidth * resolution);
            printSize.height = (templateHeight * resolution);
        } else {
            const templateInfo = templateInfos.find((templateInfo) => {
                const layoutName = templateInfo.layoutTemplate;
                const currentLayoutName = LayoutHelper.getLayoutName(layout);
                return layoutName === currentLayoutName;
            });
            if (!templateInfo) {
                return null;
            }
            const frameSize = templateInfo.activeDataFrameSize || templateInfo.webMapFrameSize;
            if (!frameSize) {
                console.error("Neither 'activeDataFrameSize' nor 'webMapFrameSize' are available on the selected layout template. Did you run the 'Get Layout Templates Info' script when publishing this template?");
                return;
            }
            templateWidth = frameSize[0];
            templateHeight = frameSize[1];

            // currently only meter is supported
            const templateUnit = templateInfo.pageUnits || defaultPageUnit;

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
        return value * scale / factor;
    }

    _getMainFrameGeometry(geometryParams) {
        const mapWidgetModel = this._mapWidgetModel;
        const view = mapWidgetModel.view;
        let centerPoint = mapWidgetModel.center;
        if (this[_graphic]) {
            centerPoint = this[_graphic].geometry.centroid;
        }

        const x = centerPoint.x;
        const y = centerPoint.y;

        const halfWidth = geometryParams.width / 2;
        const halfHeight = geometryParams.height / 2;

        const rings = [
            [x - halfWidth, y - halfHeight],
            [x + halfWidth, y - halfHeight],
            [x + halfWidth, y + halfHeight],
            [x - halfWidth, y + halfHeight],
            [x - halfWidth, y - halfHeight]
        ];

        const polygon = new Polygon({
            rings: rings,
            spatialReference: view.spatialReference
        });
        return geometryEngine.rotate(polygon, geometryParams.rotation);
    }

    async _getOutsideMainFrameGeometry(geometry) {
        const fullExtent = new Extent({
            "xmin": -20037507.067161843,
            "ymin": -19971868.880408604,
            "xmax": 20037507.067161843,
            "ymax": 19971868.8804085,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        });
        return await geometryEngine.difference(fullExtent, geometry);
    }

    _addGraphicsLayerToMap(map) {
        const properties = this._printingEnhancedProperties;
        const mapWidgetModel = this._mapWidgetModel;
        const graphicsLayer = this[_graphicsLayer] = new GraphicsLayer({
            id: properties.graphicsLayerId,
            title: properties.graphicsLayerTitle,
            listMode: "hide",
            internal: true
        });
        map.add(graphicsLayer);
        const outsideGraphicsLayer = this[_outsideGraphicsLayer] = new GraphicsLayer({
            id: properties.graphicsLayerId,
            title: properties.graphicsLayerTitle,
            listMode: "hide",
            internal: true
        });
        map.add(graphicsLayer);
        if (!properties.enablePrintPreviewMovement) {
            return;
        }
        if (mapWidgetModel.view) {
            this._createSketchViewModel(graphicsLayer, mapWidgetModel.view);
        } else {
            mapWidgetModel.watch("view", ({value: view}) => {
                this._createSketchViewModel(graphicsLayer, view);
            });
        }
    }

    _removeGraphicsLayerFromMap(map) {
        map.remove(this[_graphicsLayer]);
    }

    _createSketchViewModel(graphicsLayer, view) {
        const sketchViewModel = this[_sketchViewModel] = new SketchViewModel({
            view: view,
            layer: graphicsLayer,
            updateOnGraphicClick: true,
            defaultUpdateOptions: {
                toggleToolOnClick: false,
                enableRotation: true,
                enableScaling: false,
                multipleSelectionEnabled: false
            }
        });
        sketchViewModel.on("update", async (event) => {
            const graphics = event.graphics;
            if (graphics.length) {
                const graphic = graphics[0];
                const geometry = graphic.geometry;
                if (geometry.rings.length > 1) {
                    sketchViewModel.complete();
                }
                this[_geometry] = geometry;
                this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", { geometry: geometry });

                if (this[_differenceGraphic]) {
                    this[_graphicsLayer].remove(this[_differenceGraphic]);
                }
                const differenceGeometry = await this._getOutsideMainFrameGeometry(geometry);
                this._addOutsideMainGraphicToGraphicsLayer(differenceGeometry);
            }
        });
    }

    _addMainGraphicToGraphicsLayer(geometry) {
        const properties = this._printingEnhancedProperties;
        const graphic = this[_graphic] = new Graphic({
            geometry: geometry,
            symbol: properties.printingPreviewSymbol
        });
        this[_graphicsLayer].add(graphic);
        if (properties.enablePrintPreviewMovement) {
            this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", {geometry: graphic.geometry});
        }
    }

    _addOutsideMainGraphicToGraphicsLayer(geometry) {
        const properties = this._printingEnhancedProperties;
        const differenceGraphic = this[_differenceGraphic] = new Graphic({
            geometry: geometry,
            symbol: properties.printingOutsidePreviewSymbol
        });
        this[_graphicsLayer].add(differenceGraphic);
    }

    _completeSketching() {
        const sketchViewModel = this[_sketchViewModel];
        sketchViewModel && sketchViewModel.complete();
    }

    resetGraphic() {
        if (this[_graphic]) {
            this[_graphic] = null;
        }
        if (this[_differenceGraphic]) {
            this[_differenceGraphic] = null;
        }
    }

    removeGraphicFromGraphicsLayer() {
        if (this[_graphic]) {
            this[_graphicsLayer].remove(this[_graphic]);
        }
        if (this[_differenceGraphic]) {
            this[_graphicsLayer].remove(this[_differenceGraphic]);
        }
        this._completeSketching();
    }

    showGraphicsLayer(value) {
        this[_graphicsLayer].visible = value;
        this._completeSketching();
    }
}
