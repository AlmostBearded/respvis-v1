export function siblingIndex(node: Element, selector: string = ''): number {
  let index = 0;
  let sibling: Element | null = node;
  while ((sibling = sibling.previousElementSibling)) {
    if ((selector === '' && sibling.matches(selector)) || selector !== '') index++;
  }
  return index;
}
