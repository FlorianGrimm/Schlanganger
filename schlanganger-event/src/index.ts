import { fail } from "assert";
import { triggerAsyncId } from "async_hooks";

/// <amd name="schlanganger-event" />
export type EventDelegateListener<T=any>
    = Function
    | EventDelegate<T>
    | EventOperation<T>;

export type everything = any | null | undefined;

export interface EventOperation<T=any> {
    next(value: T): void;
    error: (err: any) => void;
    complete: () => void;
}

export class EventDelegateItem<T=any, R=any> {
    eventDelegate: EventDelegate | null;
    eventName: string;
    listener: EventDelegateListener | null;
    listenerKind: "fn" | "op" | "ed";
    state: number;

    constructor(
        eventDelegate: EventDelegate,
        eventName: string,
        listener: EventDelegateListener,
        once: boolean
    ) {
        this.eventDelegate = eventDelegate;
        this.eventName = eventName;
        this.listener = listener;
        if ((typeof (listener) === "object") && (typeof ((listener as any).emit) === "function")) {
            this.listenerKind = "ed";
        } else if ((typeof (listener) === "object") && (typeof ((listener as any).next) === "function")) {
            this.listenerKind = "op";
        } else if (typeof (listener) === "function") {
            this.listenerKind = "fn";
        } else {
            throw new Error("listener: Function | EventDelegate | EventOperation expected");
        }
        if (once) {
            this.state = 1;
        } else {
            this.state = 0;
        }
    }

    emit(args: everything[]): boolean {
        if (this.state < 0) { return false; }
        if (this.state === 1) { this.state = -1; }

        if (this.listenerKind == "fn") {
            (this.listener as Function).apply(this, args);
        } else if (this.listenerKind == "ed") {
            (this.listener as EventDelegate).emit(this.eventName, ...args);
        } else if (this.listenerKind == "op") {
            (this.listener as EventOperation).next.apply(this.listener, args);
        } else {
            return false;
        }
        if (this.state < 0) {
            let eventDelegate = this.eventDelegate;
            this.eventDelegate = null;
            if (eventDelegate !== null) {
                eventDelegate.emit("removeListener", this);
                this.listener = null;
            }
            return false;
        } else {
            return true;
        }
    }

    next(value: T): void {
    }

    error(err: any): void {
    }

    complete(): void {
    }
}

export class EventDelegate<T=any> {
    readonly _Items: (EventDelegateItem<T> | null)[];

    constructor() {
        this._Items = [];
    }

    on(eventName: string, listener: EventDelegateListener): EventDelegate {
        let item = new EventDelegateItem<T>(this, eventName, listener, false);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        } else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return this;
    }

    once(eventName: string, listener: EventDelegateListener): EventDelegate {
        let item = new EventDelegateItem<T>(this, eventName, listener, true);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        } else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return this;
    }

    emit(eventName: string, ...args: everything[]): EventDelegate {
        const items = this._Items.slice();
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            if (item !== null) {
                if (item.eventName === eventName) {
                    if (item.emit(args) === false) {
                        items[idx] = null;
                    }
                }
            }
        }
        return this;
    }


    op<R>(fn: (value: T) => R): EventDelegate<R> {
        var result = new EventDelegate<R>();
        let item = new EventDelegateItem<T, R>(this, "data", result, true);
        if ((this._Items.length > 0) && (this._Items[this._Items.length - 1] === null)) {
            this._Items[this._Items.length - 1] = item;
        } else {
            this._Items.push(item);
        }
        this.emit("addListener", item);
        return result;

    }
    /*
    
            emitter.eventNames()
            emitter.getMaxListeners()
            emitter.listenerCount(eventName)
            emitter.listeners(eventName)
            emitter.once(eventName, listener)
            emitter.prependListener(eventName, listener)
            emitter.prependOnceListener(eventName, listener)
            emitter.removeAllListeners([eventName])
            emitter.removeListener(eventName, listener)
            emitter.setMaxListeners(n)

Events    
    */
}

export class EventStream<T=any>{
    readonly _Items: (EventDelegateItem<T> | null)[];
    constructor() {
        this._Items = [];
    }

    next(value: T): void {
    }

    error(err: any): void {
    }

    complete(): void {
    }

    addListener(listener: EventDelegate<T>) {

    }

    op<R>(fn: (value: T) => R): EventDelegate<R> {
        var result = new EventDelegate<R>();
        //this.addListener(result);
        return result;
    }
}