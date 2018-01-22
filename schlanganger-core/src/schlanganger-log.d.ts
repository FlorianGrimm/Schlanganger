declare module "schlanganger-log" {
    export const log: {
        error: (err?: any, ...optionalParams: any[]) => void;
        log: (message?: any, ...optionalParams: any[]) => void;
        debug: (message?: any, ...optionalParams: any[]) => void;
    };
}
