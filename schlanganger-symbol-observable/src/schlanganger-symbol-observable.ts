/// <amd-module name="schlanganger-symbol-observable" />
//declare const observableSymbol: symbol;
//export default observableSymbol;
declare var global: any;
declare var module: any;

function symbolObservablePonyfill(root: any) {
  var result;
  var _Symbol = root.Symbol;

  if (typeof _Symbol === 'function') {
    if (_Symbol.observable) {
      result = _Symbol.observable;
    } else {
      result = _Symbol('observable');
      _Symbol.observable = result;
    }
  } else {
    result = '@@observable';
  }

  return result;
};

const observableSymbol: symbol = (function(){
  var root:any; /* global window */

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }
  return symbolObservablePonyfill(root);
})();
export default observableSymbol;