export const canUseDOM = !!(
    typeof window !== 'undefined'
    && window.document
    && window.document.createElement);
// 
// addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
// 
export function addEventListener(node: EventTarget, event: string, listener: EventListenerOrEventListenerObject) {
    return (node as any).addEventListener
        ? node.addEventListener(event, listener, false)
        : (node as any).attachEvent('on' + event, listener);
};

export function removeEventListener(node: EventTarget, event: string, listener: EventListenerOrEventListenerObject) {
    return (node as any).removeEventListener
        ? node.removeEventListener(event, listener, false)
        : (node as any).detachEvent('on' + event, listener);
};

export function getConfirmation(message: string, callback: ((confirmated: boolean) => void)) : void {
    //return callback(window.confirm(message));
    callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
export function supportsHistory() {
    var ua = window.navigator.userAgent;

    if ((ua.indexOf('Android 2.') !== -1
        || ua.indexOf('Android 4.0') !== -1)
        && ua.indexOf('Mobile Safari') !== -1
        && ua.indexOf('Chrome') === -1
        && ua.indexOf('Windows Phone') === -1) {
        return false;
    }
    return window.history && 'pushState' in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
export function supportsPopStateOnHashChange() {
    return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
export function supportsGoWithoutReloadUsingHash() {
    return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
export function isExtraneousPopstateEvent(event: Event) {
    return (event as any).state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};