import { warning } from 'recyclejs-helpers';
import { PathLocation, Prompt, UserConfirmation, TransitionManager, TransactionListener } from './types';

export function createTransitionManager() : TransitionManager {
  var prompt: Prompt | null = null;

  var setPrompt = function setPrompt(nextPrompt: Prompt) {
    warning(prompt == null, 'A history supports only one prompt at a time');

    prompt = nextPrompt;

    return function () {
      if (prompt === nextPrompt) {
        prompt = null;
      }
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(
    location: PathLocation | string,
    action: string,
    getUserConfirmation: UserConfirmation,
    callback: ((b: boolean) => void)) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message');

          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  };

  var listeners: TransactionListener[] = [];

  var appendListener = function appendListener(fn: TransactionListener) {
    var isActive = true;

    var listener = function listener() {
      if (isActive) fn.apply(undefined, arguments);
    };

    listeners.push(listener);

    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners(...args: any[]) {
    // for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    //   args[_key] = arguments[_key];
    // }

    listeners.forEach(function (listener) {
      return listener.apply(undefined, args);
    });
  } as ((...args: any[]) => any);

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
};

