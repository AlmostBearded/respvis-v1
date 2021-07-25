import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection, ValueFn } from 'd3-selection';
import {
  arrayIs,
  arrayIs2D,
  COLORS_CATEGORICAL,
  DataSeriesGenerator,
  findByDataProperty,
  Rect,
  rectFitStroke,
} from '../core';
import { DataBar, JoinEvent, seriesBar } from './series-bar';

export interface DataBarGrouped extends DataBar {
  groupIndex: number;
}

export interface DataSeriesBarGrouped extends DataSeriesGenerator<DataBarGrouped> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  subcategoryPadding: number;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  colors: string | string[] | string[][];
  strokeWidth: number | number[] | number[][];
  stroke: string | string[] | string[][];
  keys?: string[][];
  flipped: boolean;
}

export function dataSeriesBarGrouped(data: Partial<DataSeriesBarGrouped>): DataSeriesBarGrouped {
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
    colors: data.colors || COLORS_CATEGORICAL,
    strokeWidth: data.strokeWidth || 1,
    stroke: data.stroke || '#000',
    flipped: data.flipped || false,
    subcategoryPadding: data.subcategoryPadding || 0.1,
    dataGenerator: data.dataGenerator || dataBarGroupedGenerator,
    keys: data.keys,
  };
}

export function dataBarGroupedGenerator(
  selection: Selection<Element, DataSeriesBarGrouped>
): DataBarGrouped[] {
  const {
      categories,
      categoryScale,
      values,
      valueScale,
      flipped,
      colors,
      subcategoryPadding,
      keys,
      strokeWidth,
      stroke,
    } = selection.datum(),
    bounds = selection.bounds()!;
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

  const data: DataBarGrouped[] = [];
  for (let i = 0; i < values.length; ++i) {
    const subcategoryValues = values[i];
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = categories[i],
        v = subcategoryValues[j],
        sw = arrayIs2D(strokeWidth)
          ? strokeWidth[i][j]
          : arrayIs(strokeWidth)
          ? strokeWidth[j]
          : strokeWidth,
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
        bar: DataBarGrouped = {
          groupIndex: i,
          index: j,
          key: keys?.[i][j] || `${i}/${j}`,
          color: arrayIs2D(colors) ? colors[i][j] : arrayIs(colors) ? colors[j] : colors,
          strokeWidth: sw,
          stroke: arrayIs2D(stroke) ? stroke[i][j] : arrayIs(stroke) ? stroke[j] : stroke,
          ...(flipped ? flippedRect : rect),
        };
      data.push(bar);
    }
  }
  return data;
}

export function seriesBarGrouped<
  GElement extends Element,
  Datum extends DataSeriesBarGrouped,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return seriesBar(selection)
    .classed('series-bar-grouped', true)
    .on('barenter.seriesbargrouped', (e: JoinEvent<SVGRectElement, DataBarGrouped>) =>
      e.detail.selection.attr('fill', (d) => COLORS_CATEGORICAL[d.index])
    );
}

export function barGroupedFindByGroupIndex(
  container: Selection,
  index: number
): Selection<SVGRectElement, DataBarGrouped> {
  return findByDataProperty<SVGRectElement, DataBarGrouped>(container, '.bar', 'groupIndex', index);
}
