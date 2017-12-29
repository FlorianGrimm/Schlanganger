if ((typeof((Array.prototype as any).from) === "undefined") || (!(Array.prototype as any).from)) {
  Array.from = (function Array_from() {
    var toInteger = function (it: any) {
      return isNaN(it = +it) ? 0 : (it > 0 ? Math.floor : Math.ceil)(it);
    };
    var toLength = function (it: any) {
      return it > 0 ? Math.min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
    };
    var iterCall = function (iter: any, fn: any, val: any, index: any) {
      try {
        return fn(val, index)
      }
      catch (E) {
        if (typeof iter.return == 'function') iter.return();
        throw E;
      }
    };

    // The length property of the from method is 1.
    return function from(this:any, arrayLike: any/*, mapFn, thisArg */) {
      var O = Object(arrayLike)
        , C = typeof this == 'function' ? this : Array
        , aLen = arguments.length
        , mapfn = (aLen > 1) ? (arguments[1]) : undefined
        , mapping = (mapfn !== undefined)
        , index = 0
        , iterFn = O[Symbol.iterator]
        //, length
        , result;
      if (mapping) {
        mapfn = mapfn.bind(aLen > 2 ? arguments[2] : undefined);
      }
      if (iterFn != undefined && !Array.isArray(arrayLike)) {
        var  step, iterator;
        for (let iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
          result[index] = mapping ? iterCall(iterator, mapfn, step.value, index) : step.value;
        }
      } else {
        let length = toLength(O.length);
        for (result = new C(length); length > index; index++) {
          result[index] = mapping ? mapfn(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    };
  }());
}

//if ((typeof(Array.prototype.find) === "undefined") || (!Array.prototype.find)) {
if ((typeof((Array.prototype as any).find) === "undefined") || (!(Array.prototype as any).find)) {
  Object.defineProperty(Array.prototype, 'find', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function (predicate: any) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    }
  });
}

if ((typeof((Array.prototype as any).findIndex) === "undefined") || (!(Array.prototype as any).findIndex)) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function (predicate: any) {
      if (this === null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    }
  });
}

if ((typeof((Array.prototype as any).includes) === "undefined") || (!(Array.prototype as any).includes)) {
  Object.defineProperty(Array.prototype, 'includes', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function (searchElement: any /*, fromIndex*/) {
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) {
        return false;
      }
      var n = parseInt(arguments[1]) || 0;
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) { k = 0; }
      }
      var currentElement;
      while (k < len) {
        currentElement = O[k];
        if (searchElement === currentElement ||
          (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
          return true;
        }
        k++;
      }
      return false;
    }
  });
}