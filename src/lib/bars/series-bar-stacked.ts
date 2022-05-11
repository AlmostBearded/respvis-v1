import { ScaleBand, scaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3';
import { select, Selection } from 'd3';
import { JoinEvent } from '.';
import { arrayIs, arrayIs2D, Rect, rectFromString } from '../core';
import { Size } from '../core/utilities/size';
import {
  SeriesConfigTooltips,
  seriesConfigTooltipsData,
  seriesConfigTooltipsHandleEvents,
} from '../tooltip';
import { seriesBarJoin } from './series-bar';
import { BarGrouped, SeriesBarGrouped } from './series-bar-grouped';

export interface SeriesBarStacked extends SeriesConfigTooltips<SVGRectElement, BarGrouped> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  subcategories: string[];
  styleClasses: string | string[] | string[][];
  keys?: string[][];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarStackedData(data: Partial<SeriesBarStacked>): SeriesBarStacked {
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
        .domain([
          0,
          Math.max(...(data.values?.map((values) => values.reduce((a, b) => a + b)) || [])),
        ])
        .nice(),
    subcategories,
    styleClasses: data.styleClasses || subcategories.map((c, i) => `categorical-${i}`),
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
          styleClass: arrayIs2D(styleClasses)
            ? styleClasses[i][j]
            : arrayIs(styleClasses)
            ? styleClasses[j]
            : styleClasses,
          ...rect,
        };

      nextStart = flipped ? rect.x + rect.width /* - sw*/ : rect.y /* + sw*/;
      data.push(bar);
    }
  }
  return data;
}

export function seriesBarStackedRender(selection: Selection<Element, SeriesBarStacked>): void {
  selection
    .classed('series-bar', true)
    .classed('series-bar-stacked', true)
    .attr('data-ignore-layout-children', true)
    .on('update.subcategory', (e: JoinEvent<Element, BarGrouped>) =>
      e.detail.selection.attr('data-subcategory', (d) => d.subcategory)
    )
    .each((d, i, g) => {
      const seriesS = select<Element, SeriesBarGrouped>(g[i]);
      const boundsAttr = seriesS.attr('bounds');
      if (!boundsAttr) return;
      d.bounds = rectFromString(boundsAttr);
      seriesS
        .selectAll<SVGRectElement, BarGrouped>('rect')
        .data(seriesBarStackedCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(seriesS, s));
    })
    .on('pointerover.seriesbargroupedhighlight pointerout.seriesbargroupedhighlight', (e: PointerEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .call((s) => seriesConfigTooltipsHandleEvents(s));
}
