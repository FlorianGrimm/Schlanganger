define("recyclejs-symbol-observable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function symbolObservablePonyfill(root) {
        var result;
        var _Symbol = root.Symbol;
        if (typeof _Symbol === 'function') {
            if (_Symbol.observable) {
                result = _Symbol.observable;
            }
            else {
                result = _Symbol('observable');
                _Symbol.observable = result;
            }
        }
        else {
            result = '@@observable';
        }
        return result;
    }
    ;
    var observableSymbol = (function () {
        var root; /* global window */
        if (typeof self !== 'undefined') {
            root = self;
        }
        else if (typeof window !== 'undefined') {
            root = window;
        }
        else if (typeof global !== 'undefined') {
            root = global;
        }
        else if (typeof module !== 'undefined') {
            root = module;
        }
        else {
            root = Function('return this')();
        }
        return symbolObservablePonyfill(root);
    })();
    exports.default = observableSymbol;
});
