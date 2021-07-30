import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import {
  arrayIs,
  arrayIs2D,
  COLORS_CATEGORICAL,
  debug,
  findByDataProperty,
  nodeToString,
  Rect,
  rectFitStroke,
} from '../core';
import { Size } from '../core/utils';
import { filterBrightness } from '../filters';
import { barHighlight, Bar, JoinEvent, seriesBar, seriesBarJoin } from './series-bar';

export interface BarGrouped extends Bar {
  subcategory: string;
}

export interface SeriesBarGrouped {
  categories: any[];
  categoryScale: ScaleBand<any>;
  subcategories: string[];
  subcategoryPadding: number;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  colors: string | string[] | string[][];
  strokeWidths: number | number[] | number[][];
  strokes: string | string[] | string[][];
  keys?: string[][];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarGroupedData(data: Partial<SeriesBarGrouped>): SeriesBarGrouped {
  return {
    categories: data.categories || [],
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
    subcategories: data.subcategories || [],
    colors: data.colors || COLORS_CATEGORICAL,
    strokeWidths: data.strokeWidths || 1,
    strokes: data.strokes || '#000',
    flipped: data.flipped || false,
    subcategoryPadding: data.subcategoryPadding || 0.1,
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
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
    colors,
    subcategoryPadding,
    keys,
    strokeWidths,
    strokes,
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
        sw = arrayIs2D(strokeWidths)
          ? strokeWidths[i][j]
          : arrayIs(strokeWidths)
          ? strokeWidths[j]
          : strokeWidths,
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
          key: keys?.[i][j] || `${i}/${j}`,
          color: arrayIs2D(colors) ? colors[i][j] : arrayIs(colors) ? colors[j] : colors,
          strokeWidth: sw,
          stroke: arrayIs2D(strokes) ? strokes[i][j] : arrayIs(strokes) ? strokes[j] : strokes,
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
    .call((s) =>
      s
        .append('defs')
        .append('filter')
        .call((s) => filterBrightness(s, 1.3))
    )
    .on(
      'render.seriesbargrouped-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.seriesbar', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.seriesbargrouped', function (e, d) {
      debug(`render grouped bar series on ${nodeToString(this)}`);
      const series = select<Element, SeriesBarGrouped>(this);
      d.bounds = series.bounds()!;
      series
        .selectAll<SVGRectElement, BarGrouped>('rect')
        .data(seriesBarGroupedCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(series, s));
    })
    .on('mouseover.seriesbargroupedhighlight mouseout.seriesbargroupedhighlight', (e) =>
      barGroupedHighlight(select(e.target), e.type.endsWith('over'))
    );
}

export const barGroupedHighlight = barHighlight;

export function barGroupedFindBySubcategory(
  container: Selection,
  subcategory: string
): Selection<SVGRectElement, BarGrouped> {
  return findByDataProperty<SVGRectElement, BarGrouped>(
    container,
    '.bar',
    'subcategory',
    subcategory
  );
}
