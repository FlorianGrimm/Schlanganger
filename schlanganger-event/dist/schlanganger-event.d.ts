declare module "index" {
    export type Listener = any;
    export type everything = any | null | undefined;
    export class EventDelegateItem {
        eventDelegate: EventDelegate;
        eventName: string;
        listener: Listener;
        constructor(eventDelegate: EventDelegate, eventName: string, listener: Listener);
    }
    export class EventDelegate {
        readonly _Items: (EventDelegateItem | null)[];
        constructor();
        on(eventName: string, listener: Listener): EventDelegate;
        emit(eventName: string, ...args: everything[]): EventDelegate;
    }
}
