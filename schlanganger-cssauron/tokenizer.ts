const PSEUDOSTART = 'pseudo-start';
const ATTR_START = 'attr-start';
const ANY_CHILD = 'any-child';
const ATTR_COMP = 'attr-comp';
const ATTR_END = 'attr-end';
const PSEUDOPSEUDO = '::';
const PSEUDOCLASS = ':';
const READY = '(ready)';
const OPERATION = 'op';
const CLASS = 'class';
const COMMA = 'comma';
const ATTR = 'attr';
const SUBJECT = '!';
const TAG = 'tag';
const STAR = '*';
const ID = 'id';

export interface Token {
  type: string;
  data: any;
}

export interface TokenLeaf {
  type: string;
  data: string;
}
export interface TokenNode {
  type: string;
  data: TokenData;
}
export interface TokenData {
  lhs: string;
  cmd: string;
  rhs: string;
}
export type Stream = StreamFN & StreamAttr;
export type StreamFN = (group: ((token: Token) => void), selector: string) => void;
export interface StreamAttr {
  //queue: (token: Token) => void;
  // ondata: (chunk: string) => void;
  next: (chunk: string) => void;

  onDataNext: ((token: Token) => void)

  // ondataOut: any;
  // onendOut: any;
}
export function tokenize(): StreamFN {
  var escaped: boolean = false;
  var gathered: any[] = [];
  var state: string = READY;
  var data: any[] = [];
  var idx: number = 0;
  var length: number;
  var quote: string | null;
  var depth: number;
  var lhs: string | null;
  var rhs: string | null;
  var cmp: string | null;
  var c: string;

  //return stream = through(ondata, onend)
  function stream(group: ((token: Token) => void), selector: string): void {
    var streamT = (stream as any as StreamAttr);
    streamT.onDataNext = group;
    streamT.next(selector);
    return;
  }

  var streamT: Stream = stream as Stream;
  streamT.next = onend;
  return stream;

  function stream_queue(token: Token) {
    (stream as any as StreamAttr).onDataNext(token);
  }

  function ondata(chunk: string) {
    data = data.concat(chunk.split(''))
    length = data.length

    while (idx < length && (c = data[idx++])) {
      switch (state) {
        case READY: state_ready(); break
        case ANY_CHILD: state_any_child(); break
        case OPERATION: state_op(); break
        case ATTR_START: state_attr_start(); break
        case ATTR_COMP: state_attr_compare(); break
        case ATTR_END: state_attr_end(); break
        case PSEUDOCLASS:
        case PSEUDOPSEUDO: state_pseudo(); break
        case PSEUDOSTART: state_pseudostart(); break
        case ID:
        case TAG:
        case CLASS: state_gather(false); break
      }
    }

    data = data.slice(idx)
  }

  function onend(chunk: string) {
    if (arguments.length) {
      ondata(chunk)
    }

    if (gathered.length) {
      stream_queue(token());
    }
  }

  function state_ready(): void {
    switch (true) {
      case '#' === c: state = ID; break
      case '.' === c: state = CLASS; break
      case ':' === c: state = PSEUDOCLASS; break
      case '[' === c: state = ATTR_START; break
      case '!' === c: subject(); break
      case '*' === c: star(); break
      case ',' === c: comma(); break
      case /[>\+~]/.test(c): state = OPERATION; break
      case /\s/.test(c): state = ANY_CHILD; break
      case /[\w\d\-_]/.test(c): state = TAG; --idx; break
    }
  }

  function subject(): void {
    state = SUBJECT
    gathered = ['!']
    stream_queue(token());
    state = READY
  }

  function star(): void {
    state = STAR
    gathered = ['*']
    stream_queue(token());
    state = READY
  }

  function comma(): void {
    state = COMMA
    gathered = [',']
    stream_queue(token());
    state = READY
  }

  function state_op(): void | number {
    if (/[>\+~]/.test(c)) {
      return gathered.push(c);
    }

    // chomp down the following whitespace.
    if (/\s/.test(c)) {
      return;
    }

    stream_queue(token());;
    state = READY;
    --idx;
  }

  function state_any_child() {
    if (/\s/.test(c)) {
      return;
    }

    if (/[>\+~]/.test(c)) {
      return --idx, state = OPERATION;
    }

    stream_queue(token());;
    state = READY;
    --idx;
  }

  function state_pseudo() {
    rhs = state;
    state_gather(true);

    if (state !== READY) {
      return;
    }

    if (c === '(') {
      lhs = gathered.join('');
      state = PSEUDOSTART;
      gathered.length = 0;
      depth = 1;
      ++idx;

      return;
    }

    state = PSEUDOCLASS;
    stream_queue(token());;
    state = READY;
  }

  function state_pseudostart() {
    if (gathered.length === 0 && !quote) {
      quote = /['"]/.test(c) ? c : null;

      if (quote) {
        return;
      }
    }

    if (quote) {
      if (!escaped && c === quote) {
        quote = null;

        return;
      }

      if (c === '\\') {
        escaped ? gathered.push(c) : (escaped = true);

        return;
      }

      escaped = false;
      gathered.push(c);

      return;
    }

    gathered.push(c);

    if (c === '(') {
      ++depth;
    } else if (c === ')') {
      --depth;
    }

    if (!depth) {
      gathered.pop();
      stream_queue({
        type: rhs as string
        , data: lhs + '(' + gathered.join('') + ')'
      });

      state = READY;
      lhs = rhs = cmp = null;
      gathered.length = 0;
    }

    return;
  }

  function state_attr_start() {
    state_gather(true);

    if (state !== READY) {
      return;
    }

    if (c === ']') {
      state = ATTR;
      stream_queue(token());;
      state = READY;

      return;
    }

    lhs = gathered.join('');
    gathered.length = 0;
    state = ATTR_COMP;
  }

  function state_attr_compare() {
    if (/[=~|$^*]/.test(c)) {
      gathered.push(c);
    }

    if (gathered.length === 2 || c === '=') {
      cmp = gathered.join('');
      gathered.length = 0;
      state = ATTR_END;
      quote = null;

      return;
    }
  }

  function state_attr_end() {
    if (!gathered.length && !quote) {
      quote = /['"]/.test(c) ? c : null;

      if (quote) {
        return;
      }
    }

    if (quote) {
      if (!escaped && c === quote) {
        quote = null;

        return;
      }

      if (c === '\\') {
        if (escaped) {
          gathered.push(c);
        }

        escaped = !escaped;

        return;
      }

      escaped = false;
      gathered.push(c);

      return;
    }

    state_gather(true);

    if (state !== READY) {
      return;
    }

    stream_queue({
      type: ATTR
      , data: {
        lhs: lhs
        , rhs: gathered.join('')
        , cmp: cmp
      }
    });

    state = READY;
    lhs = rhs = cmp = null;
    gathered.length = 0;

    return;
  }

  function state_gather(quietly: boolean): void {
    if (/[^\d\w\-_]/.test(c) && !escaped) {
      if (c === '\\') {
        escaped = true;
      } else {
        if (!quietly) { stream_queue(token());; }
        state = READY;
        --idx;
      }

      return;
    }

    escaped = false;
    gathered.push(c);
  }

  function token(): Token {
    let data: string = gathered.join('');

    gathered.length = 0;

    return {
      type: state
      , data: data
    } as Token;
  }
}
