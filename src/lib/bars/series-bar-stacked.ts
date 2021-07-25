import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import {
  arrayIs,
  arrayIs2D,
  COLORS_CATEGORICAL,
  DataSeriesGenerator,
  Rect,
  rectFitStroke,
} from '../core';
import { Size } from '../core/utils';
import { DataBar, JoinEvent, seriesBar } from './series-bar';
import { DataSeriesBarGrouped } from './series-bar-grouped';

export interface DataBarStacked extends DataBar {
  stackIndex: number;
}

export interface DataSeriesBarStacked extends DataSeriesGenerator<DataBarStacked> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
  colors: string | string[] | string[][];
  strokeWidth: number | number[] | number[][];
  stroke: string | string[] | string[][];
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
    colors: data.colors || COLORS_CATEGORICAL,
    strokeWidth: data.strokeWidth || 1,
    stroke: data.stroke || '#000',
    flipped: data.flipped || false,
    keys: data.keys,
    dataGenerator: data.dataGenerator || dataBarStackedGenerator,
  };
}

export function dataBarStackedGenerator(
  selection: Selection<Element, DataSeriesBarStacked>
): DataBarStacked[] {
  const {
      categories,
      categoryScale,
      values,
      valueScale,
      flipped,
      colors,
      stroke,
      strokeWidth,
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

  const data: DataBarStacked[] = [];
  for (let i = 0; i < categories.length; ++i) {
    const subcategoryValues = values[i];
    let nextStart = valueScale(0);
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = categories[i],
        v = subcategoryValues[j],
        sw = arrayIs2D(strokeWidth)
          ? strokeWidth[i][j]
          : arrayIs(strokeWidth)
          ? strokeWidth[j]
          : strokeWidth,
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
        bar: DataBarStacked = {
          stackIndex: i,
          index: j,
          key: keys?.[i][j] || `${i}/${j}`,
          color: arrayIs2D(colors) ? colors[i][j] : arrayIs(colors) ? colors[j] : colors,
          strokeWidth: sw,
          stroke: arrayIs2D(stroke) ? stroke[i][j] : arrayIs(stroke) ? stroke[j] : stroke,
          ...rect,
        };

      nextStart = flipped ? rect.x + rect.width - sw : rect.y+ sw;
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
  return seriesBar(selection)
    .classed('series-bar-stacked', true)
    .on('barenter', (e: JoinEvent<SVGRectElement, DataBarStacked>) =>
      e.detail.selection.attr('fill', (d) => COLORS_CATEGORICAL[d.index])
    );
}
