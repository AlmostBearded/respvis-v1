import { Selection } from 'd3-selection';
import { layouter } from './layouter';
import { menuDropdown } from './menu-dropdown';
import { resizeEventListener } from './resize-event-dispatcher';

export function chartWindow(selection: Selection<HTMLDivElement>): void {
  selection.classed('chart-window', true);

  selection
    .selectAll<HTMLDivElement, any>('.toolbar')
    .data([null])
    .join('div')
    .call((s) => toolbar(s));

  selection
    .selectAll<HTMLDivElement, any>('.layouter')
    .data([null])
    .join('div')
    .call((s) => layouter(s));

  resizeEventListener(selection);
}

export function toolbar(selection: Selection<HTMLDivElement>): void {
  selection.classed('toolbar', true);

  selection
    .selectAll<HTMLDivElement, any>('.menu-tools')
    .data([null])
    .join('div')
    .call((s) => menuTools(s));
}

export function menuTools(selection: Selection<HTMLDivElement>): void {
  selection.call((s) => menuDropdown(s)).classed('menu-tools', true);

  selection.selectChildren('.chevron').remove();
  selection.selectChildren('.text').text('☰');
}
