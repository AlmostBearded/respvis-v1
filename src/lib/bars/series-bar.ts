import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, debug, nodeToString } from '../core';
import { Rect, rectMinimized, rectToAttrs } from '../core/utility/rect';
import { dataSeries, DataSeries } from '../core/series';
import { Size } from '../core/utils';
import { Transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';

export enum Orientation {
  Vertical,
  Horizontal,
}

export interface DataBar extends Rect {
  index: number;
  key: string;
}

export interface DataSeriesBarCustom extends DataSeries<DataBar> {}

export function dataSeriesBarCustom(data?: Partial<DataSeriesBarCustom>): DataSeriesBarCustom {
  return dataSeries({
    data: data?.data,
    key: data?.key || ((d, i) => d.key),
  });
}

export interface DataBarsCreation {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: number[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  orientation: Orientation;
}

export interface DataSeriesBar extends DataSeriesBarCustom {
  creation: DataBarsCreation;
}

export function dataBarsCreation(data?: Partial<DataBarsCreation>): DataBarsCreation {
  return {
    mainValues: data?.mainValues || [],
    mainScale:
      data?.mainScale ||
      scaleBand()
        .domain(data?.mainValues || [])
        .padding(0.1),
    crossValues: data?.crossValues || [],
    crossScale:
      data?.crossScale ||
      scaleLinear()
        .domain([0, Math.max(...(data?.crossValues || []))])
        .nice(),
    orientation: data?.orientation || Orientation.Vertical,
  };
}

export function dataSeriesBar(creationData: DataBarsCreation): DataSeriesBar {
  const seriesData: DataSeriesBar = {
    ...dataSeriesBarCustom({ data: (s) => dataBars(seriesData.creation, s.bounds()!) }),
    creation: creationData,
  };
  return seriesData;
}

export function dataBars(creationData: DataBarsCreation, bounds: Size): DataBar[] {
  if (creationData.orientation === Orientation.Vertical) {
    creationData.mainScale.range([0, bounds.width]);
    creationData.crossScale.range([bounds.height, 0]);
  } else if (creationData.orientation === Orientation.Horizontal) {
    creationData.mainScale.range([0, bounds.height]);
    creationData.crossScale.range([0, bounds.width]);
  }

  const data: DataBar[] = [];

  for (let i = 0; i < creationData.crossValues.length; ++i) {
    const mv = creationData.mainValues[i];
    const cv = creationData.crossValues[i];

    if (creationData.orientation === Orientation.Vertical) {
      data.push({
        index: i,
        key: creationData.keys?.[i] || i.toString(),
        x: creationData.mainScale(mv)!,
        y: Math.min(creationData.crossScale(0)!, creationData.crossScale(cv)!),
        width: creationData.mainScale.bandwidth(),
        height: Math.abs(creationData.crossScale(0)! - creationData.crossScale(cv)!),
      });
    } else if (creationData.orientation === Orientation.Horizontal) {
      data.push({
        index: i,
        key: creationData.keys?.[i] || i.toString(),
        x: Math.min(creationData.crossScale(0)!, creationData.crossScale(cv)!),
        y: creationData.mainScale(mv)!,
        width: Math.abs(creationData.crossScale(0)! - creationData.crossScale(cv)!),
        height: creationData.mainScale.bandwidth(),
      });
    }
  }
  return data;
}

export function seriesBar<
  GElement extends Element,
  Datum extends DataSeriesBarCustom,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('series-bar', true)
    .attr('fill', COLORS_CATEGORICAL[0])
    .on(
      'render.seriesbar-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.seriesbar', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.seriesbar', function (e, d) {
      seriesBarRender(select<GElement, DataSeriesBarCustom>(this));
    });
}

export interface JoinEvent<GElement extends Element, Datum>
  extends CustomEvent<{ selection: Selection<GElement, Datum> }> {}

export interface JoinTransitionEvent<GElement extends Element, Datum>
  extends CustomEvent<{ transition: Transition<GElement, Datum> }> {}

export function seriesBarRender<
  GElement extends Element,
  Datum extends DataSeriesBarCustom,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    debug(`render bar series on ${nodeToString(g[i])}`);
    const series = select(g[i]);
    series
      .selectAll<SVGRectElement, DataBar>('rect')
      .data(d.data instanceof Function ? d.data(series) : d.data, d.key)
      .join(
        (enter) =>
          enter
            .append('rect')
            .classed('bar', true)
            .call((s) => rectToAttrs(s, (d) => rectMinimized(d)))
            .call((s) => selection.dispatch('barenter', { detail: { selection: s } })),
        undefined,
        (exit) =>
          exit
            .classed('exiting', true)
            .call((s) =>
              s
                .transition('minimize')
                .duration(250)
                .call((t) => rectToAttrs(t, (d) => rectMinimized(d)))
                .remove()
            )
            .call((s) => selection.dispatch('barexit', { detail: { selection: s } }))
      )
      .call((s) =>
        s
          .transition('position')
          .duration(250)
          .ease(easeCubicOut)
          .call((t) => rectToAttrs(t, (d) => d))
      )
      .call((s) => selection.dispatch('barupdate', { detail: { selection: s } }));
  });
}
