export const log = {
  // error: ((message?: any, ...optionalParams: any[]) => void);
  // log: ((message?: any, ...optionalParams: any[]) => void);
  // debug: ((message?: any, ...optionalParams: any[]) => void);
  error: function _logToConsoleError(err?: any, ...optionalParams: any[]) {
    const target = err.stack || err || "Error";
    if (console && console.error) {
      console.error(target);
    } else if (console && console.log) {
      console.log(target);
    }
  },
  log:function _logToConsoleLog(message?: any, ...optionalParams: any[]) {
    if (console && console.log) {
      console.log(message);
    }
  },
  debug:function _logToConsoleDebug(message?: any, ...optionalParams: any[]) {
    if (console && console.debug) {
      console.debug(message);
    } else if (console && console.log) {
      console.log(message);
    }
  }
};
