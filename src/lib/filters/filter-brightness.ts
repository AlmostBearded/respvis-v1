import { Selection } from 'd3-selection';
import { uuid } from '../core';

export function filterBrightness(selection: Selection<SVGFilterElement>, brightness: number): void {
  selection
    .classed('filter-brightness', true)
    .attr('id', uuid())
    .append('feComponentTransfer')
    .call((s) =>
      ['R', 'G', 'B'].map((v) =>
        s.append(`feFunc${v}`).attr('type', 'linear').attr('slope', brightness)
      )
    );
}
