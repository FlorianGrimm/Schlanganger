define("schlanganger-log", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.log = {
        // error: ((message?: any, ...optionalParams: any[]) => void);
        // log: ((message?: any, ...optionalParams: any[]) => void);
        // debug: ((message?: any, ...optionalParams: any[]) => void);
        error: function _logToConsoleError(err) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            var target = err.stack || err || "Error";
            if (console && console.error) {
                console.error(target);
            }
            else if (console && console.log) {
                console.log(target);
            }
        },
        log: function _logToConsoleLog(message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            if (console && console.log) {
                console.log(message);
            }
        },
        debug: function _logToConsoleDebug(message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            if (console && console.debug) {
                console.debug(message);
            }
            else if (console && console.log) {
                console.log(message);
            }
        }
    };
});
