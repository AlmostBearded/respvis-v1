import { select, Selection } from 'd3-selection';

export function menuDropdown(selection: Selection<HTMLElement>): void {
  selection
    .classed('menu', true)
    .call((s) => menuDropdownItem(s))
    .style('position', 'relative')
    .style('display', 'flex')
    .style('flex-direction', 'row')
    .style('justify-content', 'space-between')
    .style('align-items', 'center')
    .on('mouseover.menu', (e) =>
      select(e.currentTarget)
        .selectChildren('.items')
        .style('filter', 'brightness(105%)')
        .style('display', 'block')
    )
    .on('mouseout.menu', (e) =>
      select(e.currentTarget)
        .selectChildren('.items')
        .style('filter', null)
        .style('display', 'none')
    );

  // chevron & text
  selection
    .append('span')
    .text('❮')
    .classed('chevron', true)
    .style('font-size', '0.7em')
    .style('margin-right', '0.5em');
  selection.append('span').classed('text', true);

  // items
  selection
    .append('ul')
    .classed('items', true)
    .style('list-style', 'none')
    .style('margin', '0')
    .style('padding', '0')
    .style('position', 'absolute')
    .style('top', '-1px')
    .style('right', '100%')
    .style('border', '1px solid rgb(118, 118, 118)')
    .style('display', 'none');
}

export function menuDropdownItem(selection: Selection<HTMLElement>): void {
  selection
    .style('white-space', 'nowrap')
    .style('padding', '0.5em')
    .style('background-color', 'rgb(239, 239, 239)')
    .on('mouseover.darken', (e) => select(e.currentTarget).style('filter', 'brightness(95%)'))
    .on('mouseout.darken', (e) => select(e.currentTarget).style('filter', null));
}
