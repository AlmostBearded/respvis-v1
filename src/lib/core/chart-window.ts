import { Selection } from 'd3-selection';
import { layouter, layouterData } from './layouter';
import { menuDropdown } from './menu-dropdown';
import { resizeEventListener } from './resize-event-dispatcher';

export function chartWindow(selection: Selection<HTMLDivElement>): void {
  selection.classed('chart-window', true);
  selection.append('div').call((s) => toolbar(s));
  selection
    .append('div')
    .datum((_, i, g) => layouterData(g[i]))
    .call((s) => layouter(s));

  resizeEventListener(selection);
}

export function toolbar(selection: Selection<HTMLDivElement>): void {
  selection.classed('toolbar', true);
  menuTools(selection.append('div'));
}

export function menuTools(selection: Selection<HTMLDivElement>): void {
  selection.call((s) => menuDropdown(s)).classed('menu-tools', true);

  selection.selectAll('.chevron').remove();
  selection.selectAll('.text').text('☰');
}
