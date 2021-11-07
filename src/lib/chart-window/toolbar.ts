import { Selection } from 'd3-selection';
import { menuToolsRender } from './menu-tools';

export function toolbarRender(selection: Selection<HTMLDivElement>): void {
  selection.classed('toolbar', true);
  selection
    .selectAll<HTMLDivElement, null>('.menu-tools')
    .data([null])
    .join('div')
    .call((s) => menuToolsRender(s));
}
