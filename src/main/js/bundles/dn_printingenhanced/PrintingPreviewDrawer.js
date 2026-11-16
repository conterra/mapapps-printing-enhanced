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
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import geometry from "ct/mapping/geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import LayoutHelper from "./LayoutHelper";
import ScaleCorrection from "./ScaleCorrection";

const _geometry = Symbol("_geometry");
const _graphic = Symbol("_graphic");
const _differenceGraphic = Symbol("_differenceGraphic");
const _graphicsLayer = Symbol("_graphicsLayer");
const _sketchViewModel = Symbol("_sketchViewModel");
const OVERLAY_EXTENT_EXPAND_FACTOR = 3;

let _graphicsLayerWatcher;
let _rotation;
export default class PrintingPreviewDrawer {
    activate() {
        const properties = this._printingEnhancedProperties;
        const mapWidgetModel = this._mapWidgetModel;
        const graphicsLayer = this[_graphicsLayer] = new GraphicsLayer({
            id: properties.graphicsLayerId,
            title: properties.graphicsLayerTitle,
            listMode: "hide",
            internal: true
        });
        if (mapWidgetModel.map) {
            this._createGraphicsLayerWatcher(mapWidgetModel.map, graphicsLayer);
            this._addGraphicsLayerToMap(mapWidgetModel.map, graphicsLayer);
        } else {
            mapWidgetModel.watch("map", ({ value: map }) => {
                this._createGraphicsLayerWatcher(map, graphicsLayer);
                this._addGraphicsLayerToMap(map, graphicsLayer);
            });
        }
        this[_geometry] = null;
    }
    setRotation(rotation) {
        this._rotation = rotation;
    }

    deactivate() {
        const mapWidgetModel = this._mapWidgetModel;
        const map = mapWidgetModel.map;
        this._removeGraphicsLayerFromMap(map);
        this._graphicsLayerWatcher.remove();
    }

    async drawTemplateDimensions(printInfos, templateOptions, defaultPageUnit) {
        const mapWidgetModel = this._mapWidgetModel;
        if (!printInfos.templateInfos) {
            this.removeGraphicFromGraphicsLayer();
            return;
        }
        const printSize = this._getPrintSize(printInfos, templateOptions, defaultPageUnit);
        if (!printSize) {
            this.removeGraphicFromGraphicsLayer();
            return;
        }
        const width = printSize.width;
        const height = printSize.height;

        const geometryParams = {
            width: width,
            height: height,
            rotation: this._rotation ? this._rotation : mapWidgetModel.rotation
        };
        const geometry = this._getMainFrameGeometry(geometryParams);
        const differenceGeometry = this._getOutsideMainFrameGeometry(geometry);
        if (this._isPreviewDisplayed()) {
            this._updatePreviewGraphics(geometry, differenceGeometry);
        } else {
            this.removeGraphicFromGraphicsLayer();
            this._addMainGraphicToGraphicsLayer(geometry);
            this._addOutsideMainGraphicToGraphicsLayer(differenceGeometry);
        }
        return geometry;
    }

    _isPreviewDisplayed() {
        const graphics = this[_graphicsLayer].graphics;
        return graphics.includes(this[_graphic]) && graphics.includes(this[_differenceGraphic]);
    }

    _updatePreviewGraphics(geometry, differenceGeometry) {
        this._completeSketching();
        this[_graphic].geometry = geometry;
        this[_differenceGraphic].geometry = differenceGeometry;
        this._postPrintSettings(geometry);
    }

    _postPrintSettings(geometry) {
        if (this._printingEnhancedProperties.enablePrintPreviewMovement) {
            this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", { geometry: geometry });
        }
    }

    _getPrintSize(printInfos, templateOptions, defaultPageUnit) {
        const printSize = {};
        let templateWidth;
        let templateHeight;
        let printScale = templateOptions.scale;
        const mapWidgetModel = this._mapWidgetModel;

        if (printScale === -1) {
            const correctedScale = new ScaleCorrection().computedScale(
                mapWidgetModel.view,
                mapWidgetModel.extent,
                mapWidgetModel.spatialReference
            );
            printScale = correctedScale;
        }
        const dpi = templateOptions.dpi;
        const spatialReference = mapWidgetModel.spatialReference;

        // get templateinfo
        const templateInfos = printInfos.templateInfos;
        const layout = templateOptions.layout;
        if (!layout || (layout && layout === this._printingEnhancedProperties.layoutNames.mapOnly)) {
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
        const isFrameMovableByUser = this._printingEnhancedProperties.enablePrintPreviewMovement;
        let centerPoint = mapWidgetModel.center;
        if (isFrameMovableByUser && this[_graphic]) {
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

    moveFrameToViewCenter() {
        if (!this._isLivePreviewUpdateEnabled() || !this._isPreviewDisplayed()) {
            return;
        }
        const frame = this[_graphic].geometry;
        const viewCenter = this._mapWidgetModel.view.center;
        const movedFrame = this._translatePolygon(
            frame,
            viewCenter.x - frame.centroid.x,
            viewCenter.y - frame.centroid.y
        );
        this[_graphic].geometry = movedFrame;
        this[_differenceGraphic].geometry = this._getOutsideMainFrameGeometry(movedFrame);
    }

    _isLivePreviewUpdateEnabled() {
        const properties = this._printingEnhancedProperties;
        return !properties.enablePrintPreviewMovement && properties.livePrintPreviewUpdate;
    }

    _translatePolygon(polygon, dx, dy) {
        return new Polygon({
            rings: polygon.rings.map((ring) => ring.map(([x, y]) => [x + dx, y + dy])),
            spatialReference: polygon.spatialReference
        });
    }

    _getOutsideMainFrameGeometry(geometry) {
        // Graphics are rendered slightly delayed while the map moves.
        // The enlarged extent prevents undarkened stripes from flickering at the map borders.
        const overlayExtent = this._mapWidgetModel.view.extent.clone().expand(OVERLAY_EXTENT_EXPAND_FACTOR);
        return geometryEngine.difference(overlayExtent, geometry);
    }

    _addGraphicsLayerToMap(map, graphicsLayer) {
        const properties = this._printingEnhancedProperties;
        const mapWidgetModel = this._mapWidgetModel;

        map.add(graphicsLayer);

        if (!properties.enablePrintPreviewMovement) {
            return;
        }
        if (mapWidgetModel.view) {
            this._createSketchViewModel(graphicsLayer, mapWidgetModel.view);
        } else {
            mapWidgetModel.watch("view", ({ value: view }) => {
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
        sketchViewModel.on("update", (event) => {
            const graphics = event.graphics;
            if (graphics.length) {
                const graphic = graphics[0];
                const geometry = graphic.geometry;
                // Only handle update if geometry is the main frame (single ring)
                if (geometry.rings.length > 1) {
                    // If user clicked outside, just complete the sketch, do not update main geometry or difference
                    sketchViewModel.complete();
                    return;
                }
                this[_geometry] = geometry;
                this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", { geometry: geometry });

                if (this[_differenceGraphic]) {
                    this[_graphicsLayer].remove(this[_differenceGraphic]);
                }
                const differenceGeometry = this._getOutsideMainFrameGeometry(geometry);
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
        this._postPrintSettings(geometry);
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

    _createGraphicsLayerWatcher(map, graphicsLayer) {
        this._graphicsLayerWatcher = map.layers.on("after-add", () => {
            map.reorder(graphicsLayer, map.layers.length - 1);
        });
    }
}
