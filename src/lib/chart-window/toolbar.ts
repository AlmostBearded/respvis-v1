import { Selection } from 'd3-selection';
import { menuTools } from './menu-tools';

export function toolbar(selection: Selection<HTMLDivElement>): void {
  selection
    .classed('toolbar', true)
    .style('display', 'flex')
    .style('flex-direction', 'row')
    .style('justify-content', 'flex-end');

  menuTools(selection.append('div'));
}
