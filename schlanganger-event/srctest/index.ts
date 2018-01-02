//const sum = require('../dist/dist/schlanganger-event.js');
//import { EventDelegate } from "../dist/commonjs/index";
import * as schlanganger_event from "../dist/commonjs/index";
const EventDelegate = schlanganger_event.EventDelegate;


test('on emit simple 1', () => {
  expect((function () {
    let e = new EventDelegate();
    let result = 0;
    e.on("data", (value: number) => { result = value; });
    e.emit("data", 42)
    return result;
  })()).toBe(42);
});

test('on emit simple 2', () => {
  let e = new EventDelegate();
  let act = 0;
  e.on("data", (value: number) => { act = value; });
  e.emit("data", 42);
  expect(act).toBe(42);
});

test('once emit', () => {
  let e = new EventDelegate();
  let act = 0;
  e.once("data", (value: number) => { act = value; });
  e.emit("data", 42);
  e.emit("data", 43);
  expect(act).toBe(42);
});