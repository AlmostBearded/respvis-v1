import { ScaleBand, scaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { arrayIs, arrayIs2D, COLORS_CATEGORICAL, debug, nodeToString, Rect } from '../core';
import { Size } from '../core/utils';
import { filterBrightness } from '../filters';
import {
  SeriesConfigTooltips,
  seriesConfigTooltipsData,
  seriesConfigTooltipsHandleEvents,
} from '../tooltip';
import { barHighlight, seriesBarJoin } from './series-bar';
import { barGroupedFindBySubcategory, BarGrouped, SeriesBarGrouped } from './series-bar-grouped';

export interface SeriesBarStacked extends SeriesConfigTooltips<SVGRectElement, BarGrouped> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  subcategories: string[];
  categoryIndices?: number[];
  subcategoryIndices?: number[];
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
    flipped: data.flipped || false,
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
    ...seriesConfigTooltipsData(data),
    tooltipsEnabled: data.tooltipsEnabled || true,
    tooltips:
      data.tooltips ||
      ((element, data) =>
        `Category: ${data.category}<br/>Subcategory: ${data.subcategory}<br/>Value: ${data.value}`),
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
    categoryIndices,
    subcategoryIndices,
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
        unflippedRect: Rect = {
          x: categoryScale(c)!,
          y: nextStart - Math.abs(valueScale(0)! - valueScale(v)!),
          width: categoryScale.bandwidth(),
          height: Math.abs(valueScale(0)! - valueScale(v)!), //+ (j > 0 ? sw : 0),
        },
        flippedRect: Rect = {
          x: nextStart,
          y: categoryScale(c)!,
          width: Math.abs(valueScale(0)! - valueScale(v)!), // + (j > 0 ? sw : 0),
          height: categoryScale.bandwidth(),
        },
        rect = flipped ? flippedRect : unflippedRect,
        bar: BarGrouped = {
          category: c,
          subcategory: sc,
          value: v,
          key: keys?.[i][j] || `${c}/${sc}`,
          categoryIndex: categoryIndices === undefined ? i : categoryIndices[i],
          subcategoryIndex: subcategoryIndices === undefined ? j : subcategoryIndices[j],
          ...rect,
        };

      nextStart = flipped ? rect.x + rect.width /* - sw*/ : rect.y /* + sw*/;
      data.push(bar);
    }
  }
  return data;
}

export function seriesBarStacked(selection: Selection<Element, SeriesBarStacked>): void {
  selection
    .classed('series-bar', true)
    .classed('series-bar-stacked', true)
    .attr('ignore-layout-children', true)
    .on('datachange.seriesbar', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.seriesbargrouped', function (e, d) {
      const series = select<Element, SeriesBarGrouped>(this);
      const bounds = series.bounds();
      if (!bounds) return;
      debug(`render grouped bar series on ${nodeToString(this)}`);
      d.bounds = bounds;
      series
        .selectAll<SVGRectElement, BarGrouped>('rect')
        .data(seriesBarStackedCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(series, s))
        .attr('subcategory-index', (d) => d.subcategoryIndex);
    })
    .on('mouseover.seriesbargroupedhighlight mouseout.seriesbargroupedhighlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .call((s) => seriesConfigTooltipsHandleEvents(s));
}

export const barStackedFindBySubcategory = barGroupedFindBySubcategory;
