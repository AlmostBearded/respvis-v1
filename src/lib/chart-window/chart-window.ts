import { Selection } from 'd3-selection';
import { layouterData, layouter } from '../core';
import { toolbar } from './toolbar';

export function chartWindow(selection: Selection<HTMLDivElement>): void {
  selection
    .classed('chart-window', true)
    .style('display', 'grid')
    .style('grid-template', 'min-content 1fr / 1fr')
    .style('grid-template-areas', `"toolbar" "chart"`)
    .style('width', '100%')
    .style('height', '100%')
    .style('font-family', 'sans-serif');
  selection
    .append('div')
    .style('grid-area', 'toolbar')
    .call((s) => toolbar(s));
  selection
    .append('div')
    .datum((_, i, g) => layouterData(g[i]))
    .call((s) => layouter(s))
    .style('grid-area', 'chart');
}
