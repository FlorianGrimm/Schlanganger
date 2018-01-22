import { language as cssauron} from 'recyclejs-cssauron/index';
import { VNode } from 'recyclejs-snabbdom';
import { selectorParser } from './selectorParser';
import { classNameFromVNode } from './classNameFromVNode';

export const language = cssauron<VNode>({
  tag: (vNode: VNode) => selectorParser(vNode).tagName,
  class: (vNode: VNode) => classNameFromVNode(vNode),
  id: (vNode: VNode) => selectorParser(vNode).id,
  children: (vNode: VNode) => vNode.children || [],
  parent: (vNode: VNode) => (vNode.data as any).parent || vNode,
  contents: (vNode: VNode) => vNode.text,
  attr(vNode: VNode, attr: string) {
    if (vNode.data) {
      const { attrs = {}, props = {} } = vNode.data;
      if (attrs[attr]) {
        return attrs[attr];
      }
      if (props[attr]) {
        return props[attr];
      }
    }
  },
});
