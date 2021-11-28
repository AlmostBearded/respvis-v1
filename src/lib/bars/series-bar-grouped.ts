import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import { JoinEvent } from '.';
import { arrayIs, arrayIs2D, debug, nodeToString, Rect } from '../core';
import { Size } from '../core/utility/size';
import {
  SeriesConfigTooltips,
  seriesConfigTooltipsData,
  seriesConfigTooltipsHandleEvents,
} from '../tooltip';
import { Bar, seriesBarJoin } from './series-bar';

export interface BarGrouped extends Bar {
  subcategory: string;
}

export interface SeriesBarGrouped extends SeriesConfigTooltips<SVGRectElement, BarGrouped> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  subcategories: string[];
  subcategoryPadding: number;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  styleClasses: string | string[] | string[];
  keys?: string[][];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarGroupedData(data: Partial<SeriesBarGrouped>): SeriesBarGrouped {
  const categories = data.categories || [];
  const subcategories = data.subcategories || [];
  return {
    categories,
    categoryScale:
      data.categoryScale ||
      scaleBand()
        .domain(data.categories || [])
        .padding(0.1),
    values: data.values || [],
    valueScale:
      data.valueScale ||
      scaleLinear()
        .domain([0, Math.max(...(data.values?.map((values) => Math.max(...values)) || []))])
        .nice(),
    subcategories,
    flipped: data.flipped || false,
    subcategoryPadding: data.subcategoryPadding || 0.1,
    styleClasses: data.styleClasses || subcategories.map((c, i) => `categorical-${i}`),
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
    ...seriesConfigTooltipsData<SVGRectElement, BarGrouped>(data),
    tooltipsEnabled: data.tooltipsEnabled || true,
    tooltips:
      data.tooltips ||
      ((element, data) =>
        `Category: ${data.category}<br/>Subcategory: ${data.subcategory}<br/>Value: ${data.value}`),
  };
}

export function seriesBarGroupedCreateBars(seriesData: SeriesBarGrouped): BarGrouped[] {
  const {
    categories,
    categoryScale,
    values,
    valueScale,
    subcategories,
    flipped,
    subcategoryPadding,
    styleClasses,
    keys,
    bounds,
  } = seriesData;
  if (!flipped) {
    categoryScale.range([0, bounds.width]);
    valueScale.range([bounds.height, 0]);
  } else {
    categoryScale.range([0, bounds.height]);
    valueScale.range([0, bounds.width]);
  }

  const innerScale = scaleBand<number>()
    .domain(range(values[0]?.length || 0))
    .range([0, categoryScale.bandwidth()])
    .padding(subcategoryPadding);

  const data: BarGrouped[] = [];
  for (let i = 0; i < values.length; ++i) {
    const subcategoryValues = values[i];
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = categories[i],
        v = subcategoryValues[j],
        rect: Rect = {
          x: categoryScale(c)! + innerScale(j)!,
          y: Math.min(valueScale(0)!, valueScale(v)!),
          width: innerScale.bandwidth(),
          height: Math.abs(valueScale(0)! - valueScale(v)!),
        },
        flippedRect: Rect = {
          x: Math.min(valueScale(0)!, valueScale(v)!),
          y: categoryScale(c)! + innerScale(j)!,
          width: Math.abs(valueScale(0)! - valueScale(v)!),
          height: innerScale.bandwidth(),
        },
        bar: BarGrouped = {
          category: c,
          subcategory: subcategories[j],
          value: v,
          styleClass: arrayIs2D(styleClasses)
            ? styleClasses[i][j]
            : arrayIs(styleClasses)
            ? styleClasses[j]
            : styleClasses,
          key: keys?.[i][j] || `${i}/${j}`,
          ...(flipped ? flippedRect : rect),
        };
      data.push(bar);
    }
  }
  return data;
}

export function seriesBarGrouped(selection: Selection<Element, SeriesBarGrouped>): void {
  selection
    .classed('series-bar', true)
    .classed('series-bar-grouped', true)
    .attr('data-ignore-layout-children', true)
    .on('update.subcategory', (e: JoinEvent<Element, BarGrouped>) =>
      e.detail.selection.attr('data-subcategory', (d) => d.subcategory)
    )
    .each((d, i, g) => {
      const seriesS = select<Element, SeriesBarGrouped>(g[i]);
      const bounds = seriesS.bounds();
      if (!bounds) return;
      d.bounds = bounds;
      seriesS
        .selectAll<SVGRectElement, BarGrouped>('rect')
        .data(seriesBarGroupedCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(seriesS, s));
    })
    .on('mouseover.seriesbargroupedhighlight mouseout.seriesbargroupedhighlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .call((s) => seriesConfigTooltipsHandleEvents(s));
}
