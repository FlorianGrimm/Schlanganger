import { tokenize, Token } from './tokenizer';

export interface Lookups<TNode> {
  id: string | ((node: TNode) => (string | undefined));
  class: string | ((node: TNode) => string);
  tag: string | ((node: TNode) => string);
  attr: string | ((node: TNode, attr: string) => string);
  parent: string | ((node: TNode) => TNode);
  children: string | ((node: TNode) => (Array<TNode | string> | undefined));
  contents: string | ((node: TNode) => (string | undefined));
}
export interface LookupsNormalized<TNode> {
  id: ((node: TNode) => (string | undefined));
  class: ((node: TNode) => string);
  tag: ((node: TNode) => string);
  attr: ((node: TNode, attr: string) => string);
  parent: ((node: TNode) => TNode);
  children: ((node: TNode) => (Array<TNode | string> | undefined));
  contents: ((node: TNode) => (string | undefined));
}

export type MatchComparison = ((type: any, pattern: any, data: any) => boolean);

type check_next_fn<TNode> = ((node: TNode) => boolean);

type _check_fn<TNode> = ((node: TNode, subj: TNode[]) => boolean);

//type fnBits<TNode> = (node: TNode, next?: (node: TNode, subj: TNode[]) => boolean, subj?: TNode[]) => boolean|TNode | string | null;

type fnBits<TNode> = any;

type fnBitsArray<TNode> = fnBits<TNode>[] & {
  subject?: boolean;
}

interface _check_attr<TNode> {
  bits: fnBits<TNode>[];
  subject: boolean;
  push: (token: Token) => void;
}

interface _check_fnattr<TNode> {
  (node: TNode, subj: TNode[]): boolean;
  bits: fnBits<TNode>[];
  subject: boolean;
  push: (token: fnBits<TNode>) => void;
}

export function language<TNode>(lookups: Lookups<TNode>, matchComparison?: MatchComparison)
  : ((selector: string) => ((node: TNode, as_boolean?: boolean) => (boolean | TNode | TNode[] | null))) {
  return function (selector: string)
    : ((node: TNode, as_boolean?: boolean) => (boolean | TNode | TNode[] | null)) {
    return parse(selector, remap(lookups), matchComparison || caseSensitiveComparison);
  }
}

function remap<TNode>(opts: Lookups<TNode>): LookupsNormalized<TNode> {
  var result = {};
  for (var key in opts) {
    if (opts.hasOwnProperty(key) && (typeof ((opts as any)[key]) === 'string')) {
      let opts_key = Function(
        'return function(node, attr) { return node.' + (opts as any) + ' }'
      );
      (result as any)[key] = opts_key();
    } else {
      (result as any)[key] = (opts as any)[key];
    }
  }
  return result as LookupsNormalized<TNode>;
}

