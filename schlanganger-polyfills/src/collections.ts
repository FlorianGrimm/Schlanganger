interface RCollectionPonyFill {
  _keys: any[];
  _values: any[];
  _itp: (number[])[]; // iteration pointers
  objectOnly: boolean;
  add(value: any): RCollectionPonyFill;
  set(key: any, value: any): RCollectionPonyFill;
  has(value: any): boolean;
  entries(): any;
  m: Map<any, any>
}
(function (global: any) {
  if (typeof (global.Ponyfill) === 'undefined') {
    global.Ponyfill = {};
  }
  const Ponyfill = global.Ponyfill;
  if (typeof (global.Polyfill) === 'undefined') {
    global.Polyfill = {};
  }
  const Polyfill = global.Polyfill;
  //shared pointer
  var i: any;
  //shortcuts
  var defineProperty = Object.defineProperty, is = function (a: any, b: any) { return (a === b) || (a !== a && b !== b) };

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
  } else {
    Polyfill.WeakMap = WeakMap;
  }


  Ponyfill.Map = createCollection({
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
    clear: sharedClear,
    //iterator
    [Symbol.iterator]: mapEntries
  }, false);
  if (typeof global.Map == 'undefined' || typeof ((new Map).entries) !== 'function' || typeof ((new Map).values) !== 'function' || !(new Map).values().next) {
    Polyfill.Map = Ponyfill.Map;
  } else {
    Polyfill.Map = Map;
  }

  Ponyfill.Set = createCollection({
    // Set#has(value:void*):boolean
    has: setHas,
    // Set#add(value:void*):boolean
    add: sharedAdd,
    // Set#delete(key:void*):boolean
    'delete': sharedDelete,
    // Set#clear():
    clear: sharedClear,
    // Set#keys(void):Iterator
    keys: sharedValues, // specs actually say "the same function object as the initial value of the values property"
    // Set#values(void):Iterator
    values: sharedValues,
    // Set#entries(void):Iterator
    entries: setEntries,
    // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
    forEach: sharedForEach,
    //iterator
    [Symbol.iterator]: sharedValues
  }, false);
  if (typeof global.Set == 'undefined' || typeof ((new Set).values) !== 'function' || !(new Set).values().next) {
    Polyfill.Set = Ponyfill.Set;
  } else {
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
  } else {
    Polyfill.WeakSet = Set;
  }

  /**
   * ES6 collection constructor
   * @return {Function} a collection class
   */
  function createCollection(proto: any, objectOnly?: boolean) {
    function Collection(this: RCollectionPonyFill, a: any) {
      if (!this || this.constructor !== Collection) { return new (Collection as any)(a); }
      this._keys = [];
      this._values = [];
      this._itp = []; // iteration pointers
      this.objectOnly = objectOnly || false;

      //parse initial iterable argument passed
      if (a) init.call(this, a);
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
  function init(this: RCollectionPonyFill, a: any[]) {
    var i;
    if (a) {
      if (this.add) {
        //init Set argument, like `[1,2,3,{}]`
        a.forEach(this.add, this);
      }
      else {
        //init Map argument like `[[1,2], [{}, 4]]`
        a.forEach(function (this: RCollectionPonyFill, a: any) { this.set(a[0], a[1]) }, this);
      }
    }
  }


  /** delete */
  function sharedDelete(this: RCollectionPonyFill, key: any) {
    if (this.has(key)) {
      this._keys.splice(i, 1);
      this._values.splice(i, 1);
      // update iteration pointers
      this._itp.forEach(function (p: any) { if (i < p[0]) p[0]--; });
    }
    // Aurora here does it while Canary doesn't
    return -1 < i;
  };

  function sharedGet(this: RCollectionPonyFill, key: any) {
    return this.has(key) ? this._values[i] : undefined;
  }

  function has(this: RCollectionPonyFill, list: any, key: any) {
    if (this.objectOnly && key !== Object(key))
      throw new TypeError("Invalid value used as weak collection key");
    //NaN or 0 passed
    if (key != key || key === 0) for (i = list.length; i-- && !is(list[i], key);) { }
    else i = list.indexOf(key);
    return -1 < i;
  }

  function setHas(this: RCollectionPonyFill, value: any) {
    return has.call(this, this._values, value);
  }

  function mapHas(this: RCollectionPonyFill, value: any) {
    return has.call(this, this._keys, value);
  }

  /** @chainable */
  function sharedSet(this: RCollectionPonyFill, key: any, value: any) {
    this.has(key) ?
      this._values[i] = value
      :
      this._values[this._keys.push(key) - 1] = value
      ;
    return this;
  }

  /** @chainable */
  function sharedAdd(this: RCollectionPonyFill, value: any) {
    if (!this.has(value)) this._values.push(value);
    return this;
  }

  function sharedClear(this: RCollectionPonyFill) {
    (this._keys || 0).length = this._values.length = 0;
  }

  /** keys, values, and iterate related methods */
  function sharedKeys(this: RCollectionPonyFill) {
    return sharedIterator(this._itp, this._keys);
  }

  function sharedValues(this: RCollectionPonyFill) {
    return sharedIterator(this._itp, this._values);
  }

  function mapEntries(this: RCollectionPonyFill) {
    return sharedIterator(this._itp, this._keys, this._values);
  }

  function setEntries(this: RCollectionPonyFill) {
    return sharedIterator(this._itp, this._values, this._values);
  }

  function sharedIterator(itp: (number[])[], array: any, array2?: any) {
    var p = [0], done = false;
    itp.push(p);
    return {
      [Symbol.iterator]: function () {
        return this;
      },
      next: function () {
        var v, k = p[0];
        if (!done && k < array.length) {
          v = array2 ? [array[k], array2[k]] : array[k];
          p[0]++;
        } else {
          done = true;
          itp.splice(itp.indexOf(p), 1);
        }
        return { done: done, value: v };
      }
    };
  }

  function sharedSize(this: RCollectionPonyFill) {
    return this._values.length;
  }

  function sharedForEach(this: RCollectionPonyFill, callback: any, context: any, ) {
    var it = this.entries();
    for (; ;) {
      var r = it.next();
      if (r.done) break;
      callback.call(context, r.value[1], r.value[0], this);
    }
  }

})(window as any);