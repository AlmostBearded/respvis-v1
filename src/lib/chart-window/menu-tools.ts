import { Selection } from 'd3-selection';
import { menuDropdown } from './menu-dropdown';

export function menuTools(selection: Selection<HTMLDivElement>): void {
  selection.call((s) => menuDropdown(s)).classed('menu-tools', true);

  selection.selectAll('.chevron').remove();
  selection.selectAll('.text').text('☰');
}
