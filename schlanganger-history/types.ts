export interface PathLocation {
    pathname: string;
    search: string;
    hash: string;
    state?: any;
    key?: any;
}
export type TransactionListener = (...args: any[]) => any | void;
export type Prompt = (location: PathLocation | string, action: string) => boolean;
export type UserConfirmation = (message: string, callback: ((confirmated: boolean) => void)) => void;
export type ConfirmTransitionTo = (location: PathLocation, action: string, getUserConfirmation: UserConfirmation, callback: (b: boolean) => void) => void;;
export type HashType = "hashbang" | "noslash" | "slash";
export interface HashHistoryOptions {
    basename?: string;
    getUserConfirmation?: UserConfirmation;
    hashType?: HashType;
}
export interface HashHistory {
    length: number;
    action: string;
    location: PathLocation;
    createHref: (location: PathLocation) => string;
    push: (path: string | PathLocation, state: any) => void;
    replace: (path: string | PathLocation, state: any) => void;
    go: (n?: number | undefined) => void;
    goBack: () => void;
    goForward: () => void;
    block: () => () => void;
    listen: (listener: TransactionListener) => () => void;
};
export interface BrowserHistoryOptions {
    forceRefresh?: boolean;
    getUserConfirmation?: UserConfirmation;
    keyLength?: number;
    basename?: string;
}
export interface BrowserHistory {
    length: number;
    action: string;
    location: PathLocation;
    createHref: (location: PathLocation) => string;
    push: (path: string | PathLocation, state: any) => void;
    replace: (path: string | PathLocation, state: any) => void;
    go: (n?: number | undefined) => void;
    goBack: () => void;
    goForward: () => void;
    block: () => () => void;
    listen: (listener: TransactionListener) => () => void;
};
export interface MemoryHistoryOptions {
    initialEntries?: (string|PathLocation)[];
    initialIndex?:number;
    getUserConfirmation?: UserConfirmation;
    keyLength?: number;

}
export interface TransitionManager {
    setPrompt: (nextPrompt: Prompt) => (() => void);
    confirmTransitionTo: ConfirmTransitionTo;
    appendListener: (fn: TransactionListener) => () => void;
    notifyListeners: (...args: any[]) => any;
};