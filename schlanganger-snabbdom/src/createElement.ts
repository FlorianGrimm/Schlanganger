import { vnode, VNode, VNodeData } from "./vnode";
import * as is from './is';

/*
export function createElement(type: string, props?: any | undefined | null, ...children: (JSX.Element | string)[]): JSX.Element {
  var vsel: string | undefined = type;
  var vdata: any | undefined;
  if (props === null || props === undefined) { vdata = {}; } else { vdata = { attrs: props }; }
  if (children.length === 1) {
    if (is.primitive(children[0])) {
      return vnode(vsel, vdata, undefined, children[0] as any, undefined) as any as JSX.Element;
    } else {
      return vnode(vsel, vdata, children as any, undefined, undefined) as any as JSX.Element;
    }
  }
  if (is.array(children) && (children.length === 0)) {
    return vnode(vsel, vdata, undefined, undefined, undefined) as any as JSX.Element;
  } else {
    for (let i = 0; i < children.length; ++i) {
      let c = children[i];
      if (is.primitive(c)) {
        children[i] = (vnode as any)(undefined, undefined, undefined, c);
      } else if (is.array(c)) {
        while (is.array(c)) {
          children.splice(i, 1, ...c);
          c = children[i];
        }
      }
    }
    return vnode(vsel, vdata, children as any, undefined, undefined) as any as JSX.Element;
  }
}
export default createElement;
*/

// import { Selector, selectorToString } from './selector';

// snabbdom-tsx
export interface Selector {
  tagName?: string;
  id?: string;
  className?: string;
}

export function selectorToString(sel: Selector) {
  const id = sel.id ? `#${sel.id.trim()}` : '';
  const tag = sel.tagName ? sel.tagName.trim() : '';
  const className = sel.className || '';
  const classes = className.split(' ').map(s => s ? `.${s}` : '').join('');
  return `${tag}${id}${classes}`;
}


//export type VNode = Snabbdom.VNode<Element>;
//export type VNodeData = Snabbdom.VNodeData<Element>;

export function createElement<E extends Element = any>(type: string, props?: any, ...children: (VNode<E> | string)[]): VNode<E> {
  const selector = selectorFromReactElement(type, props);
  return {
    children: children.map(child =>
      (typeof child === 'string') ? stringToVNode(child) : child),
    data: dataFromReactProps(props),
    sel: selectorToString(selector)
  };
}

// NOTE: this function uses in place modification of the props parameter. Maybe
//       is better to use copy of the props object.
function dataFromReactProps<E extends Element = any>(props?: any): VNodeData<E> {
  let data: VNodeData<E> = {};
  data.props = props;
  if (data.props && data.props.style) {
    data.style = data.props.style;
    delete data.props.style;
  }
  return data;
}

function selectorFromReactElement(type: string, props?: any): Selector {
  return {
    tagName: type,
    id: props ? props.id : undefined,
    className: props ? props.class : undefined
  };
}

function stringToVNode(str: string): VNode {
  return { text: str };
}

