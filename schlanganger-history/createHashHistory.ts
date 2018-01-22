var _extends = Object.assign || function (target: any) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import { warning, invariant } from 'recyclejs-helpers';
import { PathLocation, HashHistoryOptions, HashType, TransactionListener } from './types';
import { createLocation, locationsAreEqual } from './LocationUtils';
import { addLeadingSlash, stripLeadingSlash, stripTrailingSlash, stripPrefix, parsePath, createPath } from './PathUtils';
import { createTransitionManager } from './createTransitionManager';
import { canUseDOM, addEventListener, removeEventListener, getConfirmation, supportsGoWithoutReloadUsingHash } from './DOMUtils';

var HashChangeEvent = 'hashchange';

var HashPathCoders = {
    hashbang: {
        encodePath: function encodePath(path: string) {
            return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
        },
        decodePath: function decodePath(path: string) {
            return path.charAt(0) === '!' ? path.substr(1) : path;
        }
    },
    noslash: {
        encodePath: stripLeadingSlash,
        decodePath: addLeadingSlash
    },
    slash: {
        encodePath: addLeadingSlash,
        decodePath: addLeadingSlash
    }
};

function getHashPath(): string {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    const href = window.location.href;
    const hashIndex = href.indexOf('#');
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};

function pushHashPath(path: string): string {
    return window.location.hash = path;
};

function replaceHashPath(path: string) {
    const hashIndex = window.location.href.indexOf('#');

    window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};

export function createHashHistory(props?: HashHistoryOptions) {
    if (props === undefined) {
        props = {};
    }

    invariant(canUseDOM, 'Hash history needs a DOM');

    const globalHistory = window.history;
    const canGoWithoutReload = supportsGoWithoutReloadUsingHash();

    const getUserConfirmation = props.getUserConfirmation || getConfirmation;
    const hashType = props.hashType || 'slash';

    const basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

    const _HashPathCoders$hashT = HashPathCoders[hashType];
    const encodePath = _HashPathCoders$hashT.encodePath;
    const decodePath = _HashPathCoders$hashT.decodePath;


    var getDOMLocation = function getDOMLocation() {
        var path = decodePath(getHashPath());
        if (basename) { path = stripPrefix(path, basename); }
        return parsePath(path);
    };

    var transitionManager = createTransitionManager();

    var setState = function setState(nextState?: any) {
        _extends(history, nextState);

        history.length = globalHistory.length;

        transitionManager.notifyListeners(history.location, history.action);
    };

    var forceNextPop = false;
    var ignorePath: string | null = null;

    var handleHashChange = function handleHashChange() {
        var path = getHashPath();
        var encodedPath = encodePath(path);

        if (path !== encodedPath) {
            // Ensure we always have a properly-encoded hash.
            replaceHashPath(encodedPath);
        } else {
            var location = getDOMLocation();
            var prevLocation = history.location;

            if (!forceNextPop && locationsAreEqual(prevLocation, location)) return; // A hashchange doesn't always == location change.

            if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

            ignorePath = null;

            handlePop(location);
        }
    };

    var handlePop = function handlePop(location: PathLocation) {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        } else {
            var action = 'POP';

            transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
                if (ok) {
                    setState({ action: action, location: location });
                } else {
                    revertPop(location);
                }
            });
        }
    };

    var revertPop = function revertPop(fromLocation: PathLocation) {
        var toLocation = history.location;

        // TODO: We could probably make this more reliable by
        // keeping a list of paths we've seen in sessionStorage.
        // Instead, we just default to 0 for paths we don't know.

        var toIndex = allPaths.lastIndexOf(createPath(toLocation));

        if (toIndex === -1) toIndex = 0;

        var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));

        if (fromIndex === -1) fromIndex = 0;

        var delta = toIndex - fromIndex;

        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };

    // Ensure the hash is encoded properly before doing anything else.
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) replaceHashPath(encodedPath);

    var initialLocation = getDOMLocation();
    var allPaths = [createPath(initialLocation)];

    // Public interface

    var createHref = function createHref(location: PathLocation) {
        return '#' + encodePath(basename + createPath(location));
    };

    var push = function push(path: PathLocation | string, state: any) {
        warning(state === undefined, 'Hash history cannot push state; it is ignored');

        let action = 'PUSH';
        const location = createLocation(path, undefined, undefined, history.location);

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) return;

            var path = createPath(location);
            var encodedPath = encodePath(basename + path);
            var hashChanged = getHashPath() !== encodedPath;

            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a PUSH, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                pushHashPath(encodedPath);

                var prevIndex = allPaths.lastIndexOf(createPath(history.location));
                var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

                nextPaths.push(path);
                allPaths = nextPaths;

                setState({ action: action, location: location });
            } else {
                warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');

                setState();
            }
        });
    };

    var replace = function replace(path: string | PathLocation, state: any) {
        warning(state === undefined, 'Hash history cannot replace state; it is ignored');

        var action = 'REPLACE';
        var location = createLocation(path, undefined, undefined, history.location);

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
            if (!ok) return;

            var path = createPath(location);
            var encodedPath = encodePath(basename + path);
            var hashChanged = getHashPath() !== encodedPath;

            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a REPLACE, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                replaceHashPath(encodedPath);
            }

            var prevIndex = allPaths.indexOf(createPath(history.location));

            if (prevIndex !== -1) allPaths[prevIndex] = path;

            setState({ action: action, location: location });
        });
    };

    var go = function go(n?: number) {
        warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');

        globalHistory.go(n);
    };

    var goBack = function goBack() {
        return go(-1);
    };

    var goForward = function goForward() {
        return go(1);
    };

    var listenerCount = 0;

    var checkDOMListeners = function checkDOMListeners(delta: number) {
        listenerCount += delta;

        if (listenerCount === 1) {
            addEventListener(window, HashChangeEvent, handleHashChange);
        } else if (listenerCount === 0) {
            removeEventListener(window, HashChangeEvent, handleHashChange);
        }
    };

    var isBlocked = false;

    var block = function block() {
        var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var unblock = transitionManager.setPrompt(prompt);

        if (!isBlocked) {
            checkDOMListeners(1);
            isBlocked = true;
        }

        return function () {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(-1);
            }

            return unblock();
        };
    };

    var listen = function listen(listener: TransactionListener) {
        var unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(1);

        return function () {
            checkDOMListeners(-1);
            unlisten();
        };
    };

    var history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref: createHref,
        push: push,
        replace: replace,
        go: go,
        goBack: goBack,
        goForward: goForward,
        block: block,
        listen: listen
    };

    return history;
};