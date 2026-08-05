import Promise from "apprt-core/Promise";

/**
 * This Helper provides a queryable Promise through the method waitForPromiseToResolve. This promise can be resolved,
 * or rejected from the outside.
 * This is especially usefull, if you need to wait for something in function A,
 * that is resolved at a different function/component B.
 * (e.g. if you dont have full control of the code; using non-async esri-code.)
 */
export default class QueryablePromiseHelper {

    constructor() {
        const that = this;
        this._queryablePromiseResolveFunction = function (resolve, reject) {
            that.resolveFunction = resolve;
            that.rejectFunction = reject;
        }
    }

    async waitForPromiseToResolve() {
        this._initQueryablePromiseIfNeeded();
        return this._queryablePromise;
    }

    resolve(returnValue) {
        this.resolveFunction(returnValue);
    }

    reject(returnValue) {
        this.rejectFunction(returnValue);
    }

    _initQueryablePromiseIfNeeded() {
        if (!this._isQueryablePromisePending()) this._queryablePromise = this._createQuerablePromise();
    }

    _isQueryablePromisePending() {
        const promise = this._queryablePromise;
        if (!promise) return false;

        if (typeof promise.isPending === "function") {
            return promise.isPending();
        }
        return Boolean(promise.isPending);
    }

    _createQuerablePromise() {
        let promise = new Promise(this._queryablePromiseResolveFunction);

        // Set initial state
        var isPending = true;
        var isRejected = false;
        var isFulfilled = false;

        // Observe the promise, saving the fulfillment in a closure scope.
        var result = promise.then(
            function(v) {
                isFulfilled = true;
                isPending = false;
                return v;
            },
            function(e) {
                isRejected = true;
                isPending = false;
                throw e;
            }
        );

        result.isFulfilled = function() { return isFulfilled; };
        result.isPending = function() { return isPending; };
        result.isRejected = function() { return isRejected; };
        return result;
    }
}
