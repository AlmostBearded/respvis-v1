import { Selection } from 'd3-selection';
import { layouter } from '../core';
import { toolbar } from './toolbar';

export function chartWindow(selection: Selection<HTMLDivElement>): void {
  layouter(selection);
  selection
    .classed('chart-window', true)
    .style('grid-template', 'auto 1fr / 1fr')
    .style('grid-template-areas', `"toolbar" "chart"`)
    .style('font-family', 'sans-serif');
  selection
    .append('div')
    .style('grid-area', 'toolbar')
    .call((s) => toolbar(s));
}
