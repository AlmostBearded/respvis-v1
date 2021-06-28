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
  mainValues: any[];
  mainScale: ScaleBand<any>;
  innerPadding: number;
  crossValues: number[][];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  flipped: boolean;
}

export function dataSeriesBarStacked(data: Partial<DataSeriesBarStacked>): DataSeriesBarStacked {
  return {
    mainValues: data.mainValues || [],
    mainScale:
      data.mainScale ||
      scaleBand()
        .domain(data.mainValues || [])
        .padding(0.1),
    crossValues: data.crossValues || [],
    crossScale:
      data.crossScale ||
      scaleLinear()
        .domain([
          0,
          Math.max(...(data.crossValues?.map((values) => values.reduce((a, b) => a + b)) || [])),
        ])
        .nice(),
    flipped: data.flipped || false,
    innerPadding: data.innerPadding || 0.1,
    dataGenerator: data.dataGenerator || dataBarStackedGenerator,
  };
}

export function dataBarStackedGenerator(
  selection: Selection<Element, DataSeriesBarStacked>
): DataBarStacked[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  if (!seriesDatum.flipped) {
    seriesDatum.mainScale.range([0, bounds.width]);
    seriesDatum.crossScale.range([bounds.height, 0]);
  } else {
    seriesDatum.mainScale.range([0, bounds.height]);
    seriesDatum.crossScale.range([0, bounds.width]);
  }

  const data: DataBarStacked[] = [];
  for (let i = 0; i < seriesDatum.mainValues.length; ++i) {
    const subcategoryValues = seriesDatum.crossValues[i];
    let sum = 0;
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = seriesDatum.mainValues[i];
      const v = subcategoryValues[j];

      if (!seriesDatum.flipped) {
        data.push({
          stackIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: seriesDatum.mainScale(c)!,
          y: -sum + Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(v)!),
          width: seriesDatum.mainScale.bandwidth(),
          height: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(v)!),
        });
        sum += data[data.length - 1].height;
      } else {
        data.push({
          stackIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: sum + Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(v)!),
          y: seriesDatum.mainScale(c)!,
          width: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(v)!),
          height: seriesDatum.mainScale.bandwidth(),
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
