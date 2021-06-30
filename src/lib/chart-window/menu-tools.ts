import { Selection } from 'd3-selection';
import { menuDropdown } from './menu-dropdown';

export function menuTools(selection: Selection<HTMLDivElement>): void {
  selection
    .call((s) => menuDropdown(s))
    .classed('menu-tools', true)
    .style('z-index', 10)
    .style('cursor', 'default');

  selection.selectAll('.chevron').remove();
  selection.selectAll('.text').style('font-size', '1.25rem').text('☰');

  selection.selectChildren('.items').style('right', '0').style('top', '100%');
}
