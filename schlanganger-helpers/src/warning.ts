/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */
declare const process: any | undefined;

const __DEV__ = ((process !== undefined && process.env !== undefined && process.env.NODE_ENV) ? (process.env.NODE_ENV || '') : ('')) !== 'production';

export function warning(condition: boolean, format: string, ...args: any[]) {
    if (__DEV__) {
        if (format === undefined) {
            throw new Error('invariant requires an error message argument');
        }
    }

    if (!condition) {
        var argIndex = 0;
        var message = 'Warning: ' +
            format.replace(/%s/g, function () { return args[argIndex++]; })
            ;
        if (typeof console !== 'undefined') {
            console.error(message);
        }
        try {
            // This error was thrown as a convenience so that you can use this stack
            // to find the callsite that caused this warning to fire.
            throw new Error(message);
        } catch (x) { }
    }
};
