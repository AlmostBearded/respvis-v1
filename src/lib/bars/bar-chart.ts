import { Axis, AxisDomain } from 'd3-axis';
import { BaseType, Selection } from 'd3-selection';
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
    ...dataSeriesBar(),
    configureMainAxis: () => {},
    mainTitle: '',
    configureCrossAxis: () => {},
    crossTitle: '',
    ...data,
  };
}

export function chartBar<Datum extends DataChartBar, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  const chrt = chart(selection).on('render.barchart', function (e, chartData) {
      barSeries.datum<DataSeriesBar>(chartData);
      const mainAxisData: DataAxis = {
        scale: chartData.mainScale,
        configureAxis: chartData.configureMainAxis,
      };
      const crossAxisData: DataAxis = {
        scale: chartData.crossScale,
        configureAxis: chartData.configureCrossAxis,
      };
      // todo: is setting the datum correct?
      if (chartData.orientation === Orientation.Horizontal) {
        leftAxis.datum(mainAxisData);
        bottomAxis.datum(crossAxisData);
        leftAxisTitle.text(chartData.mainTitle);
        bottomAxisTitle.text(chartData.crossTitle);
      } else {
        leftAxis.datum(crossAxisData);
        bottomAxis.datum(mainAxisData);
        leftAxisTitle.text(chartData.crossTitle);
        bottomAxisTitle.text(chartData.mainTitle);
      }
    }),
    root = chrt.select('.root').attr('grid-template', '1fr auto / auto 1fr').attr('margin', 20),
    barSeries = seriesBar(root.append('g')).attr('grid-area', '1 / 2 / 2 / 3'),
    leftAxis = axisLeft(root.append('g'))
      .attr('grid-area', '1 / 1 / 2 / 2')
      .attr('grid-template', '1fr / 1fr')
      .attr('grid-width', 60),
    leftAxisTitle = makeVerticalText(leftAxis.append('text'))
      .attr('grid-area', '1 / 1 / 2 / 2')
      .attr('place-self', 'start start')
      .call(axisTitleAttrs),
    bottomAxis = axisBottom(root.append('g'))
      .attr('grid-area', '2 / 2 / 3 / 3')
      .attr('grid-template', '1fr / 1fr')
      .attr('grid-height', 50),
    bottomAxisTitle = makeHorizontalText(bottomAxis.append('text'))
      .attr('grid-area', '1 / 1 / 2 / 2')
      .attr('place-self', 'end end')
      .call(axisTitleAttrs);

  function axisTitleAttrs(selection: Selection<SVGTextElement, unknown, BaseType, unknown>) {
    selection.classed('title', true).attr('font-size', '1.5em').attr('letter-spacing', '0.15em');
  }

  return chrt;
}

// const root = d3.select('#root'),
// chart = root.append('svg').call(respVis.chart),
// chartRoot = chart
//   .select('.root')
//   .attr('grid-template', '1fr 60 / 60 1fr')
//   .attr('margin', 10),
// barSeries = chartRoot
//   .append('g')
//   .attr('grid-area', '1 / 2 / 2 / 3')
//   .call(respVis.seriesBar),
// barSeriesData = Object.assign(barSeries.datum(), {
//   mainValues: cities,
//   mainScale: cityScale,
//   crossValues: populations,
//   crossScale: populationScale,
// }),
// leftAxis = chartRoot
//   .append('g')
//   .attr('grid-area', '1 / 1 / 2 / 2')
//   .attr('grid-template', '1fr / 1fr')
//   .on('render.rotatelabels', () =>
//     leftAxis.selectAll('.tick text').transformAttr('transform', (v) => `${v}rotate(-30)`)
//   )
//   .call(respVis.axisLeft),
// leftAxisData = leftAxis.datum(),
// leftAxisTitle = respVis
//   .makeVerticalText(leftAxis.append('text'))
//   .attr('grid-area', '1 / 1 / 2 / 2')
//   .attr('place-self', 'start start')
//   .call(axisTitleAttrs)
//   .text('Population'),
// bottomAxis = chartRoot
//   .append('g')
//   .attr('grid-area', '2 / 2 / 3 / 3')
//   .attr('grid-template', '1fr / 1fr')
//   .on('render.rotatelabels', () =>
//     bottomAxis
//       .selectAll('.tick text')
//       .transformAttr('transform', (v) => `${v}rotate(-30)`)
//       .attr('text-anchor', 'end')
//   )
//   .call(respVis.axisBottom),
// bottomAxisData = bottomAxis.datum(),
// bottomAxisTitle = respVis
//   .makeHorizontalText(bottomAxis.append('text'))
//   .attr('grid-area', '1 / 1 / 2 / 2')
//   .attr('place-self', 'end end')
//   .call(axisTitleAttrs)
//   .text('Cities');