function parse<TNode>(selector: string, options: LookupsNormalized<TNode>, matchComparison: MatchComparison)
  : ((node: TNode, as_boolean?: boolean) => (boolean | TNode | TNode[] | null)) {
  let stream = tokenize();
  let default_subj = true;
  let selectors: any = [[]];
  let bits: fnBitsArray<TNode> = selectors[0];

  const traversal = {
    '': any_parents
    , '>': direct_parent
    , '+': direct_sibling
    , '~': any_sibling
  };

  stream(group, selector);

  function group(token: Token): void {
    //var crnt: check_next_fn<TNode>[];

    if (token.type === 'comma') {
      selectors.unshift(bits = []);

      return;
    }

    if (token.type === 'op' || token.type === 'any-child') {
      bits.unshift((traversal as any)[token.data]);
      bits.unshift(check());

      return;
    }

    bits[0] = bits[0] || check();
    let crnt = bits[0];

    if (token.type === '!') {
      crnt.subject = true;
      selectors[0].subject = true;

      return;
    }

    crnt.push(
      token.type === 'class' ? listContains(token.type, token.data) :
        token.type === 'attr' ? attr(token) :
          token.type === ':' || token.type === '::' ? pseudo(token) :
            token.type === '*' ? Boolean :
              matches(token.type, token.data, matchComparison)
    )
  }

  return selector_fn;

  function selector_fn<TNode>(node: TNode, as_boolean?: boolean): boolean | TNode | TNode[] | null {
    // var current
    //   , length
    //   , subj

    let orig = node
    let set: TNode[] = []

    for (let i = 0, len = selectors.length; i < len; ++i) {
      bits = selectors[i];
      let current = entry;
      let length = bits.length;
      node = orig
      let subj: TNode[] = [];

      for (var j = 0; j < length; j += 2) {
        node = current(node, bits[j], subj) as TNode;

        if (!node) {
          break;
        }

        current = bits[j + 1]
      }

      if (j >= length) {
        if (as_boolean) {
          return true
        }

        add(!bits.subject ? [orig] : subj)
      }
    }

    if (as_boolean) {
      return false
    }

    return !set.length ? false :
      set.length === 1 ? set[0] :
        set

    function add(items: any[]) {
      while (items.length) {
        let next = items.shift()

        if (set.indexOf(next) === -1) {
          set.push(next)
        }
      }
    }
  }

  function check(): _check_fn<TNode> {
    let _checkT = _check as _check_fnattr<TNode>;
    _checkT.bits = [];
    _checkT.subject = false;
    _checkT.push = function (bit: fnBits<TNode>) {
      _checkT.bits.push(bit);
    }

    return _checkT;

    function _check<TNode>(node: TNode, subj: TNode[]): boolean {
      let _checkT = _check as any as _check_attr<TNode>;
      for (var i = 0, len = _checkT.bits.length; i < len; ++i) {
        if (!_checkT.bits[i](node)) {
          return false;
        }
      }

      if (_checkT.subject) {
        subj.push(node);
      }

      return true;
    }
  }

  function listContains(type: string, data: string): check_next_fn<TNode> {
    // type: class
    return function (node: TNode): boolean {
      let val = (options as any)[type](node);
      let valArray = (
        Array.isArray(val)
          ? val
          : val
            ? val.toString().split(/\s+/)
            : []
      );
      return valArray.indexOf(data) >= 0
    }
  }

  function attr(token: Token) {
    return (
      ((typeof (token.data.lhs) !== "undefined") && (token.data.lhs))
        ? valid_attr(
          options.attr
          , token.data.lhs
          , token.data.cmp
          , token.data.rhs
        )
        : valid_attr(options.attr, token.data));
  }

  function matches(type: string, data: any, matchComparison: MatchComparison) {
    return function (node: TNode) {
      return matchComparison(type, (options as any)[type](node), data);
    }
  }

  function any_parents(node: TNode, next: (node: TNode, subj: TNode[]) => boolean, subj: TNode[]): TNode | string | null {
    do {
      node = options.parent(node)
    } while (node && !next(node, subj))

    return node
  }

  function direct_parent(node: TNode, next: (node: TNode, subj: TNode[]) => boolean, subj: TNode[]): TNode | string | null {
    node = options.parent(node)

    return (node && next(node, subj)) ? node : null;
  }

  function direct_sibling(node: TNode, next: (node: TNode, subj: TNode[]) => boolean, subj: TNode[]): TNode | string | null {
    let parent = options.parent(node);
    let idx = 0;
    let children = options.children(parent) as TNode[];

    for (let i = 0, len = children.length; i < len; ++i) {
      if (children[i] === node) {
        idx = i;
        break;
      }
    }

    return ((children[idx - 1] && next(children[idx - 1] as TNode, subj))
      ? children[idx - 1]
      : null)
  }

  function any_sibling(node: TNode, next: (node: TNode, subj: TNode[]) => boolean, subj: TNode[]): TNode | string | null {
    let parent = options.parent(node);
    let children = options.children(parent) as TNode[];

    for (var i = 0, len = children.length; i < len; ++i) {
      if (children[i] === node) {
        return null;
      }

      if (next(children[i] as TNode, subj)) {
        return children[i];
      }
    }

    return null;
  }

  function pseudo(token: Token): check_next_fn<TNode> {
    return valid_pseudo(options, token.data, matchComparison)
  }

}

function entry<TNode>(node: TNode, next: (node: TNode, subj: TNode[]) => boolean, subj: TNode[]): TNode | string | null {
  return (next(node, subj)) ? node : null;
}

function valid_pseudo<TNode>(options: LookupsNormalized<TNode>, match: string, matchComparison: MatchComparison): check_next_fn<TNode> {
  switch (match) {
    case 'empty': return valid_empty(options)
    case 'first-child': return valid_first_child(options)
    case 'last-child': return valid_last_child(options)
    case 'root': return valid_root(options)
  }

  if (match.indexOf('contains') === 0) {
    return valid_contains(options, match.slice(9, -1))
  }

  if (match.indexOf('any') === 0) {
    return valid_any_match(options, match.slice(4, -1), matchComparison)
  }

  if (match.indexOf('not') === 0) {
    return valid_not_match(options, match.slice(4, -1), matchComparison)
  }

  if (match.indexOf('nth-child') === 0) {
    return valid_nth_child(options, match.slice(10, -1))
  }

  return function (node: TNode) {
    return false;
  }
}

function valid_not_match<TNode>(options: LookupsNormalized<TNode>, selector: string, matchComparison: MatchComparison): check_next_fn<TNode> {
  var fn = parse(selector, options, matchComparison);
  return not_function;
  function not_function(node: TNode): boolean {
    return !fn(node, true)
  }
}

