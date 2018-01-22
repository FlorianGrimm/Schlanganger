"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const sum = require('../dist/dist/schlanganger-event.js');
//import { EventDelegate } from "../dist/commonjs/index";
var schlanganger_event = require("../dist/commonjs/index");
var EventDelegate = schlanganger_event.EventDelegate;
test('on emit simple 1', function () {
    expect((function () {
        var e = new EventDelegate();
        var result = 0;
        e.on("data", function (value) { result = value; });
        e.emit("data", 42);
        return result;
    })()).toBe(42);
});
test('on emit simple 2', function () {
    var e = new EventDelegate();
    var act = 0;
    e.on("data", function (value) { act = value; });
    e.emit("data", 42);
    expect(act).toBe(42);
});
test('once emit', function () {
    var e = new EventDelegate();
    var act = 0;
    e.once("data", function (value) { act = value; });
    e.emit("data", 42);
    e.emit("data", 43);
    expect(act).toBe(42);
});
