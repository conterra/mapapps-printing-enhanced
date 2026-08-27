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
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import apprt_when from "apprt-core/when";
import {apprtFetch, ContentType} from "apprt-fetch";
import {createFormData} from "./utils";


const _geometry = Symbol("_geometry");
const _mainFrameGraphics = Symbol("_mainFrameGraphics");
const _omittedFrameGraphics = Symbol("_omittedFrameGraphics");
const _graphicsLayer = Symbol("_graphicsLayer");

/**
 * This Code is base upon the file "PrintingPreviewDrawer" of the original bundle dn_printingenhanced
 */
export default class PrintingMapSeriesPreviewDrawer {

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

    async drawMapSeriesFrames(mapSeriesExtent, printInfos, templateOptions, defaultPageUnit, doNotPrintEmptyTiles, mapSeriesExtentType, selectedObjectGeometry) {
        const geometryParams = this._printingPreviewDrawer.getGeometryParamsFromTemplate(printInfos, templateOptions, defaultPageUnit);
        let mainSeriesFrames = this._createAllMapFramesForMapSeries(mapSeriesExtent, geometryParams);

        if (mapSeriesExtentType === "object-geometry" && doNotPrintEmptyTiles && mainSeriesFrames?.length > 0) {
           mainSeriesFrames = await this._filterEmptyTiles(mainSeriesFrames, selectedObjectGeometry);
        } else {
            this.removeOmittedFramesFromGraphicsLayer();
        }

        this.removeMainFramesFromGraphicsLayer();
        this._addMainFramesToGraphicsLayer(mainSeriesFrames);
        return mainSeriesFrames;
    }

    async _filterEmptyTiles(mainSeriesFrames, selectedObjectGeometry) {
        if (!selectedObjectGeometry) {
            console.error("error while trying to filter tiles: selected object geometry is undefined");
            return mainSeriesFrames;
        }

        this._logService.info(this._i18n.get().ui.tileCalculationOngoing);

        let filteredMainSeriesFrames = [];
        let omittedSeriesFrames = [];
        await apprt_when(this._requestIntersections(mainSeriesFrames, selectedObjectGeometry), async (result)  => {
            const relations = result.relations;
            if(!Array.isArray(relations)){
                console.error("relation request did not return an array");
                filteredMainSeriesFrames = mainSeriesFrames;
                this._logService.error(this._i18n.get().ui.errors.filterEmptyTilesError);
                return;
            }
            mainSeriesFrames.forEach((frame, i)  => {
                // https://developers.arcgis.com/rest/services-reference/enterprise/relation.htm
                if(relations.find(result => result.geometry1Index === i)) {
                    filteredMainSeriesFrames.push(frame);
                } else {
                    omittedSeriesFrames.push(frame);
                }
            });
        }, (err) => {
            console.error(err);
            filteredMainSeriesFrames = mainSeriesFrames;
            this._logService.error(this._i18n.get().ui.errors.filterEmptyTilesError);
        })

        console.log(filteredMainSeriesFrames.length);
        console.log("number of omitted frames: " + omittedSeriesFrames.length);
        this.removeOmittedFramesFromGraphicsLayer();
        this._addOmittedFramesToGraphicsLayer(omittedSeriesFrames);
        return filteredMainSeriesFrames;
    }

    async _requestIntersections(mainSeriesFrames, selectedObjectGeometry){
        let geometriesJSONArray = mainSeriesFrames.map(frame => frame.geometry.toJSON());
        let selectedObjectGeometryType = this._getRestAPIGeometryType(selectedObjectGeometry);
        if(!selectedObjectGeometryType){
            return;
        }

        // https://developers.arcgis.com/rest/services-reference/enterprise/relation.htm
        let data = {
            f: "json",
            relation: "esriGeometryRelationIntersection ",
            sr: JSON.stringify({spatialReference: {latestWkid: 25832, wkid: 25832}}),
            geometries1: JSON.stringify({
                // frames/tiles are always polygons
                geometryType: "esriGeometryPolygon",
                geometries: geometriesJSONArray
            }),
            geometries2: JSON.stringify({
                geometryType: this._getRestAPIGeometryType(selectedObjectGeometry),
                geometries: [selectedObjectGeometry.toJSON()]
            }),
            handleAs: "json"
        }

        const separator = this._properties.geometryServerURL.endsWith("/") ? "" : "/"
        const response = apprtFetch(this._properties.geometryServerURL + separator + "relation", {
            method: "POST",
            body: createFormData(data),
            headers: {
                /*"Content-Type": ContentType.JSON_UTF8,*/
                "Accept": ContentType.JSON
            }
        });
        return (await response).json();
    }

