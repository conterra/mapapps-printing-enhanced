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
