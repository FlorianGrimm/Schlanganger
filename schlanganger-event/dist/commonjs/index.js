"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventDelegateItem = /** @class */ (function () {
    function EventDelegateItem(eventDelegate, eventName, listener, once) {
        this.eventDelegate = eventDelegate;
        this.eventName = eventName;
        this.listener = listener;
        if ((typeof (listener) === "object") && (typeof (listener.emit) === "function")) {
            this.listenerKind = "ed";
        }
        else if ((typeof (listener) === "object") && (typeof (listener.next) === "function")) {
            this.listenerKind = "op";
        }
        else if (typeof (listener) === "function") {
            this.listenerKind = "fn";
        }
        else {
            throw new Error("listener: Function | EventDelegate | EventOperation expected");
        }
        if (once) {
            this.state = 1;
        }
        else {
            this.state = 0;
        }
    }
    EventDelegateItem.prototype.emit = function (args) {
        if (this.state < 0) {
            return false;
        }
        if (this.state === 1) {
            this.state = -1;
        }
        if (this.listenerKind == "fn") {
            this.listener.apply(this, args);
        }
        else if (this.listenerKind == "ed") {
            (_a = this.listener).emit.apply(_a, [this.eventName].concat(args));
        }
        else if (this.listenerKind == "op") {
            this.listener.next.apply(this.listener, args);
        }
        else {
            return false;
        }
        if (this.state < 0) {
            var eventDelegate = this.eventDelegate;
            this.eventDelegate = null;
            if (eventDelegate !== null) {
                eventDelegate.emit("removeListener", this);
                this.listener = null;
            }
            return false;
        }
        else {
            return true;
        }
        var _a;
    };
    EventDelegateItem.prototype.next = function (value) {
    };
    EventDelegateItem.prototype.error = function (err) {
    };
    EventDelegateItem.prototype.complete = function () {
    };
    return EventDelegateItem;
}());
exports.EventDelegateItem = EventDelegateItem;
var EventDelegate = /** @class */ (function () {
    function EventDelegate() {
        this._Items = [];
    }
    EventDelegate.prototype.on = function (eventName, listener) {
        var item = new EventDelegateItem(this, eventName, listener, false);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        }
        else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return this;
    };
    EventDelegate.prototype.once = function (eventName, listener) {
        var item = new EventDelegateItem(this, eventName, listener, true);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        }
        else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return this;
    };
    EventDelegate.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var items = this._Items.slice();
        for (var idx = 0; idx < items.length; idx++) {
            var item = items[idx];
            if (item !== null) {
                if (item.eventName === eventName) {
                    if (item.emit(args) === false) {
                        items[idx] = null;
                    }
                }
            }
        }
        return this;
    };
    EventDelegate.prototype.op = function (fn) {
        var result = new EventDelegate();
        var item = new EventDelegateItem(this, "data", result, true);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        }
        else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return result;
    };
    return EventDelegate;
}());
exports.EventDelegate = EventDelegate;
var EventStream = /** @class */ (function () {
    function EventStream() {
        this._Items = [];
    }
    EventStream.prototype.next = function (value) {
    };
    EventStream.prototype.error = function (err) {
    };
    EventStream.prototype.complete = function () {
    };
    EventStream.prototype.addListener = function (listener) {
    };
    EventStream.prototype.op = function (fn) {
        var result = new EventDelegate();
        //this.addListener(result);
        return result;
    };
    return EventStream;
}());
exports.EventStream = EventStream;
