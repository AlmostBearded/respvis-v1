import { Selection, BaseType } from 'd3-selection';
import { Layout } from './layout/layout';

export interface Component {
  (selection: Selection<SVGElement, unknown, BaseType, unknown>): void;
  resize(layout: Layout): void;
}

export function nullComponent(): Component {
  function renderedEmptyComponent(
    selection: Selection<SVGElement, unknown, HTMLElement, unknown>
  ): void {}

  renderedEmptyComponent.resize = function resize() {
    return renderedEmptyComponent;
  };

  return renderedEmptyComponent;
}