function valid_any_match<TNode>(options: LookupsNormalized<TNode>, selector: string, matchComparison: MatchComparison): check_next_fn<TNode> {
  var fn = parse(selector, options, matchComparison) as check_next_fn<TNode>;
  return fn;
}

function valid_attr<TNode>(fn: ((node: TNode, sub: string) => string), lhs: string, cmp?: string, rhs?: string): check_next_fn<TNode> {
  return function (node: TNode) {
    var attr = fn(node, lhs)

    if (!cmp) {
      return !!attr
    }

    if (cmp.length === 1) {
      return attr == rhs;
    }

    if (attr === void 0 || attr === null) {
      return false;
    }

    const char0 = cmp.charAt(0);
    const fn_checkattr = ((checkattr as any)[char0]) as ((l: string, r: string) => boolean);
    return fn_checkattr(attr, rhs as string);
  }
}

function valid_first_child<TNode>(options: LookupsNormalized<TNode>): check_next_fn<TNode> {
  return function (node: TNode) {
    let children = options.children(options.parent(node));
    return !!children && children[0] === node;
  }
}

function valid_last_child<TNode>(options: LookupsNormalized<TNode>): check_next_fn<TNode> {
  return function (node: TNode) {
    let children = options.children(options.parent(node));
    return !!children && (children[children.length - 1] === node);
  }
}

function valid_empty<TNode>(options: LookupsNormalized<TNode>): check_next_fn<TNode> {
  return function (node: TNode) {
    let children = options.children(node);
    return !!children && (children.length === 0);
  }
}

function valid_root<TNode>(options: LookupsNormalized<TNode>): check_next_fn<TNode> {
  return function (node: TNode) {
    return !options.parent(node);
  }
}

function valid_contains<TNode>(options: LookupsNormalized<TNode>, contents: string): check_next_fn<TNode> {
  return function (node: TNode) {
    let nodecontents = options.contents(node);
    return !!nodecontents && (nodecontents.indexOf(contents) !== -1);
  }
}

function valid_nth_child<TNode>(options: LookupsNormalized<TNode>, nth: string): check_next_fn<TNode> {
  var test = function (children: TNode[], node: TNode) { return false; };
  if (nth == 'odd') {
    nth = '2n+1';
  } else if (nth == 'even') {
    nth = '2n';
  }
  var regexp = /( ?([-|\+])?(\d*)n)? ?((\+|-)? ?(\d+))? ?/;
  var matches = nth.match(regexp);
  if (matches) {
    var growth = 0;
    if (matches[1]) {
      var positiveGrowth = (matches[2] != '-');
      growth = parseInt(matches[3] == '' ? "1" : matches[3], 10);
      growth = growth * (positiveGrowth ? 1 : -1);
    }
    var offset = 0;
    if (matches[4]) {
      offset = parseInt(matches[6]);
      var positiveOffset = (matches[5] != '-');
      offset = offset * (positiveOffset ? 1 : -1);
    }
    if (growth == 0) {
      if (offset != 0) {
        test = function (children: TNode[], node: TNode) {
          return children[offset - 1] === node;
        };
      }
    } else {
      test = function (children: TNode[], node: TNode) {
        const validPositions = [];
        const len = children.length;
        for (let position = 1; position <= len; position++) {
          let divisible = ((position - offset) % growth) == 0;
          if (divisible) {
            if (growth > 0) {
              validPositions.push(position);
            } else {
              if ((position - offset) / growth >= 0) {
                validPositions.push(position);
              }
            }
          }
        }
        for (let i = 0; i < validPositions.length; i++) {
          if (children[validPositions[i] - 1] === node) {
            return true;
          }
        }
        return false;
      };
    }
  }
  return function (node: TNode) {
    let children = options.children(options.parent(node)) as TNode[];
    return test(children, node)
  }
}

const checkattr = {
  '$': check_end
  , '^': check_beg
  , '*': check_any
  , '~': check_spc
  , '|': check_dsh
};

function check_end(l: string, r: string): boolean {
  return l.slice(l.length - r.length) === r;
}

function check_beg(l: string, r: string): boolean {
  return l.slice(0, r.length) === r;
}

function check_any(l: string, r: string): boolean {
  return l.indexOf(r) > -1;
}

function check_spc(l: string, r: string): boolean {
  return l.split(/\s+/).indexOf(r) > -1;
}

function check_dsh(l: string, r: string): boolean {
  return l.split('-').indexOf(r) > -1
}

function caseSensitiveComparison(type: any, pattern: any, data: any): boolean {
  return pattern === data;
}
