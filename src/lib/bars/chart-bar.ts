import { select, Selection } from 'd3-selection';
import { axisTickFindByIndex } from '../axis';
import { siblingIndex } from '../core';
import {
  chartCartesianRender,
  chartCartesianData,
  ChartCartesian,
  chartCartesianAxesRender,
  ChartSelection,
} from '../core/chart-cartesian';
import { DataHydrateFn } from '../core/utility/data';
import { seriesBarRender, seriesBarData, SeriesBarData, BarData } from './series-bar';
import { labelFind } from './series-label';
import {
  SeriesLabelBarData as SeriesLabelBarData,
  seriesLabelBarData as seriesLabelBarData,
  seriesLabelBarJoin,
} from './series-label-bar';

export interface ChartBar extends SeriesBarData, ChartCartesian {
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBarData>;
}

export function chartBarData(data: Partial<ChartBar>): ChartBar {
  const seriesD = seriesBarData(data);
  const chartCartesianD = chartCartesianData(data);
  chartCartesianD.xAxis.scale = seriesD.categoryScale;
  chartCartesianD.yAxis.scale = seriesD.valueScale;
  return {
    ...seriesD,
    ...chartCartesianD,
    labelsEnabled: data.labelsEnabled ?? true,
    labels: data.labels || {},
  };
}

export type ChartBarSelection = ChartSelection<ChartBar>;

export function chartBar(
  selection: ChartBarSelection,
  dataHydrate: DataHydrateFn<ChartBar> = chartBarData
): void {
  selection.classed('chart-bar', true).each(function (d) {
    const chartS = <ChartBarSelection>select(this);
    const chartD = dataHydrate(d);

    chartCartesianRender(chartS);

    const drawAreaS = chartS.selectAll('.draw-area');

    const barSeriesS = drawAreaS
      .selectAll<SVGGElement, SeriesBarData>('.series-bar')
      .data([chartD])
      .join('g')
      .call((s) => seriesBarRender(s))
      .on('mouseover.highlight', (e) => chartBarHoverBar(chartS, select(e.target), true))
      .on('mouseout.highlight', (e) => chartBarHoverBar(chartS, select(e.target), false));

    drawAreaS
      .selectAll<Element, SeriesLabelBarData>('.series-label-bar')
      .data(
        chartD.labelsEnabled
          ? [
              {
                barContainer: barSeriesS,
                ...chartD.labels,
              },
            ]
          : []
      )
      .join('g')
      .call((s) => seriesLabelBarJoin(s));

    chartCartesianAxesRender(chartS, chartBarData);
  });
}

export function chartBarHoverBar(chart: Selection, bar: Selection<Element, BarData>, hover: boolean) {
  bar.each((barD, i, g) => {
    const barIndex = siblingIndex(g[i], '.bar');

    bar.classed('highlight', hover);
    labelFind(chart, barD.key).classed('highlight', hover);
    axisTickFindByIndex(chart.selectAll('.axis-x'), barIndex).classed('highlight', hover);
  });
}
