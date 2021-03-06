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
interface RecyclePonyFill {
    Map: MapConstructor;
    WeakMap: WeakMapConstructor;
    Set: SetConstructor;
}
declare var Ponyfill: RecyclePonyFill;
declare var Polyfill: RecyclePonyFill;
declare module "invariant" {
    export function invariant(condition: boolean, format: string, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any): void;
}
declare module "value-equal" {
    export function valueEqual(a: any | null, b: any | null): boolean;
}
declare module "warning" {
    export function warning(condition: boolean, format: string, ...args: any[]): void;
}
