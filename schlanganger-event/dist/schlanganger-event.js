define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventDelegateItem = /** @class */ (function () {
        function EventDelegateItem(eventDelegate, eventName, listener) {
            this.eventDelegate = eventDelegate;
            this.eventName = eventName;
            this.listener = listener;
        }
        return EventDelegateItem;
    }());
    exports.EventDelegateItem = EventDelegateItem;
    var EventDelegate = /** @class */ (function () {
        function EventDelegate() {
            this._Items = [];
        }
        EventDelegate.prototype.on = function (eventName, listener) {
            var item;
            item = new EventDelegateItem(this, eventName, listener);
            this._Items.push(item);
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
                        // l[1]
                    }
                }
            }
            return this;
        };
        return EventDelegate;
    }());
    exports.EventDelegate = EventDelegate;
});
