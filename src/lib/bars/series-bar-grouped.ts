import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL } from '../core';
import { Size } from '../core/utils';
import {
  DataBar,
  dataSeriesBarCustom,
  DataSeriesBarCustom,
  JoinEvent,
  Orientation,
  seriesBar,
} from './series-bar';

export interface DataBarGrouped extends DataBar {
  groupIndex: number;
}

export interface DataBarsGroupedCreation {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  innerPadding: number;
  crossValues: number[][];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  orientation: Orientation;
}

export interface DataSeriesBarGrouped extends DataSeriesBarCustom {
  creation: DataBarsGroupedCreation;
}

export function dataBarsGroupedCreation(
  data?: Partial<DataBarsGroupedCreation>
): DataBarsGroupedCreation {
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
        .domain([0, Math.max(...(data?.crossValues?.map((values) => Math.max(...values)) || []))])
        .nice(),
    orientation: data?.orientation || Orientation.Vertical,
    innerPadding: data?.innerPadding || 0.1,
  };
}

export function dataSeriesBarGrouped(creationData: DataBarsGroupedCreation): DataSeriesBarGrouped {
  const seriesData: DataSeriesBarGrouped = {
    ...dataSeriesBarCustom({ data: (s) => dataBarsGrouped(seriesData.creation, s.bounds()!) }),
    creation: creationData,
  };
  return seriesData;
}

export function dataBarsGrouped(
  creationData: DataBarsGroupedCreation,
  bounds: Size
): DataBarGrouped[] {
  if (creationData.orientation === Orientation.Vertical) {
    creationData.mainScale.range([0, bounds.width]);
    creationData.crossScale.range([bounds.height, 0]);
  } else if (creationData.orientation === Orientation.Horizontal) {
    creationData.mainScale.range([0, bounds.height]);
    creationData.crossScale.range([0, bounds.width]);
  }

  const innerScale = scaleBand<number>()
    .domain(range(creationData.crossValues[0]?.length || 0))
    .range([0, creationData.mainScale.bandwidth()])
    .padding(creationData.innerPadding);

  const data: DataBarGrouped[] = [];
  for (let i = 0; i < creationData.crossValues.length; ++i) {
    const subcategoryValues = creationData.crossValues[i];
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = creationData.mainValues[i];
      const v = subcategoryValues[j];

      if (creationData.orientation === Orientation.Vertical) {
        data.push({
          groupIndex: i,
          index: j,
          key: creationData.keys?.[i][j] || `${i}/${j}`,
          x: creationData.mainScale(c)! + innerScale(j)!,
          y: Math.min(creationData.crossScale(0)!, creationData.crossScale(v)!),
          width: innerScale.bandwidth(),
          height: Math.abs(creationData.crossScale(0)! - creationData.crossScale(v)!),
        });
      } else if (creationData.orientation === Orientation.Horizontal) {
        data.push({
          groupIndex: i,
          index: j,
          key: creationData.keys?.[i][j] || `${i}/${j}`,
          x: Math.min(creationData.crossScale(0)!, creationData.crossScale(v)!),
          y: creationData.mainScale(c)! + innerScale(j)!,
          width: Math.abs(creationData.crossScale(0)! - creationData.crossScale(v)!),
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
    .on('barenter', (e: JoinEvent<SVGRectElement, DataBarGrouped>) =>
      e.detail.selection.attr('fill', (d) => COLORS_CATEGORICAL[d.index])
    );
}
