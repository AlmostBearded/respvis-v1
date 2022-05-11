import { select, Selection } from 'd3';
import { Line, SeriesLine, seriesLineData, seriesLineRender } from './series-line';
import {
  ChartCartesian,
  chartCartesianAxesRender,
  chartCartesianData,
  chartCartesianRender,
  arrayIs,
  rectFromString,
} from '../core';
import { SeriesPoint, seriesPointRender, seriesPointData, Point } from '../points';
import { Legend, legendData, legendRender, LegendItem } from '../legend';
import { SeriesLabel, seriesLabelData, seriesLabelRender, JoinEvent } from '../bars';
import { SeriesConfigTooltips, seriesConfigTooltipsData } from '../tooltip';

export interface ChartLine extends SeriesLine, ChartCartesian {
  legend: Partial<Legend>;
  markerLabelsEnabled: boolean;
  markerLabels: (
    chartData: this,
    markerData: {
      lineIndex: number;
      markerIndex: number;
      xValue: any;
      yValue: any;
    }
  ) => string;
  markerTooltips: Partial<SeriesConfigTooltips<SVGCircleElement, Point>>;
}

export function chartLineData(data: Partial<ChartLine>): ChartLine {
  const seriesD = seriesLineData(data);
  const chartCartesianD = chartCartesianData(data);
  return {
    ...seriesD,
    ...chartCartesianD,
    legend: data.legend || {},
    markerLabelsEnabled: data.markerLabelsEnabled || true,
    markerLabels: data.markerLabels || ((chartD, markerD) => `${markerD.yValue}`),
    markerTooltips: data.markerTooltips || {},
  };
}

export function chartLineRender(
  selection: Selection<SVGSVGElement | SVGGElement, ChartLine>
): void {
  selection
    .call((s) => chartCartesianRender(s))
    .classed('chart-line', true)
    .each((chartD, i, g) => {
      const chartS = select<SVGSVGElement | SVGGElement, ChartLine>(g[i]);
      const drawAreaS = chartS.selectAll('.draw-area');
      const drawAreaBounds = rectFromString(drawAreaS.attr('bounds') || '0, 0, 600, 400');
      const { styleClasses, keys, xValues, yValues, xScale, yScale, flipped } = chartD;

      xScale.range(flipped ? [drawAreaBounds.height, 0] : [0, drawAreaBounds.width]);
      yScale.range(flipped ? [0, drawAreaBounds.width] : [drawAreaBounds.height, 0]);

      const lineSeriesS = drawAreaS
        .selectAll<SVGGElement, SeriesLine>('.series-line')
        .data([chartD])
        .join('g')
        .call((s) => seriesLineRender(s))
        .on('pointerover.chartlinehighlight', (e) =>
          chartLineHoverLine(chartS, select(e.target), true)
        )
        .on('pointerout.chartlinehighlight', (e) =>
          chartLineHoverLine(chartS, select(e.target), false)
        );

      const { markerTooltips } = chartD;
      const markerS = drawAreaS
        .selectAll<SVGGElement, SeriesPoint>('.series-point')
        .data<SeriesPoint>(
          keys.map((k, lineI) =>
            seriesPointData({
              styleClasses: arrayIs(styleClasses) ? styleClasses[lineI] : styleClasses,
              keys: yValues[lineI].map((_, markerI) => `${k}-${markerI}`),
              xValues,
              yValues: yValues[lineI],
              xScale,
              yScale,
              flipped,
              ...markerTooltips,
            })
          )
        )
        .join('g')
        .call((s) => seriesPointRender(s))
        .on('pointerover.chartlinehighlight', (e) =>
          chartLineHoverMarker(chartS, select(e.target), true)
        )
        .on('pointerout.chartlinehighlight', (e) =>
          chartLineHoverMarker(chartS, select(e.target), false)
        )
        .attr('data-key', (d, i) => keys[i]);

      const { markerLabelsEnabled, markerLabels } = chartD;
      drawAreaS
        .selectAll<SVGGElement, SeriesLabel>('.series-label')
        .data<SeriesLabel>(
          markerLabelsEnabled
            ? keys.map((lineKey, lineI) => {
                const markerPoints = markerS
                  .selectAll<Element, Point>(`.point[data-key^="${lineKey}"]`)
                  .data();
                return seriesLabelData({
                  positions: markerPoints.map((p) => p.center),
                  keys: markerPoints.map((p) => p.key),
                  texts: markerPoints.map((p, markerI) =>
                    markerLabels(chartD, {
                      lineIndex: lineI,
                      markerIndex: markerI,
                      xValue: p.xValue,
                      yValue: p.yValue,
                    })
                  ),
                });
              })
            : []
        )
        .join('g')
        .call((s) => seriesLabelRender(s));

      const { legend: legendD } = chartD;
      chartS
        .selectAll<SVGGElement, Legend>('.legend')
        .data(
          arrayIs(styleClasses) && styleClasses.length > 1
            ? [legendData({ styleClasses, labels: keys, ...legendD, keys })]
            : []
        )
        .join('g')
        .call((s) => legendRender(s))
        .on('pointerover.chartlinehighlight pointerout.chartlinehighlight', (e) => {
          chartLineHoverLegendItem(
            chartS,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });

      chartD.xAxis.scale = chartD.xScale;
      chartD.yAxis.scale = chartD.yScale;
      chartCartesianAxesRender(chartS);
    });
}

export function chartLineHoverLine(
  chartS: Selection,
  lineS: Selection<Element, Line>,
  hover: boolean
) {
  lineS.each((lineD) => {
    chartS.selectAll(`.legend-item[data-key="${lineD.key}"]`).classed('highlight', hover);
    chartS.selectAll(`.point[data-key^="${lineD.key}"]`).classed('highlight', hover);
    chartS.selectAll(`.label[data-key^="${lineD.key}"]`).classed('highlight', hover);
  });
}

export function chartLineHoverMarker(
  chartS: Selection,
  markerS: Selection<Element, Point>,
  hover: boolean
) {
  markerS.each((pointD) => {
    const lineKey = pointD.key.replace(/-[0-9]+$/, '');
    chartS.selectAll(`.legend-item[data-key="${lineKey}"]`).classed('highlight', hover);
    chartS.selectAll(`.line[data-key^="${lineKey}"]`).classed('highlight', hover);
    chartS.selectAll(`.label[data-key="${pointD.key}"]`).classed('highlight', hover);
  });
}

export function chartLineHoverLegendItem(
  chartS: Selection<Element, ChartLine>,
  legendItemS: Selection<Element, LegendItem>,
  hover: boolean
): void {
  legendItemS.each((_, i, g) => {
    const key = g[i].getAttribute('data-key')!;
    chartS.selectAll<any, Line>(`.line[data-key="${key}"]`).classed('highlight', hover);
    chartS.selectAll(`.point[data-key^="${key}"]`).classed('highlight', hover);
    chartS.selectAll(`.label[data-key^="${key}"]`).classed('highlight', hover);
  });
}
