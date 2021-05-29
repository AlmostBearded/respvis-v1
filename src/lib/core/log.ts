export function log(...rest: any): void {
  console.log(...rest);
}

export function debug(...rest: any): void {
  console.debug(...rest);
}

export function nodeToString(node: Element): string {
  const id = node.id;
  const classes = node.classList.value.replace(/ /g, '.');
  return `${node.tagName}${id.length ? `#${id}` : ''}${classes.length ? `.${classes}` : ''}`;
}
