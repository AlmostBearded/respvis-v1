import { Selection } from 'd3-selection';
import { menuDropdownRender } from './menu-dropdown';

export function menuToolsRender(selection: Selection<HTMLDivElement>): void {
  selection.call((s) => menuDropdownRender(s)).classed('menu-tools', true);

  selection.selectAll('.chevron').remove();
  selection.selectAll('.text').text('☰');
}
