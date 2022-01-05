import { Selection } from 'd3-selection';
import { layouter } from './layouter';
import { menuDropdownRender } from './menu-dropdown';
import { resizeEventListener } from './resize-event-dispatcher';

export function chartWindowRender(selection: Selection<HTMLDivElement>): void {
  selection.classed('chart-window', true);

  selection
    .selectAll<HTMLDivElement, any>('.toolbar')
    .data([null])
    .join('div')
    .call((s) => toolbarRender(s));

  selection
    .selectAll<HTMLDivElement, any>('.layouter')
    .data([null])
    .join('div')
    .call((s) => layouter(s));

  resizeEventListener(selection);
}

export function toolbarRender(selection: Selection<HTMLDivElement>): void {
  selection.classed('toolbar', true);

  selection
    .selectAll<HTMLDivElement, any>('.menu-tools')
    .data([null])
    .join('div')
    .call((s) => menuToolsRender(s));
}

export function menuToolsRender(selection: Selection<HTMLDivElement>): void {
  selection.call((s) => menuDropdownRender(s)).classed('menu-tools', true);

  selection.selectChildren('.chevron').remove();
  selection.selectChildren('.text').text('☰');
}
