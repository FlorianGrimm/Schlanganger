export declare type EventDelegateListener<T = any> = Function | EventDelegate<T> | EventOperation<T>;
export declare type everything = any | null | undefined;
export interface EventOperation<T = any> {
    next(value: T): void;
    error: (err: any) => void;
    complete: () => void;
}
export declare class EventDelegateItem<T = any, R = any> {
    eventDelegate: EventDelegate | null;
    eventName: string;
    listener: EventDelegateListener | null;
    listenerKind: "fn" | "op" | "ed";
    state: number;
    constructor(eventDelegate: EventDelegate, eventName: string, listener: EventDelegateListener, once: boolean);
    emit(args: everything[]): boolean;
    next(value: T): void;
    error(err: any): void;
    complete(): void;
}
export declare class EventDelegate<T = any> {
    readonly _Items: (EventDelegateItem<T> | null)[];
    constructor();
    on(eventName: string, listener: EventDelegateListener): EventDelegate;
    once(eventName: string, listener: EventDelegateListener): EventDelegate;
    emit(eventName: string, ...args: everything[]): EventDelegate;
    op<R>(fn: (value: T) => R): EventDelegate<R>;
}
export declare class EventStream<T = any> {
    readonly _Items: (EventDelegateItem<T> | null)[];
    constructor();
    next(value: T): void;
    error(err: any): void;
    complete(): void;
    addListener(listener: EventDelegate<T>): void;
    op<R>(fn: (value: T) => R): EventDelegate<R>;
}
