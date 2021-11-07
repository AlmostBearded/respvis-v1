import { ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { findByDataProperty, rectJoin, RectData } from '../core';
import {
  TooltipPositionConfig,
  tooltipContent,
  tooltipShow,
  tooltipHide,
  tooltipPosition,
} from '../tooltip';
import { scaleBand } from 'd3-scale';

export interface JoinEvent<GElement extends Element, Datum>
  extends CustomEvent<{ selection: Selection<GElement, Datum> }> {}

export interface JoinDecorator<Element extends BaseType, Data> {
  enter?: (selection: Selection<Element, Data>) => void;
  update?: (selection: Selection<Element, Data>) => void;
  exit?: (selection: Selection<Element, Data>) => void;
  merge?: (selection: Selection<Element, Data>) => void;
}

export interface SeriesBarData {
  key?: string;
  categories: string[];
  values: number[];
  flipped: boolean;
  categoryScale: ScaleBand<string>;
  valueScale: ScaleContinuousNumeric<number, number>;
  categoryIndices: number[];
  tooltipsEnabled: boolean;
  tooltip: (element: SVGRectElement, data: BarData) => string | Element;
  tooltipPosition: (
    element: SVGRectElement,
    data: BarData,
    evnt: MouseEvent
  ) => TooltipPositionConfig;
  joinDecorator: JoinDecorator<SVGRectElement, BarData>;
}

export function seriesBarData(data: Partial<SeriesBarData>): SeriesBarData {
  const key = data.key;
  const categories = data.categories ?? (data.values || []).map((v, i) => `Category ${i + 1}`);
  const values = data.values ?? (data.categories || []).map(() => 0);
  const categoryIndices = data.categoryIndices ?? categories.map((c, i) => i);
  const flipped = data.flipped ?? false;
  const categoryScale = data.categoryScale ?? scaleBand().domain(categories).padding(0.1);
  const valueScale =
    data.valueScale ??
    scaleLinear()
      .range([0, Math.max(...values)])
      .nice();
  const tooltipsEnabled = data.tooltipsEnabled ?? true;
  const tooltip = data.tooltip ?? ((e, d) => `Category: ${d.category}<br/>Value: ${d.value}`);
  const tooltipPosition =
    data.tooltipPosition ??
    ((element, data, evnt) => ({ position: { x: evnt.clientX, y: evnt.clientY } }));
  const joinDecorator = data.joinDecorator ?? {};
  return {
    key,
    categories,
    values,
    categoryIndices,
    flipped,
    categoryScale,
    valueScale,
    tooltipsEnabled,
    tooltip,
    tooltipPosition,
    joinDecorator,
  };
}

function seriesBarToBars({
  categories,
  categoryScale,
  values,
  valueScale,
  categoryIndices,
  flipped,
}: SeriesBarData): BarData[] {
  const bars: BarData[] = [];

  for (let i = 0; i < categories.length; ++i) {
    const c = categories[i];
    const ci = categoryIndices[i];
    const v = values[i];
    const bar: BarData = {
      category: c,
      value: v,
      categoryIndex: ci,
      key: c,
      ...(flipped
        ? {
            x: Math.min(valueScale(0)!, valueScale(v)!),
            y: categoryScale(c)!,
            width: Math.abs(valueScale(0)! - valueScale(v)!),
            height: categoryScale.bandwidth(),
          }
        : {
            x: categoryScale(c)!,
            y: Math.min(valueScale(0)!, valueScale(v)!),
            width: categoryScale.bandwidth(),
            height: Math.abs(valueScale(0)! - valueScale(v)!),
          }),
    };
    bars.push(bar);
  }
  return bars;
}

export function seriesBarEnter(selection: Selection<SVGElement, SeriesBarData>): void {
  selection
    .classed('series-bar', true)
    .attr('ignore-layout-children', true)
    .on('mouseover.highlight mouseout.highlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .on('mouseover.tooltip', (e, d) => {
      const { tooltip, tooltipsEnabled } = d;
      const item = <SVGRectElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<SVGRectElement, BarData>(item).datum();
      tooltipShow(null);
      tooltipContent(null, tooltip(item, data));
    })
    .on('mousemove.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled, tooltipPosition: position } = d;
      const item = <SVGRectElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<SVGRectElement, BarData>(item).datum();
      tooltipPosition(null, position(item, data, e));
    })
    .on('mouseout.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled } = d;
      if (tooltipsEnabled) tooltipHide(null);
    });
  // todo: fade in or animate somehow else
}

export function seriesBarUpdate(selection: Selection<SVGElement, SeriesBarData>): void {
  selection.each(function (d) {
    const s = select(this);
    const bounds = selection.bounds()!;
    if (!d.flipped) {
      d.categoryScale.range([0, bounds.width]);
      d.valueScale.range([bounds.height, 0]);
    } else {
      d.categoryScale.range([0, bounds.height]);
      d.valueScale.range([0, bounds.width]);
    }

    s.selectAll<SVGRectElement, BarData>('.bar')
      .data(seriesBarToBars(d), (d) => d.key)
      .call((s) => barJoin(s, d.joinDecorator));
  });
}

export function seriesBarExit(selection: Selection<SVGElement, SeriesBarData>): void {
  selection.classed('exiting', true).remove();
  // todo: fade out or animate somehow else
}

export function seriesBarJoin(
  selection: Selection<SVGElement, SeriesBarData>,
  joinDecorator?: JoinDecorator<SVGElement, SeriesBarData>
): void {
  selection
    .join(
      (enter) =>
        enter
          .append('g')
          .call((s) => seriesBarEnter(s))
          .call((s) => joinDecorator?.enter?.(s)),
      (update) => update.call((s) => seriesBarUpdate(s)).call((s) => joinDecorator?.update?.(s)),
      (exit) => exit.call((s) => seriesBarExit(s)).call((s) => joinDecorator?.exit?.(s))
    )
    .call((s) => joinDecorator?.merge?.(s));
}

export interface BarData extends RectData {
  category: string;
  categoryIndex: number;
  value: number;
}

export type BarSelection = Selection<SVGRectElement, BarData>;

export function barJoin(
  selection: Selection<SVGRectElement, BarData>,
  joinDecorator?: JoinDecorator<SVGRectElement, BarData>
): void {
  rectJoin(selection, {
    enter: (s) => s.classed('bar', true).call((s) => joinDecorator?.enter?.(s)),
    update: (s) => joinDecorator?.update?.(s),
    exit: (s) => joinDecorator?.update?.(s),
    merge: (s) =>
      s
        .attr('category-index', (d) => d.categoryIndex)
        .attr('category', (d) => d.category)
        .call((s) => joinDecorator?.merge?.(s)),
  });
}

export function barFind<Data extends BarData>(
  container: Selection,
  category: string
): Selection<SVGRectElement, Data> {
  return findByDataProperty<SVGRectElement, Data>(container, '.bar', 'category', category);
}