    _getRestAPIGeometryType(geometry) {
        let selectedObjectGeometryType;
        switch (geometry.type){
            case "point":
                selectedObjectGeometryType = "esriGeometryPoint"
                break;
            case "multipoint":
                selectedObjectGeometryType = "esriGeometryMultipoint"
                break;
            case "polyline":
                selectedObjectGeometryType = "esriGeometryPolyline"
                break;
            case "polygon":
                selectedObjectGeometryType = "esriGeometryPolygon"
                break
        }
        return selectedObjectGeometryType;
    }

    _createAllMapFramesForMapSeries(mapSeriesExtent, geometryParams) {
        if(!mapSeriesExtent || !mapSeriesExtent.width > 0 || !mapSeriesExtent.height > 0 ){
            console.warn("mapSeriesExent must extent width and height must be higher than 0 ")
            return [];
        }
        if (!geometryParams || !(geometryParams.width > 0) || !(geometryParams.height > 0)) {
            console.warn("geometryParams must extent width and height must be higher than 0");
            return [];
        }

        // Overlap (0 ... 0.49) => z.B. 0.05 = 5%
        const overlap = Math.min(Math.max(
            this._printingEnhancedProperties?._properties?.mapSeriesTileOverlap ?? 0.05, 0
        ), 0.49);

        const frameWidth = geometryParams.width;
        const frameHeight = geometryParams.height;

        // Schrittweite kleiner als Framegröße -> Overlap
        const stepX = frameWidth * (1 - overlap);
        const stepY = frameHeight * (1 - overlap);

        // Benötigte Spalten/Zeilen zur Abdeckung
        const numberOfColumns = Math.max(1, Math.ceil((mapSeriesExtent.width - frameWidth) / stepX) + 1);
        const numberOfRows = Math.max(1, Math.ceil((mapSeriesExtent.height - frameHeight) / stepY) + 1);
        // Sicherheitsgrenze
        if (numberOfColumns * numberOfRows > this._properties.maxNumberOfDrawnFrames) {
            console.warn(`Canceling, because there are too many MapFrames to draw: ${numberOfRows * numberOfColumns}. Allowed number of frames: ${this._properties.maxNumberOfDrawnFrames}`);
            this._logService.error(this._i18n.get().ui.errors.tooManyFrames);
            return [];
        }

        // Tatsächliche abgedeckte Gesamtbreite/-höhe (inkl. Overlap)
        const coveredWidth = frameWidth + (numberOfColumns - 1) * stepX;
        const coveredHeight = frameHeight + (numberOfRows - 1) * stepY;

        // Zentrierung um den Serien-Extent
        const halfWidthAroundFeature = (coveredWidth - mapSeriesExtent.width) / 2;
        const halfHeightAroundFeature = (coveredHeight - mapSeriesExtent.height) / 2;

        const topLeftPoint = {
            x: mapSeriesExtent.xmin - halfWidthAroundFeature,
            y: mapSeriesExtent.ymax + halfHeightAroundFeature
        }
        let allMapFrames = [];

        for (let row = 0 ; row < numberOfRows ; row++) {
            for (let col = 0 ; col < numberOfColumns ; col++) {
                const newTopLeftPoint = {
                    x: topLeftPoint.x + (col * stepX),
                    y: topLeftPoint.y - (row * stepY)
                }
                const singleMainFrame = {
                    row: row,
                    col: col,
                    geometry: this._createSingleMainFramePolygonForMapSeries(newTopLeftPoint, geometryParams)
                };
                allMapFrames.push(singleMainFrame);
            }
        }
        return allMapFrames;
    }

