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

export interface DataBarStacked extends DataBar {
  stackIndex: number;
}

export interface DataBarsStackedCreation {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  innerPadding: number;
  crossValues: number[][];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  orientation: Orientation;
}

export interface DataSeriesBarStacked extends DataSeriesBarCustom {
  creation: DataBarsStackedCreation;
}

export function dataBarsStackedCreation(
  data?: Partial<DataBarsStackedCreation>
): DataBarsStackedCreation {
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
    orientation: data?.orientation || Orientation.Vertical,
    innerPadding: data?.innerPadding || 0.1,
  };
}

export function dataSeriesBarStacked(creationData: DataBarsStackedCreation): DataSeriesBarStacked {
  const seriesData: DataSeriesBarStacked = {
    ...dataSeriesBarCustom({ data: (s) => dataBarsStacked(seriesData.creation, s.bounds()!) }),
    creation: creationData,
  };
  return seriesData;
}

export function dataBarsStacked(
  creationData: DataBarsStackedCreation,
  bounds: Size
): DataBarStacked[] {
  if (creationData.orientation === Orientation.Vertical) {
    creationData.mainScale.range([0, bounds.width]);
    creationData.crossScale.range([bounds.height, 0]);
  } else if (creationData.orientation === Orientation.Horizontal) {
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

      if (creationData.orientation === Orientation.Vertical) {
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
      } else if (creationData.orientation === Orientation.Horizontal) {
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
