import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, dataAxis, DataAxis } from '../axis';
import { chart, horizontalTextAttrs, rectCenter, titleAttrs, verticalTextAttrs } from '../core';
import {
  DataBar,
  DataBarCreation,
  dataBarCreation,
  dataBars,
  dataSeriesBar,
  Orientation,
  seriesBar,
} from './bars';
import { dataSeriesLabel, seriesLabel } from './labels';

export interface DataChartBar extends DataBarCreation {
  configureMainAxis: ConfigureAxisFn;
  mainTitle: string;
  configureCrossAxis: ConfigureAxisFn;
  crossTitle: string;
  labels: (string | number)[];
}

export function dataChartBar(data?: Partial<DataChartBar>): DataChartBar {
  return {
    ...dataBarCreation(data),
    configureMainAxis: data?.configureMainAxis || (() => {}),
    mainTitle: data?.mainTitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
    crossTitle: data?.crossTitle || '',
    labels: data?.labels || [],
  };
}

export function chartBar<Datum extends DataChartBar, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return chart(selection)
    .classed('chart-bar', true)
    .on('render.chartbar', function (e, chartData) {
      renderChartBar(select<SVGSVGElement, Datum>(this));
    })
    .each((d, i, g) => {
      const s = select<SVGSVGElement, Datum>(g[i]);

      const root = s
        .select('.root')
        .attr('grid-template', '1fr auto / auto 1fr')
        .attr('margin', 20);

      const barSeries = root
        .append('g')
        .datum((d) => dataSeriesBar({ getData: (s) => dataBars(d, s.layout()) }))
        .call((s) => seriesBar(s))
        .attr('grid-area', '1 / 2 / 2 / 3');

      root
        .append('g')
        .datum((d) =>
          dataSeriesLabel({
            getData: () => {
              const barData = barSeries.selectAll<SVGRectElement, DataBar>('.bar').data();
              return d.labels.map((label, i) => ({
                text: label,
                key: barData[i].key,
                ...rectCenter(barData[i]),
              }));
            },
          })
        )
        .call((s) => seriesLabel(s))
        .attr('grid-area', '1 / 2 / 2 / 3');

      const leftAxis = root
        .append('g')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s))
        .attr('grid-area', '1 / 1 / 2 / 2')
        .attr('grid-template', '1fr / 1fr')
        .attr('grid-width', 60);

      leftAxis
        .append('text')
        .call((s) => verticalTextAttrs(s))
        .call((s) => titleAttrs(s))
        .attr('grid-area', '1 / 1 / 2 / 2')
        .attr('place-self', 'start start');

      const bottomAxis = root
        .append('g')
        .datum((d) => dataAxis())
        .call((s) => axisBottom(s))
        .attr('grid-area', '2 / 2 / 3 / 3')
        .attr('grid-template', '1fr / 1fr')
        .attr('grid-height', 50);

      bottomAxis
        .append('text')
        .call((s) => horizontalTextAttrs(s))
        .call((s) => titleAttrs(s))
        .attr('grid-area', '1 / 1 / 2 / 2')
        .attr('place-self', 'end end');
    });
}

export function renderChartBar<Datum extends DataChartBar, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<SVGSVGElement, Datum>(g[i]);
    const mainAxisData: DataAxis = {
      scale: chartData.mainScale,
      configureAxis: chartData.configureMainAxis,
    };
    const crossAxisData: DataAxis = {
      scale: chartData.crossScale,
      configureAxis: chartData.configureCrossAxis,
    };
    if (chartData.orientation === Orientation.Horizontal) {
      s.selectAll<SVGGElement, DataAxis>('.axis-left')
        .datum((d) => Object.assign(d, mainAxisData))
        .selectAll('.title')
        .text(chartData.mainTitle);
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom')
        .datum((d) => Object.assign(d, crossAxisData))
        .selectAll('.title')
        .text(chartData.crossTitle);
    } else {
      s.selectAll<SVGGElement, DataAxis>('.axis-left')
        .datum((d) => Object.assign(d, crossAxisData))
        .selectAll('.title')
        .text(chartData.crossTitle);
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom')
        .datum((d) => Object.assign(d, mainAxisData))
        .selectAll('.title')
        .text(chartData.mainTitle);
    }
  });
}
