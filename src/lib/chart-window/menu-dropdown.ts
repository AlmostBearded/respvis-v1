import { Selection } from 'd3-selection';

export function menuDropdownRender(selection: Selection<HTMLElement>): void {
  selection.classed('menu', true);

  // chevron & text
  selection.selectAll('.chevron').data([null]).join('span').text('❮').classed('chevron', true);
  selection.selectAll('.text').data([null]).join('span').classed('text', true);

  // items
  selection.selectAll('.items').data([null]).join('ul').classed('items', true);
}
