import { VNode } from 'recyclejs-snabbdom';

export interface Selector {
  (selector: string, vNode: VNode): Array<VNode>;
  (selector: string): (vNode: VNode) => Array<VNode>;
}

export type Select =
  (selector: string, vNode: VNode) => Array<VNode>;
