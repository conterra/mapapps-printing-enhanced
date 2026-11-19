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

/**
 * Enables or disables the legend of a print request (blueprint).
 *
 * The print service does not know a "legendEnabled" flag: the legend content is defined by
 * layoutOptions.legendOptions.operationalLayers (an empty array means no legend). This is also
 * how the Esri print widget implements templateOptions.legendEnabled = false.
 *
 * The original legend layers are kept on the blueprint (outside of the request body, so they are not sent),
 * so the legend can be enabled again later, e.g. for the overview or legend page of a map series.
 * Layers added to the web map afterwards (e.g. the frames of the overview page) are not part of that list
 * and therefore never appear in the legend.
 *
 * @param blueprint print request blueprint ({url, body, ...})
 * @param layoutOptions layoutOptions of the blueprint's parsed Web_Map_as_JSON, modified in place
 * @param {boolean} legendEnabled
 */
export function applyLegendEnabled(blueprint, layoutOptions, legendEnabled) {
    const legendLayers = layoutOptions.legendOptions?.operationalLayers;
    if (!blueprint.legendOperationalLayers && legendLayers?.length) {
        blueprint.legendOperationalLayers = legendLayers;
    }
    layoutOptions.legendOptions = {
        ...layoutOptions.legendOptions,
        operationalLayers: legendEnabled
            ? blueprint.legendOperationalLayers ?? legendLayers ?? []
            : []
    };
    delete layoutOptions.legendEnabled;
}
