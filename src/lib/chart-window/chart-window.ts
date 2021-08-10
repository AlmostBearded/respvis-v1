import { Selection } from 'd3-selection';
import { layouterData, layouter, resizeEventListener } from '../core';
import { toolbar } from './toolbar';

export function chartWindow(selection: Selection<HTMLDivElement>): void {
  selection.classed('chart-window', true);
  selection.append('div').call((s) => toolbar(s));
  selection
    .append('div')
    .datum((_, i, g) => layouterData(g[i]))
    .call((s) => layouter(s));

  resizeEventListener(selection);
}
