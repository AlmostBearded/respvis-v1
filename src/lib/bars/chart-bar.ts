import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, dataAxis, DataAxis } from '../axis';
import { chart, textHorizontalAttrs, textTitleAttrs, textVerticalAttrs } from '../core';
import {
  DataBarsCreation,
  dataBarsCreation,
  Orientation,
  seriesBar,
  dataSeriesBar,
} from './series-bar';
import { seriesLabel } from './series-label';
import { dataLabelsBarCreation, dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBar extends DataBarsCreation {
  configureMainAxis: ConfigureAxisFn;
  mainTitle: string;
  configureCrossAxis: ConfigureAxisFn;
  crossTitle: string;
}

export function dataChartBar(data?: Partial<DataChartBar>): DataChartBar {
  return {
    ...dataBarsCreation(data),
    configureMainAxis: data?.configureMainAxis || (() => {}),
    mainTitle: data?.mainTitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
    crossTitle: data?.crossTitle || '',
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
      const s = select<SVGSVGElement, Datum>(g[i])
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr')
        .layout('padding', '20px');

      const barSeries = s
        .append('g')
        .datum((d) => dataSeriesBar(d))
        .call((s) => seriesBar(s))
        .layout('grid-area', '1 / 2 / 2 / 3');

      s.append('g')
        .datum((d) => dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
        .call((s) => seriesLabel(s))
        .layout('grid-area', '1 / 2 / 2 / 3');

      const leftAxis = s
        .append('g')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s))
        .layout('grid-area', '1 / 1 / 2 / 2')
        .layout('display', 'flex')
        .layout('justify-content', 'flex-start')
        .layout('align-items', 'flex-start')
        .layout('width', '70px');

      leftAxis
        .append('text')
        .call((s) => textVerticalAttrs(s))
        .call((s) => textTitleAttrs(s));

      const bottomAxis = s
        .append('g')
        .datum((d) => dataAxis())
        .call((s) => axisBottom(s))
        .layout('grid-area', '2 / 2 / 3 / 3')
        .layout('display', 'flex')
        .layout('justify-content', 'flex-end')
        .layout('align-items', 'flex-end')
        .layout('height', '50px');

      bottomAxis
        .append('text')
        .call((s) => textHorizontalAttrs(s))
        .call((s) => textTitleAttrs(s));
    });
}

export function renderChartBar<Datum extends DataChartBar, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<SVGSVGElement, Datum>(g[i]);
    const axisConfig = (selection: Selection<Element, DataAxis>, main: boolean) =>
      selection
        .datum((d) =>
          Object.assign(d, {
            scale: main ? chartData.mainScale : chartData.crossScale,
            configureAxis: main ? chartData.configureMainAxis : chartData.configureCrossAxis,
          })
        )
        .classed('axis-main', main)
        .classed('axis-cross', !main)
        .selectAll('.title')
        .text(main ? chartData.mainTitle : chartData.crossTitle);

    if (chartData.orientation === Orientation.Horizontal) {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, true));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, false));
    } else {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, false));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, true));
    }
  });
}
