let debugLogEnabled = false;

export function log(...rest: any): void {
  console.log(...rest);
}

export function debug(...rest: any): void {
  if (debugLogEnabled) console.debug(...rest);
}

export function enableDebugLog(enabled: boolean): void {
  debugLogEnabled = enabled;
}

export function nodeToString(node: Element): string {
  const id = node.id;
  const classes = node.classList.value.replace(/ /g, '.');
  return `${node.tagName}${id.length ? `#${id}` : ''}${classes.length ? `.${classes}` : ''}`;
}
