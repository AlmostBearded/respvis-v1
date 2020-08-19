import { select, Selection } from 'd3-selection';
import { nullFunction } from '../utils';

export function chart(): (containerSelector: string) => void {
  let _components: ((selection: Selection<SVGElement, unknown, HTMLElement, unknown>) => void)[];
  let _updateComponents = nullFunction;

  function renderedChart(containerSelector: string) {
    const selection = select(containerSelector).append('svg').classed('chart', true);
    const boundingRect = selection.node()!.getBoundingClientRect();
    selection.attr('viewBox', `0, 0, ${boundingRect.width}, ${boundingRect.height}`);

    for (let i = 0; i < _components.length; ++i) {
      _components[i](selection);
    }

    _updateComponents = function () {};
  }

  renderedChart.components = function (
    components?: ((selection: Selection<SVGElement, unknown, HTMLElement, unknown>) => void)[]
  ) {
    if (!arguments.length) return _components;
    _components = components || [];
    _updateComponents();
    return renderedChart;
  };

  return renderedChart;
}
