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

// Make sure the legendValue is one of the configured values.
// If only one legend mode is configured, this also makes sure this mode is used
// (no option shown in UI). Map-only exports are plain images with no way to embed
// a legend, so "integratedLegend" isn't a valid choice there.
export function normalizeLegendValue(legendValue, legendModes = [], forMapOnly = false) {
    let modes = legendModes;
    if (forMapOnly) {
        modes = modes.filter((mode) => mode !== "integratedLegend");
    }
    if (modes.includes(legendValue)) {
        return legendValue;
    }
    return modes[0] || "noLegend";
}