    _createSingleMainFramePolygonForMapSeries(topLeftPoint, geometryParams) {
        if(!geometryParams || !geometryParams.width > 0 || !geometryParams.height > 0 ){
            console.warn("geometryParams must exists and its width and height must be higher than 0 ")
        }
        const mapWidgetModel = this._mapWidgetModel;
        const view = mapWidgetModel.view;

        const x = topLeftPoint.x;
        const y = topLeftPoint.y;
        const width = geometryParams.width;
        const height = geometryParams.height;

        const rings = [
            [x, y],
            [x, y - height],
            [x + width, y - height],
            [x + width, y],
            [x, y]
        ];

        return new Polygon({
            rings: rings,
            spatialReference: view.spatialReference
        });
    }

    _addGraphicsLayerToMap(map) {
        /*const mapWidgetModel = this._mapWidgetModel;*/
        const graphicsLayer = this[_graphicsLayer] = new GraphicsLayer({
            id: "printMapSeriesPreviewLayer",
            listMode: "hide"
        });
        map.add(graphicsLayer);
        /*const properties = this._printingEnhancedProperties;
        if (!properties.enablePrintPreviewMovement) {
            return;
        }*/
        /*if (mapWidgetModel.view) {
            this._createSketchViewModel(graphicsLayer, mapWidgetModel.view);
        } else {
            mapWidgetModel.watch("view", ({value: view}) => {
                this._createSketchViewModel(graphicsLayer, view);
            });
        }*/
    }

    _removeGraphicsLayerFromMap(map) {
        map.remove(this[_graphicsLayer]);
    }

    /*_createSketchViewModel(graphicsLayer, view) {
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
                this[_geometry] = geometry;
                this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", {geometry: geometry});
            }
        });
    }*/

    _addMainFramesToGraphicsLayer(mainFrames) {
        if (!mainFrames || !mainFrames.length || mainFrames.length === 0)
            return;

        const properties = this._printingEnhancedProperties;
        const symbol = properties.printingPreviewSymbol;
        const mainFrameGraphics = this[_mainFrameGraphics] = mainFrames.map((frame) => {
            return new Graphic({
                geometry: frame.geometry,
                symbol: symbol
            })
        });
        this[_graphicsLayer].addMany(mainFrameGraphics);
        /*if (properties.enablePrintPreviewMovement) {
            this._eventService.postEvent("dn_printingenhanced/PRINTSETTINGS", {geometry: mainFrames.geometry});
        }*/
    }

    _addOmittedFramesToGraphicsLayer(omittedFrames) {
        if (!omittedFrames || !omittedFrames.length || omittedFrames.length === 0)
            return;

        const properties = this._printingEnhancedProperties;
        const symbol = properties.printingPreviewOmittedTilesSymbol;
        const omittedFrameGraphics = this[_omittedFrameGraphics] = omittedFrames.map((frame) => {
            return new Graphic({
                geometry: frame.geometry,
                symbol: symbol
            })
        });
        this[_graphicsLayer].addMany(omittedFrameGraphics);
    }

    removeMainFramesFromGraphicsLayer() {
        if (this[_mainFrameGraphics]) {
            this[_graphicsLayer].removeMany(this[_mainFrameGraphics]);
        }
        /*this._completeSketching();*/
    }

    removeOmittedFramesFromGraphicsLayer() {
        if (this[_omittedFrameGraphics]) {
            this[_graphicsLayer].removeMany(this[_omittedFrameGraphics]);
        }
    }

    /*_completeSketching() {
        const sketchViewModel = this[_sketchViewModel];
        sketchViewModel && sketchViewModel.complete();
    }*/

    showGraphicsLayer(value) {
        this[_graphicsLayer].visible = value;
        /*this._completeSketching();*/
    }
}
