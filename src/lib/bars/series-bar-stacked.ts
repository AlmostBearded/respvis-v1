import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, dataSeries, DataSeries } from '../core';
import { Size } from '../core/utils';
import { DataBar, JoinEvent, seriesBar } from './series-bar';

export interface DataSeriesBarStackedCreation {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  innerPadding: number;
  crossValues: number[][];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  flipped: boolean;
}

export function dataSeriesBarStackedCreation(
  data?: Partial<DataSeriesBarStackedCreation>
): DataSeriesBarStackedCreation {
  return {
    mainValues: data?.mainValues || [],
    mainScale:
      data?.mainScale ||
      scaleBand()
        .domain(data?.mainValues || [])
        .padding(0.1),
    crossValues: data?.crossValues || [],
    crossScale:
      data?.crossScale ||
      scaleLinear()
        .domain([
          0,
          Math.max(...(data?.crossValues?.map((values) => values.reduce((a, b) => a + b)) || [])),
        ])
        .nice(),
    flipped: data?.flipped || false,
    innerPadding: data?.innerPadding || 0.1,
  };
}

export interface DataBarStacked extends DataBar {
  stackIndex: number;
}

export function dataBarsStacked(
  creationData: DataSeriesBarStackedCreation,
  bounds: Size
): DataBarStacked[] {
  if (!creationData.flipped) {
    creationData.mainScale.range([0, bounds.width]);
    creationData.crossScale.range([bounds.height, 0]);
  } else {
    creationData.mainScale.range([0, bounds.height]);
    creationData.crossScale.range([0, bounds.width]);
  }

  const data: DataBarStacked[] = [];
  for (let i = 0; i < creationData.mainValues.length; ++i) {
    const subcategoryValues = creationData.crossValues[i];
    let sum = 0;
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = creationData.mainValues[i];
      const v = subcategoryValues[j];

      if (!creationData.flipped) {
        data.push({
          stackIndex: i,
          index: j,
          key: creationData.keys?.[i][j] || `${i}/${j}`,
          x: creationData.mainScale(c)!,
          y: -sum + Math.min(creationData.crossScale(0)!, creationData.crossScale(v)!),
          width: creationData.mainScale.bandwidth(),
          height: Math.abs(creationData.crossScale(0)! - creationData.crossScale(v)!),
        });
        sum += data[data.length - 1].height;
      } else {
        data.push({
          stackIndex: i,
          index: j,
          key: creationData.keys?.[i][j] || `${i}/${j}`,
          x: sum + Math.min(creationData.crossScale(0)!, creationData.crossScale(v)!),
          y: creationData.mainScale(c)!,
          width: Math.abs(creationData.crossScale(0)! - creationData.crossScale(v)!),
          height: creationData.mainScale.bandwidth(),
        });
        sum += data[data.length - 1].width;
      }
    }
  }
  return data;
}

export interface DataSeriesBarStacked extends DataSeries<DataBarStacked> {}

export function dataSeriesBarStacked(
  creationData: DataSeriesBarStackedCreation
): DataSeriesBarStacked {
  return dataSeries({
    data: (s) => dataBarsStacked(creationData, s.bounds()!),
    key: (d) => d.key,
  });
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
