import { easeCubicOut } from 'd3-ease';
import { BaseType, select, Selection } from 'd3-selection';
import { debug, nodeToString, Position, positionToTransformAttr } from '../core';
import { dataSeries, DataSeries } from '../core/series';

export interface DataLabel extends Position {
  text: string | number;
  // todo: add index property?
  key?: string;
}

export interface DataSeriesLabel extends DataSeries<DataLabel> {}

export function dataSeriesLabel(data?: Partial<DataSeriesLabel>): DataSeriesLabel {
  return dataSeries({
    data: data?.data,
    key: data?.key || ((d, i) => d.key || i),
  });
}

export function seriesLabel<
  GElement extends Element,
  Datum extends DataSeriesLabel,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('series-label', true)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '0.8em')
    .on(
      'render.serieslabel-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.serieslabel', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.serieslabel', function (e, d) {
      seriesLabelRender(select<GElement, Datum>(this));
    });
}

export function seriesLabelRender<
  GElement extends Element,
  Datum extends DataSeriesLabel,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    debug(`render label series on ${nodeToString(g[i])}`);
    const series = select(g[i]);
    series
      .selectAll<SVGTextElement, DataLabel>('text')
      .data(d.data instanceof Function ? d.data(series) : d.data, d.key)
      .join(
        (enter) =>
          enter
            .append('text')
            .classed('label', true)
            .call((s) => positionToTransformAttr(s, (d) => d))
            .attr('font-size', '0em')
            .attr('opacity', 0)
            .call((s) =>
              s.transition('enter').duration(250).attr('font-size', '1em').attr('opacity', 1)
            )
            .call((s) => selection.dispatch('labelenter', { detail: { selection: s } })),
        undefined,
        (exit) =>
          exit
            .classed('exiting', true)
            .call((s) =>
              s
                .transition('exit')
                .duration(250)
                .attr('font-size', '0em')
                .attr('opacity', 0)
                .remove()
            )
            .call((s) => selection.dispatch('labelexit', { detail: { selection: s } }))
      )
      .call((s) =>
        s
          .transition('position')
          .duration(250)
          .ease(easeCubicOut)
          .call((t) => positionToTransformAttr(t, (d) => d))
      )
      .text((d) => d.text)
      .call((s) => selection.dispatch('labelupdate', { detail: { selection: s } }));
  });
}
