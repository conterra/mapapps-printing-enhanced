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
import CancelablePromise from "apprt-core/CancelablePromise";

export default function () {
    return {
        async selectFeatureGeometry(layerIds) {
            if (this._activeSelectionPromise) await this.cancelSelection();

            const view = this._mapWidgetModel.view;
            const layers = layerIds
                .map((layerId) => {
                    const layer = this._mapWidgetModel.map.findLayerById(layerId);
                    if (!layer) {
                        console.error("configured selection layer not found in map: " + layerId);
                    }
                    return layer;
                })
                .filter(Boolean);

            this._activeSelectionPromise = new CancelablePromise((resolve, reject, oncancel) => {
                const clickHandle = view.on("click", (event) => {
                    event.stopPropagation();
                    clickHandle.remove();
                    this._activeSelectionPromise = null;

                    view.hitTest(event, {include: layers}).then((hitTestResult) => {
                        const results = hitTestResult.results;
                        if (results.length > 1) {
                            console.warn(`Multiple features (${results.length}) found at the selected location; using the topmost one.`);
                        }
                        resolve(results[0]?.graphic?.geometry);
                    }, reject);
                });
                oncancel(() => {
                    clickHandle.remove();
                });
            });
            return this._activeSelectionPromise;
        },

        cancelSelection() {
            if (this._activeSelectionPromise?.cancel) {
                return this._activeSelectionPromise.cancel();
            }
        }
    };
}
