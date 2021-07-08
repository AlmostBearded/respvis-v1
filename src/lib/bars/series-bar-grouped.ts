import { range } from 'd3-array';
import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, DataSeriesGenerator, findByDataProperty } from '../core';
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
    flipped: data.flipped || false,
    subcategoryPadding: data.subcategoryPadding || 0.1,
    dataGenerator: data.dataGenerator || dataBarGroupedGenerator,
    keys: data.keys,
  };
}

export function dataBarGroupedGenerator(
  selection: Selection<Element, DataSeriesBarGrouped>
): DataBarGrouped[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  if (!seriesDatum.flipped) {
    seriesDatum.categoryScale.range([0, bounds.width]);
    seriesDatum.valueScale.range([bounds.height, 0]);
  } else {
    seriesDatum.categoryScale.range([0, bounds.height]);
    seriesDatum.valueScale.range([0, bounds.width]);
  }

  const innerScale = scaleBand<number>()
    .domain(range(seriesDatum.values[0]?.length || 0))
    .range([0, seriesDatum.categoryScale.bandwidth()])
    .padding(seriesDatum.subcategoryPadding);

  const data: DataBarGrouped[] = [];
  for (let i = 0; i < seriesDatum.values.length; ++i) {
    const subcategoryValues = seriesDatum.values[i];
    for (let j = 0; j < subcategoryValues.length; ++j) {
      const c = seriesDatum.categories[i];
      const v = subcategoryValues[j];

      if (!seriesDatum.flipped) {
        data.push({
          groupIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: seriesDatum.categoryScale(c)! + innerScale(j)!,
          y: Math.min(seriesDatum.valueScale(0)!, seriesDatum.valueScale(v)!),
          width: innerScale.bandwidth(),
          height: Math.abs(seriesDatum.valueScale(0)! - seriesDatum.valueScale(v)!),
        });
      } else {
        data.push({
          groupIndex: i,
          index: j,
          key: seriesDatum.keys?.[i][j] || `${i}/${j}`,
          x: Math.min(seriesDatum.valueScale(0)!, seriesDatum.valueScale(v)!),
          y: seriesDatum.categoryScale(c)! + innerScale(j)!,
          width: Math.abs(seriesDatum.valueScale(0)! - seriesDatum.valueScale(v)!),
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

export function barGroupedFindByGroupIndex(
  container: Selection,
  index: number
): Selection<SVGRectElement, DataBarGrouped> {
  return findByDataProperty<SVGRectElement, DataBarGrouped>(container, '.bar', 'groupIndex', index);
}
