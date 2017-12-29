declare module "hooks" {
    import { VNode } from "vnode";
    export type PreHook = () => any;
    export type InitHook = (vNode: VNode) => any;
    export type CreateHook = (emptyVNode: VNode, vNode: VNode) => any;
    export type InsertHook = (vNode: VNode) => any;
    export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any;
    export type UpdateHook = (oldVNode: VNode, vNode: VNode) => any;
    export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any;
    export type DestroyHook = (vNode: VNode) => any;
    export type RemoveHook = (vNode: VNode, removeCallback: () => void) => any;
    export type PostHook = () => any;
    export interface Hooks {
        pre?: PreHook;
        init?: InitHook;
        create?: CreateHook;
        insert?: InsertHook;
        prepatch?: PrePatchHook;
        update?: UpdateHook;
        postpatch?: PostPatchHook;
        destroy?: DestroyHook;
        remove?: RemoveHook;
        post?: PostHook;
    }
}
declare module "helpers/attachto" {
    import { VNode } from "vnode";
    export interface AttachData {
        [key: string]: any;
        [i: number]: any;
        placeholder?: any;
        real?: Node;
    }
    export function attachTo(target: Element, vnode: VNode): VNode;
    export default attachTo;
}
declare module "modules/module" {
    import { PreHook, CreateHook, UpdateHook, DestroyHook, RemoveHook, PostHook } from "hooks";
    export interface Module {
        pre: PreHook;
        create: CreateHook;
        update: UpdateHook;
        destroy: DestroyHook;
        remove: RemoveHook;
        post: PostHook;
    }
}
declare module "modules/style" {
    import { Module } from "modules/module";
    export type VNodeStyle = Record<string, string> & {
        delayed?: Record<string, string>;
        remove?: Record<string, string>;
    };
    export const styleModule: Module;
    export default styleModule;
}
declare module "modules/eventlisteners" {
    import { Module } from "modules/module";
    export type On = {
        [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
    } & {
        [event: string]: EventListener;
    };
    export const eventListenersModule: Module;
    export default eventListenersModule;
}
declare module "modules/attributes" {
    import { Module } from "modules/module";
    export type Attrs = Record<string, string | number | boolean>;
    export const attributesModule: Module;
    export default attributesModule;
}
declare module "modules/class" {
    import { Module } from "modules/module";
    export type Classes = Record<string, boolean>;
    export const classModule: Module;
    export default classModule;
}
declare module "modules/props" {
    import { Module } from "modules/module";
    export type Props = Record<string, any>;
    export const propsModule: Module;
    export default propsModule;
}
declare module "modules/dataset" {
    import { Module } from "modules/module";
    export type Dataset = Record<string, string>;
    export const datasetModule: Module;
    export default datasetModule;
}
declare module "modules/hero" {
    import { Module } from "modules/module";
    export type Hero = {
        id: string;
    };
    export const heroModule: Module;
    export default heroModule;
}
declare module "vnode" {
    import { Hooks } from "hooks";
    import { AttachData } from "helpers/attachto";
    import { VNodeStyle } from "modules/style";
    import { On } from "modules/eventlisteners";
    import { Attrs } from "modules/attributes";
    import { Classes } from "modules/class";
    import { Props } from "modules/props";
    import { Dataset } from "modules/dataset";
    import { Hero } from "modules/hero";
    export type Key = string | number;
    export interface VNode<E extends Element = any> {
        sel?: string | undefined;
        data?: VNodeData<E> | undefined;
        children?: Array<VNode<E> | string> | undefined;
        elm?: Node | undefined;
        text?: string | undefined;
        key?: Key;
    }
    export interface VNodeData<E extends Element = any> {
        attrs?: Attrs;
        class?: Classes;
        hero?: Hero;
        on?: On;
        props?: Props;
        style?: VNodeStyle;
        dataset?: Dataset;
        attachData?: AttachData;
        hook?: Hooks;
        key?: Key;
        fn?: () => VNode<E>;
        args?: Array<any>;
        [key: string]: any;
        ns?: string;
    }
    export function vnode(sel: string | undefined, data: any | undefined, children: Array<VNode | string> | undefined, text: string | undefined, elm: Element | Text | undefined): VNode;
    export default vnode;
}
declare module "is" {
    export const array: (arg: any) => arg is any[];
    export function primitive(s: any): s is (string | number);
}
declare module "createElement" {
    import { VNode } from "vnode";
    export interface Selector {
        tagName?: string;
        id?: string;
        className?: string;
    }
    export function selectorToString(sel: Selector): string;
    export function createElement<E extends Element = any>(type: string, props?: any, ...children: (VNode<E> | string)[]): VNode<E>;
}
declare module "h" {
    import { VNode, VNodeData } from "vnode";
    export function h(sel: string): VNode;
    export function h(sel: string, data: VNodeData): VNode;
    export function h(sel: string, text: string): VNode;
    export function h(sel: string, children: Array<VNode | undefined | null>): VNode;
    export function h(sel: string, data: VNodeData, text: string): VNode;
    export function h(sel: string, data: VNodeData, children: Array<VNode | undefined | null>): VNode;
    export default h;
}
declare module "htmldomapi" {
    export interface DOMAPI {
        createElement: (tagName: any) => HTMLElement;
        createElementNS: (namespaceURI: string, qualifiedName: string) => Element;
        createTextNode: (text: string) => Text;
        createComment: (text: string) => Comment;
        insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void;
        removeChild: (node: Node, child: Node) => void;
        appendChild: (node: Node, child: Node) => void;
        parentNode: (node: Node) => Node;
        nextSibling: (node: Node) => Node;
        tagName: (elm: Element) => string;
        setTextContent: (node: Node, text: string | null) => void;
        getTextContent: (node: Node) => string | null;
        isElement: (node: Node) => node is Element;
        isText: (node: Node) => node is Text;
        isComment: (node: Node) => node is Comment;
    }
    export const htmlDomApi: DOMAPI;
    export default htmlDomApi;
}
declare module "thunk" {
    import { VNode, VNodeData } from "vnode";
    export interface ThunkData extends VNodeData {
        fn: () => VNode;
        args: Array<any>;
    }
    export interface Thunk extends VNode {
        data: ThunkData;
    }
    export interface ThunkFn {
        (sel: string, fn: Function, args: Array<any>): Thunk;
        (sel: string, key: any, fn: Function, args: Array<any>): Thunk;
    }
    export const thunk: ThunkFn;
    export default thunk;
}
declare module "snabbdom" {
    import { Module } from "modules/module";
    import { VNode } from "vnode";
    import { DOMAPI } from "htmldomapi";
    export { h } from "h";
    export { thunk } from "thunk";
    export function init(modules: Array<Partial<Module>>, domApi?: DOMAPI): (oldVnode: Element | VNode<any>, vnode: VNode<any>) => VNode<any>;
}
declare module "tovnode" {
    import { VNode } from "vnode";
    import { DOMAPI } from "htmldomapi";
    export function toVNode(node: Node, domApi?: DOMAPI): VNode;
    export default toVNode;
}
declare module "index" {
    export * from "vnode";
    export * from "h";
    export * from "createElement";
    export * from "hooks";
    export * from "htmldomapi";
    export * from "index";
    export * from "is";
    export * from "snabbdom";
    export * from "thunk";
    export * from "tovnode";
    export * from "vnode";
    export * from "helpers/attachto";
    export * from "modules/attributes";
    export * from "modules/class";
    export * from "modules/dataset";
    export * from "modules/eventlisteners";
    export * from "modules/hero";
    export * from "modules/module";
    export * from "modules/props";
    export * from "modules/style";
    export const snabbdomBundle: {
        patch: (oldVNode: any, vnode: any) => any;
        h: any;
    };
    export default snabbdomBundle;
}
