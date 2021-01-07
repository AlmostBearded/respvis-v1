import { BaseType, select, Selection } from 'd3-selection';
import { utils, uuid } from '.';
import { IRect } from './rect';

export function createDropShadowFilter(
  selection: Selection<BaseType, any, BaseType, any>,
  filterRect: IRect<string>,
  offset: utils.IPosition,
  blurStdDeviation: number
): Selection<SVGFilterElement, any, BaseType, any> {
  const defsSelection = selection.selectAll('defs').data([null]).join('defs');

  let filterId = uuid.v4();
  return defsSelection
    .append('filter')
    .classed('drop-shadow', true)
    .attr('id', filterId)
    .attr('x', filterRect.x)
    .attr('y', filterRect.y)
    .attr('width', filterRect.width)
    .attr('height', filterRect.height)
    .call((filterSelection) =>
      filterSelection
        .append('feOffset')
        .attr('result', 'offOut')
        .attr('in', 'SourceAlpha')
        .attr('dx', offset.x)
        .attr('dy', offset.y)
    )
    .call((filterSelection) =>
      filterSelection
        .append('feGaussianBlur')
        .attr('result', 'blurOut')
        .attr('in', 'offOut')
        .attr('stdDeviation', blurStdDeviation)
    )
    .call((filterSelection) =>
      filterSelection
        .append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blurOut')
        .attr('mode', 'normal')
    );
}
