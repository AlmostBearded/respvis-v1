import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, DataSeriesGenerator } from '../core';
import { Size } from '../core/utils';
import { DataBar, JoinEvent, seriesBar } from './series-bar';
import { DataSeriesBarGrouped } from './series-bar-grouped';

export interface DataBarStacked extends DataBar {
  stackIndex: number;
}

export interface DataSeriesBarStacked extends DataSeriesGenerator<DataBarStacked> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  innerPadding: number;
  values: number[][];
  valueScale: ScaleContinuousNumeric<number, number>;
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
    flipped: data.flipped || false,
    innerPadding: data.innerPadding || 0.1,
    keys: data.keys,
    dataGenerator: data.dataGenerator || dataBarStackedGenerator,
  };
}

export function dataBarStackedGenerator(
  selection: Selection<Element, DataSeriesBarStacked>
): DataBarStacked[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  if (!seriesDatum.flipped) {
    seriesDatum.categoryScale.range([0, bounds.width]);
    seriesDatum.valueScale.range([bounds.height, 0]);
  } else {
    seriesDatum.categoryScale.range([0, bounds.height]);
    seriesDatum.valueScale.range([0, bounds.width]);
  }

  const data: DataBarStacked[] = [];
  for (let i = 0; i < seriesDatum.categories.length; ++i) {
    const subcategoryValues = seriesDatum.values[i];
    let sum = 0;
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = seriesDatum.categories[i];
      const v = subcategoryValues[j];

      if (!seriesDatum.flipped) {
        data.push({
          stackIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: seriesDatum.categoryScale(c)!,
          y: -sum + Math.min(seriesDatum.valueScale(0)!, seriesDatum.valueScale(v)!),
          width: seriesDatum.categoryScale.bandwidth(),
          height: Math.abs(seriesDatum.valueScale(0)! - seriesDatum.valueScale(v)!),
        });
        sum += data[data.length - 1].height;
      } else {
        data.push({
          stackIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: sum + Math.min(seriesDatum.valueScale(0)!, seriesDatum.valueScale(v)!),
          y: seriesDatum.categoryScale(c)!,
          width: Math.abs(seriesDatum.valueScale(0)! - seriesDatum.valueScale(v)!),
          height: seriesDatum.categoryScale.bandwidth(),
        });
        sum += data[data.length - 1].width;
      }
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
    .attr('fill', null)
    .on('barenter', (e: JoinEvent<SVGRectElement, DataBarStacked>) =>
      e.detail.selection.attr('fill', (d) => COLORS_CATEGORICAL[d.index])
    );
}
