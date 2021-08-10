import { Selection } from 'd3-selection';
import { menuTools } from './menu-tools';

export function toolbar(selection: Selection<HTMLDivElement>): void {
  selection.classed('toolbar', true);
  menuTools(selection.append('div'));
}
