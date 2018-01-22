var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj: any) { return typeof obj; } : function (obj:any) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target: any) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import { warning } from 'recyclejs-helpers';
import { createPath } from './PathUtils';
import { createLocation } from './LocationUtils';
import { createTransitionManager } from './createTransitionManager';
import { PathLocation, TransactionListener, MemoryHistoryOptions } from './types';

var clamp = function clamp(n: number, lowerBound: number, upperBound: number) {
    return Math.min(Math.max(n, lowerBound), upperBound);
};

/**
 * Creates a history object that stores locations in memory.
 */
var createMemoryHistory = function createMemoryHistory(props?: MemoryHistoryOptions) {
    //var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (props === undefined) { props = {}; }
    const getUserConfirmation = props.getUserConfirmation || ((message: string, callback: ((confirmated: boolean) => void)) => { });
    const initialEntries = props.initialEntries || ['/'];
    const initialIndex = props.initialIndex || 0;
    const keyLength = props.keyLength === undefined ? 6 : props.keyLength;

    var transitionManager = createTransitionManager();

    var setState = function setState(nextState?: any) {
        _extends(history, nextState);

        history.length = history.entries.length;

        transitionManager.notifyListeners(history.location, history.action);
    };

    var createKey = function createKey() {
        return Math.random().toString(36).substr(2, keyLength);
    };

    var index = clamp(initialIndex, 0, initialEntries.length - 1);
    var entries = initialEntries.map(function (entry) {
        return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, (entry as any).key || createKey());
    });

    // Public interface

    var createHref = createPath;

    var push = function push(path: string | PathLocation, state: any) {
        warning(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && (path as any).state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

        var action = 'PUSH';
        var location = createLocation(path, state, createKey(), history.location);

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) return;

            var prevIndex = history.index;
            var nextIndex = prevIndex + 1;

            var nextEntries = history.entries.slice(0);
            if (nextEntries.length > nextIndex) {
                nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
            } else {
                nextEntries.push(location);
            }

            setState({
                action: action,
                location: location,
                index: nextIndex,
                entries: nextEntries
            });
        });
    };

    var replace = function replace(path: string | PathLocation, state: any) {
        warning(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && (path as any).state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

        var action = 'REPLACE';
        var location = createLocation(path, state, createKey(), history.location);

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) return;

            history.entries[history.index] = location;

            setState({ action: action, location: location });
        });
    };

    var go = function go(n: number) {
        var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);

        var action = 'POP';
        var location = history.entries[nextIndex];

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (ok) {
                setState({
                    action: action,
                    location: location,
                    index: nextIndex
                });
            } else {
                // Mimic the behavior of DOM histories by
                // causing a render after a cancelled POP.
                setState();
            }
        });
    };

    var goBack = function goBack() {
        return go(-1);
    };

    var goForward = function goForward() {
        return go(1);
    };

    var canGo = function canGo(n: number) {
        var nextIndex = history.index + n;
        return nextIndex >= 0 && nextIndex < history.entries.length;
    };

    var block = function block() {
        var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return transitionManager.setPrompt(prompt);
    };

    var listen = function listen(listener: TransactionListener) {
        return transitionManager.appendListener(listener);
    };

    var history = {
        length: entries.length,
        action: 'POP',
        location: entries[index],
        index: index,
        entries: entries,
        createHref: createHref,
        push: push,
        replace: replace,
        go: go,
        goBack: goBack,
        goForward: goForward,
        canGo: canGo,
        block: block,
        listen: listen
    };

    return history;
};

export default createMemoryHistory;