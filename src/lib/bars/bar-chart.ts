import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, dataAxis, DataAxis } from '../axis';
import { chart, makeHorizontalText, makeVerticalText } from '../core';
import { dataSeriesBar, DataSeriesBar, Orientation, seriesBar } from './bars';

export interface DataChartBar extends DataSeriesBar {
  configureMainAxis: ConfigureAxisFn;
  mainTitle: string;
  configureCrossAxis: ConfigureAxisFn;
  crossTitle: string;
}

export function dataChartBar(data?: Partial<DataChartBar>): DataChartBar {
  return {
    ...dataSeriesBar(data),
    configureMainAxis: data?.configureMainAxis || (() => {}),
    mainTitle: data?.mainTitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
    crossTitle: data?.crossTitle || '',
  };
}

export function chartBar<Datum extends DataChartBar, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  const chrt = chart(selection)
    .classed('chart-bar', true)
    .on('render.chartbar', function (e, chartData) {
      renderChartBar(select<SVGSVGElement, Datum>(this));
    });

  const root = chrt.select('.root').attr('grid-template', '1fr auto / auto 1fr').attr('margin', 20);

  seriesBar(root.append('g').datum((d) => d)).attr('grid-area', '1 / 2 / 2 / 3');

  const leftAxis = axisLeft(root.append('g').datum((d) => dataAxis()))
    .attr('grid-area', '1 / 1 / 2 / 2')
    .attr('grid-template', '1fr / 1fr')
    .attr('grid-width', 60);
  makeVerticalText(leftAxis.append('text'))
    .attr('grid-area', '1 / 1 / 2 / 2')
    .attr('place-self', 'start start')
    .call(axisTitleAttrs);

  const bottomAxis = axisBottom(root.append('g').datum((d) => dataAxis()))
    .attr('grid-area', '2 / 2 / 3 / 3')
    .attr('grid-template', '1fr / 1fr')
    .attr('grid-height', 50);
  makeHorizontalText(bottomAxis.append('text'))
    .attr('grid-area', '1 / 1 / 2 / 2')
    .attr('place-self', 'end end')
    .call(axisTitleAttrs);

  function axisTitleAttrs(selection: Selection<SVGTextElement, unknown, BaseType, unknown>) {
    selection.classed('title', true).attr('font-size', '1.5em').attr('letter-spacing', '0.15em');
  }

  return chrt;
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
