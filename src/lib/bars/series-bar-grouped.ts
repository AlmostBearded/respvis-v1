import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, DataSeriesGenerator } from '../core';
import { Size } from '../core/utils';
import { DataBar, JoinEvent, seriesBar } from './series-bar';

export interface DataBarGrouped extends DataBar {
  groupIndex: number;
}

export interface DataSeriesBarGrouped extends DataSeriesGenerator<DataBarGrouped> {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  innerPadding: number;
  crossValues: number[][];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  flipped: boolean;
}

export function dataSeriesBarGrouped(data: Partial<DataSeriesBarGrouped>): DataSeriesBarGrouped {
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
        .domain([0, Math.max(...(data.crossValues?.map((values) => Math.max(...values)) || []))])
        .nice(),
    flipped: data.flipped || false,
    innerPadding: data.innerPadding || 0.1,
    dataGenerator: data.dataGenerator || dataBarGroupedGenerator,
  };
}

export function dataBarGroupedGenerator(
  selection: Selection<Element, DataSeriesBarGrouped>
): DataBarGrouped[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  if (!seriesDatum.flipped) {
    seriesDatum.mainScale.range([0, bounds.width]);
    seriesDatum.crossScale.range([bounds.height, 0]);
  } else {
    seriesDatum.mainScale.range([0, bounds.height]);
    seriesDatum.crossScale.range([0, bounds.width]);
  }

  const innerScale = scaleBand<number>()
    .domain(range(seriesDatum.crossValues[0]?.length || 0))
    .range([0, seriesDatum.mainScale.bandwidth()])
    .padding(seriesDatum.innerPadding);

  const data: DataBarGrouped[] = [];
  for (let i = 0; i < seriesDatum.crossValues.length; ++i) {
    const subcategoryValues = seriesDatum.crossValues[i];
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = seriesDatum.mainValues[i];
      const v = subcategoryValues[j];

      if (!seriesDatum.flipped) {
        data.push({
          groupIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: seriesDatum.mainScale(c)! + innerScale(j)!,
          y: Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(v)!),
          width: innerScale.bandwidth(),
          height: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(v)!),
        });
      } else {
        data.push({
          groupIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(v)!),
          y: seriesDatum.mainScale(c)! + innerScale(j)!,
          width: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(v)!),
          height: innerScale.bandwidth(),
        });
      }
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
    .attr('fill', null)
    .on('barenter.seriesbargrouped', (e: JoinEvent<SVGRectElement, DataBarGrouped>) =>
      e.detail.selection.attr('fill', (d) => COLORS_CATEGORICAL[d.index])
    );
}
