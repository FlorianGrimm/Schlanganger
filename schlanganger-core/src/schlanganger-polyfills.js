(function () {
    var needsFix = false;
    //ES5 did not accept primitives, but ES6 does
    try {
        var s = Object.keys('a');
        needsFix = (s.length !== 1 || s[0] !== '0');
    }
    catch (e) {
        needsFix = true;
    }
    if (needsFix) {
        Object.keys = (function () {
            var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'), dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ], dontEnumsLength = dontEnums.length;
            return function (obj) {
                if (obj === undefined || obj === null) {
                    throw TypeError("Cannot convert undefined or null to object");
                }
                obj = Object(obj);
                var result = [], prop, i;
                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }
                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
}());
(function (O) {
    if ('assign' in O) {
        return;
    }
    O.defineProperty(O, 'assign', {
        configurable: true,
        writable: true,
        value: (function () {
            var gOPS = O.getOwnPropertySymbols, 
            // shortcut without explicitly passing through prototype
            pIE = O.propertyIsEnumerable, filterOS = gOPS ?
                function (self) {
                    return gOPS(self).filter(pIE, self);
                } : function () {
                // just empty Array won't do much within a .concat(...)
                return Array.prototype;
            };
            return function assign(where) {
                // Object.create(null) and null objects in general
                // might not be fully compatible with Symbols libraries
                // it is important to know this, in case you assign Symbols
                // to null object ... but it should NOT be a show-stopper
                // if you know what you are doing ... so ....
                if (gOPS && !(where instanceof O)) {
                    console.warn('problematic Symbols', where);
                    // ... now this script does its business !!!
                }
                // avoid JSHint "don't make function in loop"
                function set(keyOrSymbol) {
                    where[keyOrSymbol] = arg[keyOrSymbol];
                }
                // the loop
                for (var i = 1, ii = arguments.length; i < ii; ++i) {
                    var arg = arguments[i];
                    if (arg === null || arg === undefined) {
                        continue;
                    }
                    O.keys(arg).concat(filterOS(arg)).forEach(set);
                }
                return where;
            };
        }())
    });
}(Object));
(function (Object, GOPS, globalScope) {
    'use strict';
    // (C) Andrea Giammarchi - Mit Style
    if (GOPS in Object)
        return;
    var setDescriptor, G = globalScope, id = 0, random = '' + Math.random(), prefix = '__\x01symbol:', prefixLength = prefix.length, internalSymbol = '__\x01symbol@@' + random, DP = 'defineProperty', DPies = 'defineProperties', GOPN = 'getOwnPropertyNames', GOPD = 'getOwnPropertyDescriptor', PIE = 'propertyIsEnumerable', gOPN = Object[GOPN], gOPD = Object[GOPD], create = Object.create, keys = Object.keys, defineProperty = Object[DP], $defineProperties = Object[DPies], descriptor = gOPD(Object, GOPN), ObjectProto = Object.prototype, hOP = ObjectProto.hasOwnProperty, pIE = ObjectProto[PIE], toString = ObjectProto.toString, indexOf = Array.prototype.indexOf || function (v) {
        for (var i = this.length; i-- && this[i] !== v;) { }
        return i;
    }, addInternalIfNeeded = function (o, uid, enumerable) {
        if (!hOP.call(o, internalSymbol)) {
            defineProperty(o, internalSymbol, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: {}
            });
        }
        o[internalSymbol]['@@' + uid] = enumerable;
    }, createWithSymbols = function (proto, descriptors) {
        var self = create(proto);
        if (descriptors !== null && typeof descriptors === 'object') {
            gOPN(descriptors).forEach(function (key) {
                if (propertyIsEnumerable.call(descriptors, key)) {
                    $defineProperty(self, key, descriptors[key]);
                }
            });
        }
        return self;
    }, copyAsNonEnumerable = function (descriptor) {
        var newDescriptor = create(descriptor);
        newDescriptor.enumerable = false;
        return newDescriptor;
    }, get = function get() { }, onlyNonSymbols = function (name) {
        return name != internalSymbol &&
            !hOP.call(source, name);
    }, onlySymbols = function (name) {
        return name != internalSymbol &&
            hOP.call(source, name);
    }, propertyIsEnumerable = function propertyIsEnumerable(key) {
        var uid = '' + key;
        return onlySymbols(uid) ? (hOP.call(this, uid) &&
            this[internalSymbol]['@@' + uid]) : pIE.call(this, key);
    }, setAndGetSymbol = function (uid) {
        var descriptor = {
            enumerable: false,
            configurable: true,
            get: get,
            set: function (value) {
                setDescriptor(this, uid, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: value
                });
                addInternalIfNeeded(this, uid, true);
            }
        };
        defineProperty(ObjectProto, uid, descriptor);
        return (source[uid] = defineProperty(Object(uid), 'constructor', sourceConstructor));
    }, Symbol = function Symbol(description) {
        if (this && this !== G) {
            throw new TypeError('Symbol is not a constructor');
        }
        return setAndGetSymbol(prefix.concat(description || '', random, (++id).toString()));
    }, source = create(null), sourceConstructor = { value: Symbol }, sourceMap = function (uid) {
        return source[uid];
    }, $defineProperty = function defineProp(o, key, descriptor) {
        var uid = '' + key;
        if (onlySymbols(uid)) {
            setDescriptor(o, uid, descriptor.enumerable ?
                copyAsNonEnumerable(descriptor) : descriptor);
            addInternalIfNeeded(o, uid, !!descriptor.enumerable);
        }
        else {
            defineProperty(o, key, descriptor);
        }
        return o;
    }, $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
        var cof = toString.call(o);
        o = (cof === '[object String]') ? o.split('') : Object(o);
        return gOPN(o).filter(onlySymbols).map(sourceMap);
    };
    descriptor.value = $defineProperty;
    defineProperty(Object, DP, descriptor);
    descriptor.value = $getOwnPropertySymbols;
    defineProperty(Object, GOPS, descriptor);
    descriptor.value = function getOwnPropertyNames(o) {
        return gOPN(o).filter(onlyNonSymbols);
    };
    defineProperty(Object, GOPN, descriptor);
    descriptor.value = function defineProperties(o, descriptors) {
        var symbols = $getOwnPropertySymbols(descriptors);
        if (symbols.length) {
            keys(descriptors).concat(symbols).forEach(function (uid) {
                if (propertyIsEnumerable.call(descriptors, uid)) {
                    $defineProperty(o, uid, descriptors[uid]);
                }
            });
        }
        else {
            $defineProperties(o, descriptors);
        }
        return o;
    };
    defineProperty(Object, DPies, descriptor);
    descriptor.value = propertyIsEnumerable;
    defineProperty(ObjectProto, PIE, descriptor);
    descriptor.value = Symbol;
    defineProperty(G, 'Symbol', descriptor);
    // defining `Symbol.for(key)`
    descriptor.value = function (key) {
        var uid = prefix.concat(prefix, key, random);
        return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
    };
    defineProperty(Symbol, 'for', descriptor);
    // defining `Symbol.keyFor(symbol)`
    descriptor.value = function (symbol) {
        return hOP.call(source, symbol) ?
            symbol.slice(prefixLength * 2, -random.length) :
            void 0;
    };
    defineProperty(Symbol, 'keyFor', descriptor);
    descriptor.value = function getOwnPropertyDescriptor(o, key) {
        var descriptor = gOPD(o, key);
        if (descriptor && onlySymbols(key)) {
            descriptor.enumerable = propertyIsEnumerable.call(o, key);
        }
        return descriptor;
    };
    defineProperty(Object, GOPD, descriptor);
    descriptor.value = function (proto, descriptors) {
        return arguments.length === 1 ?
            create(proto) :
            createWithSymbols(proto, descriptors);
    };
    defineProperty(Object, 'create', descriptor);
    descriptor.value = function () {
        var str = toString.call(this);
        return (str === '[object String]' && onlySymbols(this)) ? '[object Symbol]' : str;
    };
    defineProperty(ObjectProto, 'toString', descriptor);
    try {
        setDescriptor = create(defineProperty({}, prefix, {
            get: function () {
                return defineProperty(this, prefix, { value: false })[prefix];
            }
        }))[prefix] || defineProperty;
    }
    catch (o_O) {
        setDescriptor = function (o, key, descriptor) {
            var protoDescriptor = gOPD(ObjectProto, key);
            delete ObjectProto[key];
            defineProperty(o, key, descriptor);
            defineProperty(ObjectProto, key, protoDescriptor);
        };
    }
}(Object, 'getOwnPropertySymbols', window));
(function (O, S) {
    var dP = O.defineProperty, ObjectProto = O.prototype, toString = ObjectProto.toString, toStringTag = 'toStringTag', descriptor;
    [
        'iterator',
        'match',
        'replace',
        'search',
        'split',
        'hasInstance',
        'isConcatSpreadable',
        'unscopables',
        'species',
        'toPrimitive',
        toStringTag // A string value used for the default description of an object. Used by Object.prototype.toString().
    ].forEach(function (name) {
        if (!(name in Symbol)) {
            dP(Symbol, name, { value: Symbol(name) });
            switch (name) {
                case toStringTag:
                    descriptor = O.getOwnPropertyDescriptor(ObjectProto, 'toString');
                    if (descriptor) {
                        descriptor.value = function () {
                            var str = toString.call(this), tst = typeof this === 'undefined' || this === null ? undefined : this[Symbol.toStringTag];
                            return typeof tst === 'undefined' ? str : ('[object ' + tst + ']');
                        };
                        dP(ObjectProto, 'toString', descriptor);
                    }
                    break;
            }
        }
    });
}(Object, Symbol));
(function (Si, AP, SP) {
    function returnThis() { return this; }
    // make Arrays usable as iterators
    // so that other iterables can copy same logic
    if (!AP[Si])
        AP[Si] = function () {
            var i = 0, self = this, iterator = {
                next: function next() {
                    var done = self.length <= i;
                    return done ?
                        { done: done } :
                        { done: done, value: self[i++] };
                }
            };
            iterator[Si] = returnThis;
            return iterator;
        };
    // make Strings usable as iterators
    // to simplify Array.from and
    if (!SP[Si])
        SP[Si] = function () {
            var fromCodePoint = String.fromCodePoint, self = this, i = 0, length = self.length, iterator = {
                next: function next() {
                    var done = length <= i, c = done ? '' : fromCodePoint(self.codePointAt(i));
                    i += c.length;
                    return done ?
                        { done: done } :
                        { done: done, value: c };
                }
            };
            iterator[Si] = returnThis;
            return iterator;
        };
}(Symbol.iterator, Array.prototype, String.prototype));
(function (PolyNumber) {
    if (typeof (PolyNumber.isNaN) === "undefined") {
        PolyNumber.isNaN = function Number_isNaN(value) {
            return value !== value;
        };
    }
    if (typeof (PolyNumber.isFinite) === "undefined") {
        if (typeof (isFinite) === "undefined") {
            PolyNumber.isFinite = function Number_isFinite(value) {
                // 1. If Type(number) is not Number, return false.
                if (typeof value !== 'number') {
                    return false;
                }
                // 2. If number is NaN, +∞, or −∞, return false.
                if (value !== value || value === Infinity || value === -Infinity) {
                    return false;
                }
                // 3. Otherwise, return true.
                return true;
            };
        }
        else {
            PolyNumber.isFinite = function Number_isFinite(value) {
                return (typeof value === "number") && isFinite(value);
            };
        }
    }
})(Number);
if ((typeof (Array.prototype.from) === "undefined") || (!Array.prototype.from)) {
    Array.from = (function Array_from() {
        var toInteger = function (it) {
            return isNaN(it = +it) ? 0 : (it > 0 ? Math.floor : Math.ceil)(it);
        };
        var toLength = function (it) {
            return it > 0 ? Math.min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
        };
        var iterCall = function (iter, fn, val, index) {
            try {
                return fn(val, index);
            }
            catch (E) {
                if (typeof iter.return == 'function')
                    iter.return();
                throw E;
            }
        };
        // The length property of the from method is 1.
        return function from(arrayLike /*, mapFn, thisArg */) {
            var O = Object(arrayLike), C = typeof this == 'function' ? this : Array, aLen = arguments.length, mapfn = (aLen > 1) ? (arguments[1]) : undefined, mapping = (mapfn !== undefined), index = 0, iterFn = O[Symbol.iterator]
            //, length
            , result;
            if (mapping) {
                mapfn = mapfn.bind(aLen > 2 ? arguments[2] : undefined);
            }
            if (iterFn != undefined && !Array.isArray(arrayLike)) {
                var step, iterator;
                for (var iterator_1 = iterFn.call(O), result_1 = new C; !(step = iterator_1.next()).done; index++) {
                    result_1[index] = mapping ? iterCall(iterator_1, mapfn, step.value, index) : step.value;
                }
            }
            else {
                var length_1 = toLength(O.length);
                for (result = new C(length_1); length_1 > index; index++) {
                    result[index] = mapping ? mapfn(O[index], index) : O[index];
                }
            }
            result.length = index;
            return result;
        };
    }());
}
if ((typeof (Array.prototype.find) === "undefined") || (!Array.prototype.find)) {
    Object.defineProperty(Array.prototype, 'find', {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function (predicate) {
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
if ((typeof (Array.prototype.findIndex) === "undefined") || (!Array.prototype.findIndex)) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function (predicate) {
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
if ((typeof (Array.prototype.includes) === "undefined") || (!Array.prototype.includes)) {
    Object.defineProperty(Array.prototype, 'includes', {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function (searchElement /*, fromIndex*/) {
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            }
            else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) {
                    return true;
                }
                k++;
            }
            return false;
        }
    });
}
(function (global) {
    if (typeof (global.Ponyfill) === 'undefined') {
        global.Ponyfill = {};
    }
    var Ponyfill = global.Ponyfill;
    if (typeof (global.Polyfill) === 'undefined') {
        global.Polyfill = {};
    }
    var Polyfill = global.Polyfill;
    //shared pointer
    var i;
    //shortcuts
    var defineProperty = Object.defineProperty, is = function (a, b) { return (a === b) || (a !== a && b !== b); };
    // Polyfill and Ponyfill
    Ponyfill.WeakMap = createCollection({
        // WeakMap#delete(key:void*):boolean
        'delete': sharedDelete,
        // WeakMap#clear():
        clear: sharedClear,
        // WeakMap#get(key:void*):void*
        get: sharedGet,
        // WeakMap#has(key:void*):boolean
        has: mapHas,
        // WeakMap#set(key:void*, value:void*):void
        set: sharedSet
    }, true);
    if (typeof global.WeakMap == 'undefined') {
        Polyfill.WeakMap = Ponyfill.WeakMap;
    }
    else {
        Polyfill.WeakMap = WeakMap;
    }
    Ponyfill.Map = createCollection((_a = {
            // WeakMap#delete(key:void*):boolean
            'delete': sharedDelete,
            //:was Map#get(key:void*[, d3fault:void*]):void*
            // Map#has(key:void*):boolean
            has: mapHas,
            // Map#get(key:void*):boolean
            get: sharedGet,
            // Map#set(key:void*, value:void*):void
            set: sharedSet,
            // Map#keys(void):Iterator
            keys: sharedKeys,
            // Map#values(void):Iterator
            values: sharedValues,
            // Map#entries(void):Iterator
            entries: mapEntries,
            // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
            forEach: sharedForEach,
            // Map#clear():
            clear: sharedClear
        },
        //iterator
        _a[Symbol.iterator] = mapEntries,
        _a), false);
    if (typeof global.Map == 'undefined' || typeof ((new Map).entries) !== 'function' || typeof ((new Map).values) !== 'function' || !(new Map).values().next) {
        Polyfill.Map = Ponyfill.Map;
    }
    else {
        Polyfill.Map = Map;
    }
    Ponyfill.Set = createCollection((_b = {
            // Set#has(value:void*):boolean
            has: setHas,
            // Set#add(value:void*):boolean
            add: sharedAdd,
            // Set#delete(key:void*):boolean
            'delete': sharedDelete,
            // Set#clear():
            clear: sharedClear,
            // Set#keys(void):Iterator
            keys: sharedValues,
            // Set#values(void):Iterator
            values: sharedValues,
            // Set#entries(void):Iterator
            entries: setEntries,
            // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
            forEach: sharedForEach
        },
        //iterator
        _b[Symbol.iterator] = sharedValues,
        _b), false);
    if (typeof global.Set == 'undefined' || typeof ((new Set).values) !== 'function' || !(new Set).values().next) {
        Polyfill.Set = Ponyfill.Set;
    }
    else {
        Polyfill.Set = Set;
    }
    Ponyfill.WeakSet = createCollection({
        // WeakSet#delete(key:void*):boolean
        'delete': sharedDelete,
        // WeakSet#add(value:void*):boolean
        add: sharedAdd,
        // WeakSet#clear():
        clear: sharedClear,
        // WeakSet#has(value:void*):boolean
        has: setHas
    }, true);
    if (typeof global.WeakSet == 'undefined') {
        Polyfill.WeakSet = Ponyfill.WeakSet;
    }
    else {
        Polyfill.WeakSet = Set;
    }
    /**
     * ES6 collection constructor
     * @return {Function} a collection class
     */
    function createCollection(proto, objectOnly) {
        function Collection(a) {
            if (!this || this.constructor !== Collection) {
                return new Collection(a);
            }
            this._keys = [];
            this._values = [];
            this._itp = []; // iteration pointers
            this.objectOnly = objectOnly || false;
            //parse initial iterable argument passed
            if (a)
                init.call(this, a);
            return this;
        }
        //define size for non object-only collections
        if (!objectOnly) {
            defineProperty(proto, 'size', {
                get: sharedSize
            });
        }
        //set prototype
        proto.constructor = Collection;
        Collection.prototype = proto;
        return Collection;
    }
    /** parse initial iterable argument passed */
    function init(a) {
        var i;
        if (a) {
            if (this.add) {
                //init Set argument, like `[1,2,3,{}]`
                a.forEach(this.add, this);
            }
            else {
                //init Map argument like `[[1,2], [{}, 4]]`
                a.forEach(function (a) { this.set(a[0], a[1]); }, this);
            }
        }
    }
    /** delete */
    function sharedDelete(key) {
        if (this.has(key)) {
            this._keys.splice(i, 1);
            this._values.splice(i, 1);
            // update iteration pointers
            this._itp.forEach(function (p) { if (i < p[0])
                p[0]--; });
        }
        // Aurora here does it while Canary doesn't
        return -1 < i;
    }
    ;
    function sharedGet(key) {
        return this.has(key) ? this._values[i] : undefined;
    }
    function has(list, key) {
        if (this.objectOnly && key !== Object(key))
            throw new TypeError("Invalid value used as weak collection key");
        //NaN or 0 passed
        if (key != key || key === 0)
            for (i = list.length; i-- && !is(list[i], key);) { }
        else
            i = list.indexOf(key);
        return -1 < i;
    }
    function setHas(value) {
        return has.call(this, this._values, value);
    }
    function mapHas(value) {
        return has.call(this, this._keys, value);
    }
    /** @chainable */
    function sharedSet(key, value) {
        this.has(key) ?
            this._values[i] = value
            :
                this._values[this._keys.push(key) - 1] = value;
        return this;
    }
    /** @chainable */
    function sharedAdd(value) {
        if (!this.has(value))
            this._values.push(value);
        return this;
    }
    function sharedClear() {
        (this._keys || 0).length = this._values.length = 0;
    }
    /** keys, values, and iterate related methods */
    function sharedKeys() {
        return sharedIterator(this._itp, this._keys);
    }
    function sharedValues() {
        return sharedIterator(this._itp, this._values);
    }
    function mapEntries() {
        return sharedIterator(this._itp, this._keys, this._values);
    }
    function setEntries() {
        return sharedIterator(this._itp, this._values, this._values);
    }
    function sharedIterator(itp, array, array2) {
        var p = [0], done = false;
        itp.push(p);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var v, k = p[0];
                if (!done && k < array.length) {
                    v = array2 ? [array[k], array2[k]] : array[k];
                    p[0]++;
                }
                else {
                    done = true;
                    itp.splice(itp.indexOf(p), 1);
                }
                return { done: done, value: v };
            },
            _a;
        var _a;
    }
    function sharedSize() {
        return this._values.length;
    }
    function sharedForEach(callback, context) {
        var it = this.entries();
        for (;;) {
            var r = it.next();
            if (r.done)
                break;
            callback.call(context, r.value[1], r.value[0], this);
        }
    }
    var _a, _b;
})(window);
(function (PolyString) {
    if ((!PolyString.prototype.endsWith) || ((function () { try {
        return !("ab".endsWith("a", 1));
    }
    catch (e) {
        return true;
    } })())) {
        PolyString.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            var pos;
            if ((typeof (position) === 'undefined')
                || (typeof (position) !== 'number')
                || !isFinite(position)
                || (Math.floor(position) !== position)
                || (position > subjectString.length)) {
                pos = subjectString.length - searchString.length;
            }
            else {
                pos = position - searchString.length;
            }
            //pos -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, pos);
            return (lastIndex !== -1) && (lastIndex === pos);
        };
    }
    if ((typeof (PolyString.prototype.startsWith) === "undefined")
        || (!PolyString.prototype.startsWith)
        || ((function () { try {
            return !("ab".startsWith("b", 1));
        }
        catch (e) {
            return true;
        } })())) {
        PolyString.prototype.startsWith = function String_startsWith(searchString, position) {
            return this.substr(position || 0, searchString.length) === searchString;
        };
    }
})(String);
(function (globalScope) {
    var bind = Function.prototype.bind;
    if (typeof globalScope.Reflect === 'undefined') {
        globalScope.Reflect = {};
    }
    var Reflect = globalScope.Reflect;
    if (typeof Reflect.defineProperty !== 'function') {
        Reflect.defineProperty = function (target, propertyKey, descriptor) {
            if (typeof target === 'object' ? target === null : typeof target !== 'function') {
                throw new TypeError('Reflect.defineProperty called on non-object');
            }
            try {
                Object.defineProperty(target, propertyKey, descriptor);
                return true;
            }
            catch (e) {
                return false;
            }
        };
    }
    if (typeof Reflect.construct !== 'function') {
        Reflect.construct = function (Target, args) {
            if (args) {
                switch (args.length) {
                    case 0: return new Target();
                    case 1: return new Target(args[0]);
                    case 2: return new Target(args[0], args[1]);
                    case 3: return new Target(args[0], args[1], args[2]);
                    case 4: return new Target(args[0], args[1], args[2], args[3]);
                }
            }
            var a = [null];
            a.push.apply(a, args);
            return new (bind.apply(Target, a));
        };
    }
    if (typeof Reflect.ownKeys !== 'function') {
        Reflect.ownKeys = function (o) { return (Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))); };
    }
    var emptyMetadata = Object.freeze({});
    var metadataContainerKey = '__metadata__';
    if (typeof Reflect.getOwnMetadata !== 'function') {
        Reflect.getOwnMetadata = function (metadataKey, target, targetKey) {
            if (target.hasOwnProperty(metadataContainerKey)) {
                return (target[metadataContainerKey][targetKey] || emptyMetadata)[metadataKey];
            }
        };
    }
    if (typeof Reflect.defineMetadata !== 'function') {
        Reflect.defineMetadata = function (metadataKey, metadataValue, target, targetKey) {
            var metadataContainer = target.hasOwnProperty(metadataContainerKey) ? target[metadataContainerKey] : (target[metadataContainerKey] = {});
            var targetContainer = metadataContainer[targetKey] || (metadataContainer[targetKey] = {});
            targetContainer[metadataKey] = metadataValue;
        };
    }
    if (typeof Reflect.metadata !== 'function') {
        Reflect.metadata = function (metadataKey, metadataValue) {
            return function (target, targetKey) {
                Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
            };
        };
    }
})(window);
define("invariant", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __DEV__ = ((process !== undefined && process.env !== undefined && process.env.NODE_ENV) ? (process.env.NODE_ENV || '') : ('')) !== 'production';
    function invariant(condition, format, a, b, c, d, e, f) {
        if (__DEV__) {
            if (format === undefined) {
                throw new Error('invariant requires an error message argument');
            }
        }
        if (!condition) {
            var error;
            if (format === undefined) {
                error = new Error('Minified exception occurred; use the non-minified dev environment ' +
                    'for the full error message and additional helpful warnings.');
            }
            else {
                var args_1 = [a, b, c, d, e, f];
                var argIndex = 0;
                error = new Error(format.replace(/%s/g, function () { return args_1[argIndex++]; }));
                error.name = 'Invariant Violation';
            }
            error.framesToPop = 1; // we don't care about invariant's own frame
            throw error;
        }
    }
    exports.invariant = invariant;
    ;
});
define("value-equal", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function valueEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return false;
        if (Array.isArray(a)) {
            return (Array.isArray(b)
                && a.length === b.length
                && a.every(function (item, index) {
                    return valueEqual(item, b[index]);
                }));
        }
        var aType = typeof a;
        var bType = typeof b;
        if (aType !== bType)
            return false;
        if (aType === 'object') {
            var aValue = a.valueOf();
            var bValue = b.valueOf();
            if (aValue !== a || bValue !== b)
                return valueEqual(aValue, bValue);
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length)
                return false;
            return aKeys.every(function (key) {
                return valueEqual(a[key], b[key]);
            });
        }
        return false;
    }
    exports.valueEqual = valueEqual;
});
define("warning", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __DEV__ = ((process !== undefined && process.env !== undefined && process.env.NODE_ENV) ? (process.env.NODE_ENV || '') : ('')) !== 'production';
    function warning(condition, format) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (__DEV__) {
            if (format === undefined) {
                throw new Error('invariant requires an error message argument');
            }
        }
        if (!condition) {
            var argIndex = 0;
            var message = 'Warning: ' +
                format.replace(/%s/g, function () { return args[argIndex++]; });
            if (typeof console !== 'undefined') {
                console.error(message);
            }
            try {
                // This error was thrown as a convenience so that you can use this stack
                // to find the callsite that caused this warning to fire.
                throw new Error(message);
            }
            catch (x) { }
        }
    }
    exports.warning = warning;
    ;
});
