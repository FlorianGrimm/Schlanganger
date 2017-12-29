import {Hooks} from './hooks';
import {AttachData} from './helpers/attachto'
import {VNodeStyle} from './modules/style'
import {On} from './modules/eventlisteners'
import {Attrs} from './modules/attributes'
import {Classes} from './modules/class'
import {Props} from './modules/props'
import {Dataset} from './modules/dataset'
import {Hero} from './modules/hero'

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
  // Modules
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
  fn?: () => VNode<E>; // for thunks
  args?: Array<any>; // for thunks
  [key: string]: any; // for any other 3rd party module
  ns?: string; // for SVGs
}

export function vnode(sel: string | undefined,
                      data: any | undefined,
                      children: Array<VNode | string> | undefined,
                      text: string | undefined,
                      elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
}

export default vnode;
