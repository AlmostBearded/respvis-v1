import { Selection } from 'd3-selection';

export function menuDropdown(selection: Selection<HTMLElement>): void {
  selection.classed('menu', true);

  // chevron & text
  selection.append('span').text('❮').classed('chevron', true);
  selection.append('span').classed('text', true);

  // items
  selection.append('ul').classed('items', true);
}
