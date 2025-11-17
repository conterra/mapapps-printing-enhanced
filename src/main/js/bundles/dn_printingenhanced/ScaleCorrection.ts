///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {Extent, SpatialReference} from "@arcgis/core/geometry";
import {webMercatorToGeographic} from "@arcgis/core/geometry/support/webMercatorUtils";
import Polyline from "@arcgis/core/geometry/Polyline";
import { type View } from "map-widget/api";
import {geodesicLength} from "@arcgis/core/geometry/geometryEngine";

// Taken from map.apps (MAPAPPS-5677: Correct scale when using web mercator)
export default class ScaleCorrection {
    computedScale(view?: View, currentExtent?: Extent, spatialReference?: SpatialReference): number | undefined {
        if (!view) {
            return;
        }

        if (
            view.type != "2d" ||
            isViewPadded(view) ||
            !spatialReference ||
            !spatialReference.isWebMercator ||
            !currentExtent
        ) {
            return view.scale;
        }

        // convert line from 3857 to 4326
        const line = webMercatorToGeographic(
            // calculation based on bottom line of current extent
            new Polyline({
                paths: [
                    [
                        [currentExtent.xmin, currentExtent.ymin],
                        [currentExtent.xmax, currentExtent.ymin]
                    ]
                ],
                spatialReference: spatialReference
            })
        );

        // actual distance in cm displayed with current extent
        const lineLengthCentimeters = geodesicLength(line, "meters") * 100;
        const lineAmountPixels = view.width;

        // actual distance displayed with X pixels, normalized by current dots per inch (1 inch = 2.54 cm)
        // e.g ( 4000 cm / 500 px ) * ( 96 / 2.54 => 37,795 pixel / 1 cm )
        const scale = (lineLengthCentimeters / lineAmountPixels) * (96 / 2.54);

        return scale;
    }
}

// do not recalculate, if current view has white paddings on left / right side -> already zoomed out max.
function isViewPadded(view: View) {
    /* not documented, see ScaleBarViewModel */
    const paddedViewState = (view as any)?.state?.paddedViewState;
    const spatialReference = view?.spatialReference;
    return spatialReference?.isWrappable && paddedViewState?.worldScreenWidth < view.width;
}
