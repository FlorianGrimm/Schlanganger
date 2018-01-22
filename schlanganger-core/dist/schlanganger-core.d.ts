interface RCollectionPonyFill {
    _keys: any[];
    _values: any[];
    _itp: (number[])[];
    objectOnly: boolean;
    add(value: any): RCollectionPonyFill;
    set(key: any, value: any): RCollectionPonyFill;
    has(value: any): boolean;
    entries(): any;
    m: Map<any, any>;
}
declare var global: any;
interface InnerError extends Error {
    name: string;
    message: string;
    stack?: string;
    innerError?: Error;
}
interface ObjectConstructor {
    getPropertyDescriptor(o: any, p: string): PropertyDescriptor;
}
declare namespace Reflect {
    function getOwnMetadata(metadataKey: string, target: Function, targetKey?: string): Object | undefined;
    function defineMetadata(metadataKey: string, metadataValue: Object, target: Function, targetKey?: string): void;
}
declare module "schlanganger-log/src/schlanganger-log" {
    export const log: {
        error: (err?: any, ...optionalParams: any[]) => void;
        log: (message?: any, ...optionalParams: any[]) => void;
        debug: (message?: any, ...optionalParams: any[]) => void;
    };
}
