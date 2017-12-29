define("hooks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("helpers/attachto", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pre(vnode, newVnode) {
        var attachData = vnode.data.attachData;
        // Copy created placeholder and real element from old vnode
        newVnode.data.attachData.placeholder = attachData.placeholder;
        newVnode.data.attachData.real = attachData.real;
        // Mount real element in vnode so the patch process operates on it
        vnode.elm = vnode.data.attachData.real;
    }
    function post(_, vnode) {
        // Mount dummy placeholder in vnode so potential reorders use it
        vnode.elm = vnode.data.attachData.placeholder;
    }
    function destroy(vnode) {
        // Remove placeholder
        if (vnode.elm !== undefined) {
            vnode.elm.parentNode.removeChild(vnode.elm);
        }
        // Remove real element from where it was inserted
        vnode.elm = vnode.data.attachData.real;
    }
    function create(_, vnode) {
        var real = vnode.elm, attachData = vnode.data.attachData;
        var placeholder = document.createElement('span');
        // Replace actual element with dummy placeholder
        // Snabbdom will then insert placeholder instead
        vnode.elm = placeholder;
        attachData.target.appendChild(real);
        attachData.real = real;
        attachData.placeholder = placeholder;
    }
    function attachTo(target, vnode) {
        if (vnode.data === undefined)
            vnode.data = {};
        if (vnode.data.hook === undefined)
            vnode.data.hook = {};
        var data = vnode.data;
        var hook = vnode.data.hook;
        data.attachData = { target: target, placeholder: undefined, real: undefined };
        hook.create = create;
        hook.prepatch = pre;
        hook.postpatch = post;
        hook.destroy = destroy;
        return vnode;
    }
    exports.attachTo = attachTo;
    ;
    exports.default = attachTo;
});
define("modules/module", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("modules/style", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
    var nextFrame = function (fn) { raf(function () { raf(fn); }); };
    function setNextFrame(obj, prop, val) {
        nextFrame(function () { obj[prop] = val; });
    }
    function updateStyle(oldVnode, vnode) {
        var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
        if (!oldStyle && !style)
            return;
        if (oldStyle === style)
            return;
        oldStyle = oldStyle || {};
        style = style || {};
        var oldHasDel = 'delayed' in oldStyle;
        for (name in oldStyle) {
            if (!style[name]) {
                if (name[0] === '-' && name[1] === '-') {
                    elm.style.removeProperty(name);
                }
                else {
                    elm.style[name] = '';
                }
            }
        }
        for (name in style) {
            cur = style[name];
            if (name === 'delayed' && style.delayed) {
                for (var name2 in style.delayed) {
                    cur = style.delayed[name2];
                    if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
                        setNextFrame(elm.style, name2, cur);
                    }
                }
            }
            else if (name !== 'remove' && cur !== oldStyle[name]) {
                if (name[0] === '-' && name[1] === '-') {
                    elm.style.setProperty(name, cur);
                }
                else {
                    elm.style[name] = cur;
                }
            }
        }
    }
    function applyDestroyStyle(vnode) {
        var style, name, elm = vnode.elm, s = vnode.data.style;
        if (!s || !(style = s.destroy))
            return;
        for (name in style) {
            elm.style[name] = style[name];
        }
    }
    function applyRemoveStyle(vnode, rm) {
        var s = vnode.data.style;
        if (!s || !s.remove) {
            rm();
            return;
        }
        var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
        for (name in style) {
            applied.push(name);
            elm.style[name] = style[name];
        }
        compStyle = getComputedStyle(elm);
        var props = compStyle['transition-property'].split(', ');
        for (; i < props.length; ++i) {
            if (applied.indexOf(props[i]) !== -1)
                amount++;
        }
        elm.addEventListener('transitionend', function (ev) {
            if (ev.target === elm)
                --amount;
            if (amount === 0)
                rm();
        });
    }
    exports.styleModule = {
        create: updateStyle,
        update: updateStyle,
        destroy: applyDestroyStyle,
        remove: applyRemoveStyle
    };
    exports.default = exports.styleModule;
});
define("modules/eventlisteners", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function invokeHandler(handler, vnode, event) {
        if (typeof handler === "function") {
            // call function handler
            handler.call(vnode, event, vnode);
        }
        else if (typeof handler === "object") {
            // call handler with arguments
            if (typeof handler[0] === "function") {
                // special case for single argument for performance
                if (handler.length === 2) {
                    handler[0].call(vnode, handler[1], event, vnode);
                }
                else {
                    var args = handler.slice(1);
                    args.push(event);
                    args.push(vnode);
                    handler[0].apply(vnode, args);
                }
            }
            else {
                // call multiple handlers
                for (var i = 0; i < handler.length; i++) {
                    invokeHandler(handler[i]);
                }
            }
        }
    }
    function handleEvent(event, vnode) {
        var name = event.type, on = vnode.data.on;
        // call event handler(s) if exists
        if (on && on[name]) {
            invokeHandler(on[name], vnode, event);
        }
    }
    function createListener() {
        return function handler(event) {
            handleEvent(event, handler.vnode);
        };
    }
    function updateEventListeners(oldVnode, vnode) {
        var oldOn = oldVnode.data.on, oldListener = oldVnode.listener, oldElm = oldVnode.elm, on = vnode && vnode.data.on, elm = (vnode && vnode.elm), name;
        // optimization for reused immutable handlers
        if (oldOn === on) {
            return;
        }
        // remove existing listeners which no longer used
        if (oldOn && oldListener) {
            // if element changed or deleted we remove all existing listeners unconditionally
            if (!on) {
                for (name in oldOn) {
                    // remove listener if element was changed or existing listeners removed
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
            else {
                for (name in oldOn) {
                    // remove listener if existing listener removed
                    if (!on[name]) {
                        oldElm.removeEventListener(name, oldListener, false);
                    }
                }
            }
        }
        // add new listeners which has not already attached
        if (on) {
            // reuse existing listener or create new
            var listener = vnode.listener = oldVnode.listener || createListener();
            // update vnode for listener
            listener.vnode = vnode;
            // if element changed or added we add all needed listeners unconditionally
            if (!oldOn) {
                for (name in on) {
                    // add listener if element was changed or new listeners added
                    elm.addEventListener(name, listener, false);
                }
            }
            else {
                for (name in on) {
                    // add listener if new listener added
                    if (!oldOn[name]) {
                        elm.addEventListener(name, listener, false);
                    }
                }
            }
        }
    }
    exports.eventListenersModule = {
        create: updateEventListeners,
        update: updateEventListeners,
        destroy: updateEventListeners
    };
    exports.default = exports.eventListenersModule;
});
define("modules/attributes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
        "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
        "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
        "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
        "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
        "truespeed", "typemustmatch", "visible"];
    var xlinkNS = 'http://www.w3.org/1999/xlink';
    var xmlNS = 'http://www.w3.org/XML/1998/namespace';
    var colonChar = 58;
    var xChar = 120;
    var booleanAttrsDict = Object.create(null);
    for (var i = 0, len = booleanAttrs.length; i < len; i++) {
        booleanAttrsDict[booleanAttrs[i]] = true;
    }
    function updateAttrs(oldVnode, vnode) {
        var key, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs;
        if (!oldAttrs && !attrs)
            return;
        if (oldAttrs === attrs)
            return;
        oldAttrs = oldAttrs || {};
        attrs = attrs || {};
        // update modified attributes, add new attributes
        for (key in attrs) {
            var cur = attrs[key];
            var old = oldAttrs[key];
            if (old !== cur) {
                if (booleanAttrsDict[key]) {
                    if (cur) {
                        elm.setAttribute(key, "");
                    }
                    else {
                        elm.removeAttribute(key);
                    }
                }
                else {
                    if (key.charCodeAt(0) !== xChar) {
                        elm.setAttribute(key, cur);
                    }
                    else if (key.charCodeAt(3) === colonChar) {
                        // Assume xml namespace
                        elm.setAttributeNS(xmlNS, key, cur);
                    }
                    else if (key.charCodeAt(5) === colonChar) {
                        // Assume xlink namespace
                        elm.setAttributeNS(xlinkNS, key, cur);
                    }
                    else {
                        elm.setAttribute(key, cur);
                    }
                }
            }
        }
        // remove removed attributes
        // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
        // the other option is to remove all attributes with value == undefined
        for (key in oldAttrs) {
            if (!(key in attrs)) {
                elm.removeAttribute(key);
            }
        }
    }
    exports.attributesModule = { create: updateAttrs, update: updateAttrs };
    exports.default = exports.attributesModule;
});
define("modules/class", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function updateClass(oldVnode, vnode) {
        var cur, name, elm = vnode.elm, oldClass = oldVnode.data.class, klass = vnode.data.class;
        if (!oldClass && !klass)
            return;
        if (oldClass === klass)
            return;
        oldClass = oldClass || {};
        klass = klass || {};
        for (name in oldClass) {
            if (!klass[name]) {
                elm.classList.remove(name);
            }
        }
        for (name in klass) {
            cur = klass[name];
            if (cur !== oldClass[name]) {
                elm.classList[cur ? 'add' : 'remove'](name);
            }
        }
    }
    exports.classModule = { create: updateClass, update: updateClass };
    exports.default = exports.classModule;
});
define("modules/props", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function updateProps(oldVnode, vnode) {
        var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
        if (!oldProps && !props)
            return;
        if (oldProps === props)
            return;
        oldProps = oldProps || {};
        props = props || {};
        for (key in oldProps) {
            if (!props[key]) {
                delete elm[key];
            }
        }
        for (key in props) {
            cur = props[key];
            old = oldProps[key];
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                elm[key] = cur;
            }
        }
    }
    exports.propsModule = { create: updateProps, update: updateProps };
    exports.default = exports.propsModule;
});
define("modules/dataset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CAPS_REGEX = /[A-Z]/g;
    function updateDataset(oldVnode, vnode) {
        var elm = vnode.elm, oldDataset = oldVnode.data.dataset, dataset = vnode.data.dataset, key;
        if (!oldDataset && !dataset)
            return;
        if (oldDataset === dataset)
            return;
        oldDataset = oldDataset || {};
        dataset = dataset || {};
        var d = elm.dataset;
        for (key in oldDataset) {
            if (!dataset[key]) {
                if (d) {
                    delete d[key];
                }
                else {
                    elm.removeAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase());
                }
            }
        }
        for (key in dataset) {
            if (oldDataset[key] !== dataset[key]) {
                if (d) {
                    d[key] = dataset[key];
                }
                else {
                    elm.setAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase(), dataset[key]);
                }
            }
        }
    }
    exports.datasetModule = { create: updateDataset, update: updateDataset };
    exports.default = exports.datasetModule;
});
define("modules/hero", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
    var nextFrame = function (fn) { raf(function () { raf(fn); }); };
    function setNextFrame(obj, prop, val) {
        nextFrame(function () { obj[prop] = val; });
    }
    function getTextNodeRect(textNode) {
        var rect;
        if (document.createRange) {
            var range = document.createRange();
            range.selectNodeContents(textNode);
            if (range.getBoundingClientRect) {
                rect = range.getBoundingClientRect();
            }
        }
        return rect;
    }
    function calcTransformOrigin(isTextNode, textRect, boundingRect) {
        if (isTextNode) {
            if (textRect) {
                //calculate pixels to center of text from left edge of bounding box
                var relativeCenterX = textRect.left + textRect.width / 2 - boundingRect.left;
                var relativeCenterY = textRect.top + textRect.height / 2 - boundingRect.top;
                return relativeCenterX + 'px ' + relativeCenterY + 'px';
            }
        }
        return '0 0'; //top left
    }
    function getTextDx(oldTextRect, newTextRect) {
        if (oldTextRect && newTextRect) {
            return ((oldTextRect.left + oldTextRect.width / 2) - (newTextRect.left + newTextRect.width / 2));
        }
        return 0;
    }
    function getTextDy(oldTextRect, newTextRect) {
        if (oldTextRect && newTextRect) {
            return ((oldTextRect.top + oldTextRect.height / 2) - (newTextRect.top + newTextRect.height / 2));
        }
        return 0;
    }
    function isTextElement(elm) {
        return elm.childNodes.length === 1 && elm.childNodes[0].nodeType === 3;
    }
    var removed, created;
    function pre() {
        removed = {};
        created = [];
    }
    function create(oldVnode, vnode) {
        var hero = vnode.data.hero;
        if (hero && hero.id) {
            created.push(hero.id);
            created.push(vnode);
        }
    }
    function destroy(vnode) {
        var hero = vnode.data.hero;
        if (hero && hero.id) {
            var elm = vnode.elm;
            vnode.isTextNode = isTextElement(elm); //is this a text node?
            vnode.boundingRect = elm.getBoundingClientRect(); //save the bounding rectangle to a new property on the vnode
            vnode.textRect = vnode.isTextNode ? getTextNodeRect(elm.childNodes[0]) : null; //save bounding rect of inner text node
            var computedStyle = window.getComputedStyle(elm, void 0); //get current styles (includes inherited properties)
            vnode.savedStyle = JSON.parse(JSON.stringify(computedStyle)); //save a copy of computed style values
            removed[hero.id] = vnode;
        }
    }
    function post() {
        var i, id, newElm, oldVnode, oldElm, hRatio, wRatio, oldRect, newRect, dx, dy, origTransform, origTransition, newStyle, oldStyle, newComputedStyle, isTextNode, newTextRect, oldTextRect;
        for (i = 0; i < created.length; i += 2) {
            id = created[i];
            newElm = created[i + 1].elm;
            oldVnode = removed[id];
            if (oldVnode) {
                isTextNode = oldVnode.isTextNode && isTextElement(newElm); //Are old & new both text?
                newStyle = newElm.style;
                newComputedStyle = window.getComputedStyle(newElm, void 0); //get full computed style for new element
                oldElm = oldVnode.elm;
                oldStyle = oldElm.style;
                //Overall element bounding boxes
                newRect = newElm.getBoundingClientRect();
                oldRect = oldVnode.boundingRect; //previously saved bounding rect
                //Text node bounding boxes & distances
                if (isTextNode) {
                    newTextRect = getTextNodeRect(newElm.childNodes[0]);
                    oldTextRect = oldVnode.textRect;
                    dx = getTextDx(oldTextRect, newTextRect);
                    dy = getTextDy(oldTextRect, newTextRect);
                }
                else {
                    //Calculate distances between old & new positions
                    dx = oldRect.left - newRect.left;
                    dy = oldRect.top - newRect.top;
                }
                hRatio = newRect.height / (Math.max(oldRect.height, 1));
                wRatio = isTextNode ? hRatio : newRect.width / (Math.max(oldRect.width, 1)); //text scales based on hRatio
                // Animate new element
                origTransform = newStyle.transform;
                origTransition = newStyle.transition;
                if (newComputedStyle.display === 'inline')
                    newStyle.display = 'inline-block'; //this does not appear to have any negative side effects
                newStyle.transition = origTransition + 'transform 0s';
                newStyle.transformOrigin = calcTransformOrigin(isTextNode, newTextRect, newRect);
                newStyle.opacity = '0';
                newStyle.transform = origTransform + 'translate(' + dx + 'px, ' + dy + 'px) ' +
                    'scale(' + 1 / wRatio + ', ' + 1 / hRatio + ')';
                setNextFrame(newStyle, 'transition', origTransition);
                setNextFrame(newStyle, 'transform', origTransform);
                setNextFrame(newStyle, 'opacity', '1');
                // Animate old element
                for (var key in oldVnode.savedStyle) {
                    if (parseInt(key) != key) {
                        var ms = key.substring(0, 2) === 'ms';
                        var moz = key.substring(0, 3) === 'moz';
                        var webkit = key.substring(0, 6) === 'webkit';
                        if (!ms && !moz && !webkit)
                            oldStyle[key] = oldVnode.savedStyle[key];
                    }
                }
                oldStyle.position = 'absolute';
                oldStyle.top = oldRect.top + 'px'; //start at existing position
                oldStyle.left = oldRect.left + 'px';
                oldStyle.width = oldRect.width + 'px'; //Needed for elements who were sized relative to their parents
                oldStyle.height = oldRect.height + 'px'; //Needed for elements who were sized relative to their parents
                oldStyle.margin = '0'; //Margin on hero element leads to incorrect positioning
                oldStyle.transformOrigin = calcTransformOrigin(isTextNode, oldTextRect, oldRect);
                oldStyle.transform = '';
                oldStyle.opacity = '1';
                document.body.appendChild(oldElm);
                setNextFrame(oldStyle, 'transform', 'translate(' + -dx + 'px, ' + -dy + 'px) scale(' + wRatio + ', ' + hRatio + ')'); //scale must be on far right for translate to be correct
                setNextFrame(oldStyle, 'opacity', '0');
                oldElm.addEventListener('transitionend', function (ev) {
                    if (ev.propertyName === 'transform')
                        document.body.removeChild(ev.target);
                });
            }
        }
        removed = created = undefined;
    }
    exports.heroModule = { pre: pre, create: create, destroy: destroy, post: post };
    exports.default = exports.heroModule;
});
define("vnode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function vnode(sel, data, children, text, elm) {
        var key = data === undefined ? undefined : data.key;
        return { sel: sel, data: data, children: children,
            text: text, elm: elm, key: key };
    }
    exports.vnode = vnode;
    exports.default = vnode;
});
define("is", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.array = Array.isArray;
    function primitive(s) {
        return typeof s === 'string' || typeof s === 'number';
    }
    exports.primitive = primitive;
});
define("createElement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function selectorToString(sel) {
        var id = sel.id ? "#" + sel.id.trim() : '';
        var tag = sel.tagName ? sel.tagName.trim() : '';
        var className = sel.className || '';
        var classes = className.split(' ').map(function (s) { return s ? "." + s : ''; }).join('');
        return "" + tag + id + classes;
    }
    exports.selectorToString = selectorToString;
    //export type VNode = Snabbdom.VNode<Element>;
    //export type VNodeData = Snabbdom.VNodeData<Element>;
    function createElement(type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        var selector = selectorFromReactElement(type, props);
        return {
            children: children.map(function (child) {
                return (typeof child === 'string') ? stringToVNode(child) : child;
            }),
            data: dataFromReactProps(props),
            sel: selectorToString(selector)
        };
    }
    exports.createElement = createElement;
    // NOTE: this function uses in place modification of the props parameter. Maybe
    //       is better to use copy of the props object.
    function dataFromReactProps(props) {
        var data = {};
        data.props = props;
        if (data.props && data.props.style) {
            data.style = data.props.style;
            delete data.props.style;
        }
        return data;
    }
    function selectorFromReactElement(type, props) {
        return {
            tagName: type,
            id: props ? props.id : undefined,
            className: props ? props.class : undefined
        };
    }
    function stringToVNode(str) {
        return { text: str };
    }
});
define("h", ["require", "exports", "vnode", "is"], function (require, exports, vnode_1, is) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addNS(data, children, sel) {
        data.ns = 'http://www.w3.org/2000/svg';
        if (sel !== 'foreignObject' && children !== undefined) {
            for (var i = 0; i < children.length; ++i) {
                var childData = children[i].data;
                if (childData !== undefined) {
                    addNS(childData, children[i].children, children[i].sel);
                }
            }
        }
    }
    function h(sel, b, c) {
        var data = {}, children, text, i;
        if (c === undefined && b === null) {
            b = undefined;
        }
        if (c !== undefined) {
            data = b;
            if (is.array(c)) {
                children = c;
            }
            else if (is.primitive(c)) {
                text = c;
            }
            else if (c && c.sel) {
                children = [c];
            }
        }
        else if (b !== undefined) {
            if (is.array(b)) {
                children = b;
            }
            else if (is.primitive(b)) {
                text = b;
            }
            else if (b && b.sel) {
                children = [b];
            }
            else {
                data = b;
            }
        }
        if (is.array(children)) {
            for (i = 0; i < children.length; ++i) {
                if (is.primitive(children[i]))
                    children[i] = vnode_1.vnode(undefined, undefined, undefined, children[i]);
            }
        }
        if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
            (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
            addNS(data, children, sel);
        }
        return vnode_1.vnode(sel, data, children, text, undefined);
    }
    exports.h = h;
    ;
    exports.default = h;
});
define("htmldomapi", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createElement(tagName) {
        return document.createElement(tagName);
    }
    function createElementNS(namespaceURI, qualifiedName) {
        return document.createElementNS(namespaceURI, qualifiedName);
    }
    function createTextNode(text) {
        return document.createTextNode(text);
    }
    function createComment(text) {
        return document.createComment(text);
    }
    function insertBefore(parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }
    function removeChild(node, child) {
        node.removeChild(child);
    }
    function appendChild(node, child) {
        node.appendChild(child);
    }
    function parentNode(node) {
        return node.parentNode;
    }
    function nextSibling(node) {
        return node.nextSibling;
    }
    function tagName(elm) {
        return elm.tagName;
    }
    function setTextContent(node, text) {
        node.textContent = text;
    }
    function getTextContent(node) {
        return node.textContent;
    }
    function isElement(node) {
        return node.nodeType === 1;
    }
    function isText(node) {
        return node.nodeType === 3;
    }
    function isComment(node) {
        return node.nodeType === 8;
    }
    exports.htmlDomApi = {
        createElement: createElement,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        getTextContent: getTextContent,
        isElement: isElement,
        isText: isText,
        isComment: isComment,
    };
    exports.default = exports.htmlDomApi;
});
define("thunk", ["require", "exports", "h"], function (require, exports, h_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function copyToThunk(vnode, thunk) {
        thunk.elm = vnode.elm;
        vnode.data.fn = thunk.data.fn;
        vnode.data.args = thunk.data.args;
        thunk.data = vnode.data;
        thunk.children = vnode.children;
        thunk.text = vnode.text;
        thunk.elm = vnode.elm;
    }
    function init(thunk) {
        var cur = thunk.data;
        var vnode = cur.fn.apply(undefined, cur.args);
        copyToThunk(vnode, thunk);
    }
    function prepatch(oldVnode, thunk) {
        var i, old = oldVnode.data, cur = thunk.data;
        var oldArgs = old.args, args = cur.args;
        if (old.fn !== cur.fn || oldArgs.length !== args.length) {
            copyToThunk(cur.fn.apply(undefined, args), thunk);
            return;
        }
        for (i = 0; i < args.length; ++i) {
            if (oldArgs[i] !== args[i]) {
                copyToThunk(cur.fn.apply(undefined, args), thunk);
                return;
            }
        }
        copyToThunk(oldVnode, thunk);
    }
    exports.thunk = function thunk(sel, key, fn, args) {
        if (args === undefined) {
            args = fn;
            fn = key;
            key = undefined;
        }
        return h_1.h(sel, {
            key: key,
            hook: { init: init, prepatch: prepatch },
            fn: fn,
            args: args
        });
    };
    exports.default = exports.thunk;
});
define("snabbdom", ["require", "exports", "vnode", "is", "htmldomapi", "h", "thunk"], function (require, exports, vnode_2, is, htmldomapi_1, h_2, thunk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isUndef(s) { return s === undefined; }
    function isDef(s) { return s !== undefined; }
    var emptyNode = vnode_2.default('', {}, [], undefined, undefined);
    function sameVnode(vnode1, vnode2) {
        return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
    }
    function isVnode(vnode) {
        return vnode.sel !== undefined;
    }
    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var map = {};
        for (var i = beginIdx; i <= endIdx; ++i) {
            var ch = children[i];
            if (ch != null) {
                var key = ch.key;
                if (key !== undefined) {
                    map[key] = i;
                }
            }
        }
        return map;
    }
    var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
    exports.h = h_2.h;
    exports.thunk = thunk_1.thunk;
    function init(modules, domApi) {
        var i, j, cbs = {};
        var api = domApi !== undefined ? domApi : htmldomapi_1.default;
        for (i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = [];
            for (j = 0; j < modules.length; ++j) {
                var hook = modules[j][hooks[i]];
                if (hook !== undefined) {
                    cbs[hooks[i]].push(hook);
                }
            }
        }
        function emptyNodeAt(elm) {
            var id = elm.id ? '#' + elm.id : '';
            var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
            return vnode_2.default(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
        }
        function createRmCb(childElm, listeners) {
            return function rmCb() {
                if (--listeners === 0) {
                    var parent_1 = api.parentNode(childElm);
                    api.removeChild(parent_1, childElm);
                }
            };
        }
        function createElm(vnode, insertedVnodeQueue) {
            var i, data = vnode.data;
            if (data !== undefined) {
                if (isDef(i = data.hook) && isDef(i = i.init)) {
                    i(vnode);
                    data = vnode.data;
                }
            }
            var children = vnode.children, sel = vnode.sel;
            if (sel === '!') {
                if (isUndef(vnode.text)) {
                    vnode.text = '';
                }
                vnode.elm = api.createComment(vnode.text);
            }
            else if (sel !== undefined) {
                // Parse selector
                var hashIdx = sel.indexOf('#');
                var dotIdx = sel.indexOf('.', hashIdx);
                var hash = hashIdx > 0 ? hashIdx : sel.length;
                var dot = dotIdx > 0 ? dotIdx : sel.length;
                var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
                var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                    : api.createElement(tag);
                if (hash < dot)
                    elm.setAttribute('id', sel.slice(hash + 1, dot));
                if (dotIdx > 0)
                    elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
                for (i = 0; i < cbs.create.length; ++i)
                    cbs.create[i](emptyNode, vnode);
                if (is.array(children)) {
                    for (i = 0; i < children.length; ++i) {
                        var ch = children[i];
                        if (ch != null) {
                            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                        }
                    }
                }
                else if (is.primitive(vnode.text)) {
                    api.appendChild(elm, api.createTextNode(vnode.text));
                }
                i = vnode.data.hook; // Reuse variable
                if (isDef(i)) {
                    if (i.create)
                        i.create(emptyNode, vnode);
                    if (i.insert)
                        insertedVnodeQueue.push(vnode);
                }
            }
            else {
                vnode.elm = api.createTextNode(vnode.text);
            }
            return vnode.elm;
        }
        function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (ch != null) {
                    api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
                }
            }
        }
        function invokeDestroyHook(vnode) {
            var i, j, data = vnode.data;
            if (data !== undefined) {
                if (isDef(i = data.hook) && isDef(i = i.destroy))
                    i(vnode);
                for (i = 0; i < cbs.destroy.length; ++i)
                    cbs.destroy[i](vnode);
                if (vnode.children !== undefined) {
                    for (j = 0; j < vnode.children.length; ++j) {
                        i = vnode.children[j];
                        if (i != null && typeof i !== "string") {
                            invokeDestroyHook(i);
                        }
                    }
                }
            }
        }
        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
                if (ch != null) {
                    if (isDef(ch.sel)) {
                        invokeDestroyHook(ch);
                        listeners = cbs.remove.length + 1;
                        rm = createRmCb(ch.elm, listeners);
                        for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                            cbs.remove[i_1](ch, rm);
                        if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                            i_1(ch, rm);
                        }
                        else {
                            rm();
                        }
                    }
                    else {
                        api.removeChild(parentElm, ch.elm);
                    }
                }
            }
        }
        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
            var oldStartIdx = 0, newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx;
            var idxInOld;
            var elmToMove;
            var before;
            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (oldStartVnode == null) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
                }
                else if (oldEndVnode == null) {
                    oldEndVnode = oldCh[--oldEndIdx];
                }
                else if (newStartVnode == null) {
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (newEndVnode == null) {
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newEndVnode)) {
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldEndVnode, newStartVnode)) {
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    if (oldKeyToIdx === undefined) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    idxInOld = oldKeyToIdx[newStartVnode.key];
                    if (isUndef(idxInOld)) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                        newStartVnode = newCh[++newStartIdx];
                    }
                    else {
                        elmToMove = oldCh[idxInOld];
                        if (elmToMove.sel !== newStartVnode.sel) {
                            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                        }
                        else {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                        }
                        newStartVnode = newCh[++newStartIdx];
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
        function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
            var i, hook;
            if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
                i(oldVnode, vnode);
            }
            var elm = vnode.elm = oldVnode.elm;
            var oldCh = oldVnode.children;
            var ch = vnode.children;
            if (oldVnode === vnode)
                return;
            if (vnode.data !== undefined) {
                for (i = 0; i < cbs.update.length; ++i)
                    cbs.update[i](oldVnode, vnode);
                i = vnode.data.hook;
                if (isDef(i) && isDef(i = i.update))
                    i(oldVnode, vnode);
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch)
                        updateChildren(elm, oldCh, ch, insertedVnodeQueue);
                }
                else if (isDef(ch)) {
                    if (isDef(oldVnode.text))
                        api.setTextContent(elm, '');
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                }
                else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                }
                else if (isDef(oldVnode.text)) {
                    api.setTextContent(elm, '');
                }
            }
            else if (oldVnode.text !== vnode.text) {
                api.setTextContent(elm, vnode.text);
            }
            if (isDef(hook) && isDef(i = hook.postpatch)) {
                i(oldVnode, vnode);
            }
        }
        return function patch(oldVnode, vnode) {
            var i, elm, parent;
            var insertedVnodeQueue = [];
            for (i = 0; i < cbs.pre.length; ++i)
                cbs.pre[i]();
            if (!isVnode(oldVnode)) {
                oldVnode = emptyNodeAt(oldVnode);
            }
            if (sameVnode(oldVnode, vnode)) {
                patchVnode(oldVnode, vnode, insertedVnodeQueue);
            }
            else {
                elm = oldVnode.elm;
                parent = api.parentNode(elm);
                createElm(vnode, insertedVnodeQueue);
                if (parent !== null) {
                    api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                    removeVnodes(parent, [oldVnode], 0, 0);
                }
            }
            for (i = 0; i < insertedVnodeQueue.length; ++i) {
                insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
            }
            for (i = 0; i < cbs.post.length; ++i)
                cbs.post[i]();
            return vnode;
        };
    }
    exports.init = init;
});
define("tovnode", ["require", "exports", "vnode", "htmldomapi"], function (require, exports, vnode_3, htmldomapi_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function toVNode(node, domApi) {
        var api = domApi !== undefined ? domApi : htmldomapi_2.default;
        var text;
        if (api.isElement(node)) {
            var id = node.id ? '#' + node.id : '';
            var cn = node.getAttribute('class');
            var c = cn ? '.' + cn.split(' ').join('.') : '';
            var sel = api.tagName(node).toLowerCase() + id + c;
            var attrs = {};
            var children = [];
            var name_1;
            var i = void 0, n = void 0;
            var elmAttrs = node.attributes;
            var elmChildren = node.childNodes;
            for (i = 0, n = elmAttrs.length; i < n; i++) {
                name_1 = elmAttrs[i].nodeName;
                if (name_1 !== 'id' && name_1 !== 'class') {
                    attrs[name_1] = elmAttrs[i].nodeValue;
                }
            }
            for (i = 0, n = elmChildren.length; i < n; i++) {
                children.push(toVNode(elmChildren[i]));
            }
            return vnode_3.default(sel, { attrs: attrs }, children, undefined, node);
        }
        else if (api.isText(node)) {
            text = api.getTextContent(node);
            return vnode_3.default(undefined, undefined, undefined, text, node);
        }
        else if (api.isComment(node)) {
            text = api.getTextContent(node);
            return vnode_3.default('!', {}, [], text, node);
        }
        else {
            return vnode_3.default('', {}, [], undefined, undefined);
        }
    }
    exports.toVNode = toVNode;
    exports.default = toVNode;
});
define("index", ["require", "exports", "snabbdom", "modules/attributes", "modules/class", "modules/props", "modules/style", "modules/eventlisteners", "h", "vnode", "h", "createElement", "htmldomapi", "index", "is", "snabbdom", "thunk", "tovnode", "vnode", "helpers/attachto", "modules/attributes", "modules/class", "modules/dataset", "modules/eventlisteners", "modules/hero", "modules/props", "modules/style"], function (require, exports, snabbdom_1, attributes_1, class_1, props_1, style_1, eventlisteners_1, h_3, vnode_4, h_4, createElement_1, htmldomapi_3, index_1, is_1, snabbdom_2, thunk_2, tovnode_1, vnode_5, attachto_1, attributes_2, class_2, dataset_1, eventlisteners_2, hero_1, props_2, style_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var patch = snabbdom_1.init([
        attributes_1.attributesModule,
        class_1.classModule,
        props_1.propsModule,
        style_1.styleModule,
        eventlisteners_1.eventListenersModule
    ]);
    __export(vnode_4);
    __export(h_4);
    __export(createElement_1);
    __export(htmldomapi_3);
    __export(index_1);
    __export(is_1);
    __export(snabbdom_2);
    __export(thunk_2);
    __export(tovnode_1);
    __export(vnode_5);
    __export(attachto_1);
    __export(attributes_2);
    __export(class_2);
    __export(dataset_1);
    __export(eventlisteners_2);
    __export(hero_1);
    __export(props_2);
    __export(style_2);
    exports.snabbdomBundle = { patch: patch, h: h_3.h };
    exports.default = exports.snabbdomBundle;
});
