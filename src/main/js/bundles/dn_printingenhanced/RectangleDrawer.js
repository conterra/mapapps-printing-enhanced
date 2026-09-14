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
        async activateRectangleDrawing() {
            const that = this;
            if (this._activeDrawPromise) await this.cancelRectangleDrawing();
            this._activeDrawPromise = new CancelablePromise((resolve, reject, oncancel) => {
                let drawing = this._drawing;
                drawing.mode = "rectangle";
                if (this._drawListener) this._drawListener.remove();
                this._drawListener = drawing.watch("graphic", (evt) => {
                    let graphic = evt.value;
                    let geometry = graphic?.geometry;
                    if (!geometry) {
                        return;
                    }
                    that._deactivateRectangleDrawing();
                    that._activeDrawPromise = null;
                    resolve(geometry);
                });
                oncancel(() => {
                    that._deactivateRectangleDrawing();
                });
                drawing.active = true;
            });
            return this._activeDrawPromise;
        },

        async cancelRectangleDrawing() {
            if (this._activeDrawPromise && this._activeDrawPromise.cancel) {
                await this._activeDrawPromise.cancel();
                this._activeDrawPromise = null;
            } else {
                this._deactivateRectangleDrawing();
            }
        },

        _deactivateRectangleDrawing() {
            let drawing = this._drawing;
            drawing.active = false;
            let drawListener = this._drawListener;
            this._drawListener = undefined;
            if (drawListener) {
                drawListener.remove();
            }
        }
    };
}
