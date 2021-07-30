import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
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
import {
  barGroupedFindBySubcategory,
  BarGrouped,
  SeriesBarGrouped,
} from './series-bar-grouped';

export interface SeriesBarStacked {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  subcategories: string[];
  colors: string | string[] | string[][];
  strokeWidths: number | number[] | number[][];
  strokes: string | string[] | string[][];
  keys?: string[][];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarStackedData(data: Partial<SeriesBarStacked>): SeriesBarStacked {
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
        .domain([
          0,
          Math.max(...(data.values?.map((values) => values.reduce((a, b) => a + b)) || [])),
        ])
        .nice(),
    subcategories: data.subcategories || [],
    colors: data.colors || COLORS_CATEGORICAL,
    strokeWidths: data.strokeWidths || 1,
    strokes: data.strokes || '#000',
    flipped: data.flipped || false,
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
  };
}

export function seriesBarStackedCreateBars(seriesData: SeriesBarStacked): BarGrouped[] {
  const {
    categories,
    categoryScale,
    values,
    valueScale,
    subcategories,
    flipped,
    colors,
    strokes,
    strokeWidths,
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

  const data: BarGrouped[] = [];
  for (let i = 0; i < categories.length; ++i) {
    const subcategoryValues = values[i];
    let nextStart = valueScale(0);
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = categories[i],
        sc = subcategories[j],
        v = subcategoryValues[j],
        sw = arrayIs2D(strokeWidths)
          ? strokeWidths[i][j]
          : arrayIs(strokeWidths)
          ? strokeWidths[j]
          : strokeWidths,
        unflippedRect: Rect = {
          x: categoryScale(c)!,
          y: nextStart - Math.abs(valueScale(0)! - valueScale(v)!),
          width: categoryScale.bandwidth(),
          height: Math.abs(valueScale(0)! - valueScale(v)!) + (j > 0 ? sw : 0),
        },
        flippedRect: Rect = {
          x: nextStart,
          y: categoryScale(c)!,
          width: Math.abs(valueScale(0)! - valueScale(v)!) + (j > 0 ? sw : 0),
          height: categoryScale.bandwidth(),
        },
        rect = flipped ? flippedRect : unflippedRect,
        bar: BarGrouped = {
          category: c,
          subcategory: sc,
          value: v,
          key: keys?.[i][j] || `${c}/${sc}`,
          color: arrayIs2D(colors) ? colors[i][j] : arrayIs(colors) ? colors[j] : colors,
          strokeWidth: sw,
          stroke: arrayIs2D(strokes) ? strokes[i][j] : arrayIs(strokes) ? strokes[j] : strokes,
          ...rect,
        };

      nextStart = flipped ? rect.x + rect.width - sw : rect.y + sw;
      data.push(bar);
    }
  }
  return data;
}

export function seriesBarStacked(selection: Selection<Element, SeriesBarStacked>): void {
  selection
    .classed('series-bar', true)
    .classed('series-bar-stacked', true)
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
        .data(seriesBarStackedCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(series, s));
    })
    .on('mouseover.seriesbargroupedhighlight mouseout.seriesbargroupedhighlight', (e) =>
      barStackedHighlight(select(e.target), e.type.endsWith('over'))
    );
}

export const barStackedHighlight = barHighlight;

export const barStackedFindBySubcategory = barGroupedFindBySubcategory;
