declare namespace JSX {
  interface Element {
    [attr: string]: string;
  }
  interface IntrinsicElements {
    [tag: string]: Element;
  }
}
