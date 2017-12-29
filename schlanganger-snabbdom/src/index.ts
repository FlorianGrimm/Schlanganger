import { init } from './snabbdom';
import { attributesModule } from './modules/attributes'; // for setting attributes on DOM elements
import { classModule } from './modules/class'; // makes it easy to toggle classes
import { propsModule } from './modules/props'; // for setting properties on DOM elements
import { styleModule } from './modules/style'; // handles styling on elements with support for animations
import { eventListenersModule } from './modules/eventlisteners'; // attaches event listeners
import { h } from './h'; // helper function for creating vnodes
var patch = init([ // Init patch function with choosen modules
  attributesModule,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]) as (oldVNode: any, vnode: any) => any;

export * from './vnode';
export * from './h';
export * from './createElement';
export * from './hooks';
export * from './htmldomapi';
export * from './index';
export * from './is';
export * from './snabbdom';
export * from './thunk';
export * from './tovnode';
export * from './vnode';
export * from './helpers/attachto';
export * from './modules/attributes';
export * from './modules/class';
export * from './modules/dataset';
export * from './modules/eventlisteners';
export * from './modules/hero';
export * from './modules/module';
export * from './modules/props';
export * from './modules/style';

export const snabbdomBundle = { patch, h: h as any };
export default snabbdomBundle;