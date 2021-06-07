import { selectAll, Selection } from 'd3-selection';
import { debug } from './log';

const renderQueueNodes: Set<Element> = new Set();
let animationFrameRequestId = NaN;

export function renderQueueEnqueue(node: Element): void {
  renderQueueNodes.add(node);
  if (isNaN(animationFrameRequestId))
    animationFrameRequestId = window.requestAnimationFrame(renderQueueRender);
}

export function renderQueueRender(): void {
  debug('render queue render');

  const nodePaths: number[][] = [];
  renderQueueNodes.forEach((n) => nodePaths.push(nodePath(document.body, n)));

  // sort node paths depth-first
  const maxPathLenght = Math.max(...nodePaths.map((path) => path.length));
  const pathReducer = (accumulator: number, value: number, index: number) =>
    accumulator + value * Math.pow(10, maxPathLenght - 1 - index);
  nodePaths.sort((a, b) => a.reduce(pathReducer, 0) - b.reduce(pathReducer, 0));

  // map paths to nodes
  const sortedNodes = nodePaths.map((path) =>
    path.reduce((accumulator, value) => accumulator.children[value], document.body)
  );

  selectAll(sortedNodes).dispatch('render');

  renderQueueNodes.clear();
  window.cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = NaN;
}

function nodePath(root: Element, node: Element): number[] {
  const path: number[] = [];
  while (node !== root) {
    path.push(Array.prototype.indexOf.call(node.parentElement!.children, node));
    node = node.parentElement!;
  }
  return path.reverse();
}
