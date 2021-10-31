import { select, Selection } from 'd3-selection';
import { axisTickFindByIndex } from '../axis';
import { siblingIndex } from '../core';
import {
  chartCartesian,
  chartCartesianDataHydrate,
  ChartCartesian,
  chartCartesianAxes,
} from '../core/chart-cartesian';
import { DataHydrateFn } from '../core/utility/data';
import { seriesBar, seriesBarDataHydrate, SeriesBar, Bar } from './series-bar';
import { labelFind } from './series-label';
import {
  SeriesLabelBar as SeriesLabelBar,
  seriesLabelBarDataHydrate as seriesLabelBarDataHydrate,
  seriesLabelBar,
} from './series-label-bar';

export interface ChartBar extends SeriesBar, ChartCartesian {
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarDataHydrate(data: Partial<ChartBar>): ChartBar {
  const seriesD = seriesBarDataHydrate(data);
  const chartCartesianD = chartCartesianDataHydrate(data);
  chartCartesianD.xAxis.scale = seriesD.categoryScale;
  chartCartesianD.yAxis.scale = seriesD.valueScale;
  return {
    ...seriesD,
    ...chartCartesianD,
    labelsEnabled: data.labelsEnabled ?? true,
    labels: data.labels || {},
  };
}

export type ChartBarSelection = Selection<SVGSVGElement | SVGGElement, Partial<ChartBar>>;

export function chartBar(
  selection: ChartBarSelection,
  dataHydrate: DataHydrateFn<ChartBar> = chartBarDataHydrate
): void {
  selection.classed('chart-bar', true).each(function (d) {
    const chartS = <ChartBarSelection>select(this);
    const chartD = dataHydrate(d);

    chartCartesian(chartS);

    const drawAreaS = chartS.selectAll('.draw-area');

    const barSeriesS = drawAreaS
      .selectAll<SVGGElement, SeriesBar>('.series-bar')
      .data([chartD])
      .join('g')
      .call((s) => seriesBar(s))
      .on('mouseover.highlight', (e) => chartBarHoverBar(chartS, select(e.target), true))
      .on('mouseout.highlight', (e) => chartBarHoverBar(chartS, select(e.target), false));

    drawAreaS
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
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
      .call((s) => seriesLabelBar(s));

    chartCartesianAxes(chartS, chartBarDataHydrate);
  });
}

export function chartBarHoverBar(chart: Selection, bar: Selection<Element, Bar>, hover: boolean) {
  bar.each((barD, i, g) => {
    const barIndex = siblingIndex(g[i], '.bar');

    bar.classed('highlight', hover);
    labelFind(chart, barD.key).classed('highlight', hover);
    axisTickFindByIndex(chart.selectAll('.axis-x'), barIndex).classed('highlight', hover);
  });
}
