import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import {
  arrayIs,
  arrayIs2D,
  COLORS_CATEGORICAL,
  DataSeriesGenerator,
  findByDataProperty,
  Rect,
  rectFitStroke,
} from '../core';
import { Size } from '../core/utils';
import { DataBar, JoinEvent, seriesBar } from './series-bar';
import {
  barGroupedFindBySubcategory,
  DataBarGrouped,
  DataSeriesBarGrouped,
} from './series-bar-grouped';

export interface DataSeriesBarStacked extends DataSeriesGenerator<DataBarGrouped> {
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
}

export function dataSeriesBarStacked(data: Partial<DataSeriesBarStacked>): DataSeriesBarStacked {
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
    dataGenerator: data.dataGenerator || dataBarStackedGenerator,
  };
}

export function dataBarStackedGenerator(
  selection: Selection<Element, DataSeriesBarStacked>
): DataBarGrouped[] {
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
    } = selection.datum(),
    bounds = selection.bounds()!;
  if (!flipped) {
    categoryScale.range([0, bounds.width]);
    valueScale.range([bounds.height, 0]);
  } else {
    categoryScale.range([0, bounds.height]);
    valueScale.range([0, bounds.width]);
  }

  const data: DataBarGrouped[] = [];
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
        bar: DataBarGrouped = {
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

export function seriesBarStacked<
  GElement extends Element,
  Datum extends DataSeriesBarStacked,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return seriesBar(selection).classed('series-bar-stacked', true);
}

export const barStackedFindBySubcategory = barGroupedFindBySubcategory;
