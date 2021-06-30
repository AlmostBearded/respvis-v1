import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, DataAxis, dataAxis } from '../axis';
import { chart } from './chart';
import { debug, nodeToString } from './log';
import { ScaleAny } from './scale';

export interface DataChartCartesian {
  mainAxis: Partial<DataAxis>;
  crossAxis: Partial<DataAxis>;
  flipped: boolean;
}

export function dataChartCartesian(data: Partial<DataChartCartesian>): DataChartCartesian {
  return {
    mainAxis: data.mainAxis || {},
    crossAxis: data.crossAxis || {},
    flipped: false,
  };
}

export function chartCartesian<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartCartesian,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  autoUpdateAxes: boolean
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .call((s) => chart(s))
    .classed('chart-cartesian', true)
    .each((d, i, g) => {
      const s = select<GElement, Datum>(g[i]).layout('display', 'flex').layout('padding', '20px');

      const container = s
        .append('g')
        .classed('chart-container', true)
        .layout('flex', 1)
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr');

      container
        .append('svg')
        .classed('draw-area', true)
        .attr('overflow', 'visible')
        .layout('grid-area', '1 / 2')
        .layout('display', 'grid');

      container
        .append('g')
        .datum(dataAxis(d.crossAxis))
        .call((s) => axisLeft(s))
        .layout('grid-area', '1 / 1');

      container
        .append('g')
        .datum(dataAxis(d.mainAxis))
        .call((s) => axisBottom(s))
        .layout('grid-area', '2 / 2');
    })
    .call(
      (s) =>
        autoUpdateAxes &&
        s
          .on('datachange.debuglog', function () {
            debug(`data change on ${nodeToString(this)}`);
          })
          .on('datachange.updateaxes', function (e, chartData) {
            chartCartesianUpdateAxes(select<GElement, Datum>(this));
          })
    )
    .call((s) => chartCartesianUpdateAxes(s));
}

export function chartCartesianUpdateAxes<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartCartesian,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<GElement, Datum>(g[i]);

    const axisConfig = (selection: Selection<Element, DataAxis>, main: boolean) =>
      selection
        .datum((d) => Object.assign(d, main ? chartData.mainAxis : chartData.crossAxis))
        .classed('axis-main', main)
        .classed('axis-cross', !main);

    if (chartData.flipped) {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, true));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, false));
    } else {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, false));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, true));
    }
  });
}