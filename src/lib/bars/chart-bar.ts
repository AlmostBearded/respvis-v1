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
      const s = select<SVGSVGElement, Datum>(g[i]);

      const root = s
        .select('.root')
        .attr('grid-template', '1fr auto / auto 1fr')
        .attr('margin', 20);

      const barSeries = root
        .append('g')
        .datum((d) => dataSeriesBar(d))
        .call((s) => seriesBar(s))
        .attr('grid-area', '1 / 2 / 2 / 3');

      root
        .append('g')
        .datum((d) => dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
        .call((s) => seriesLabel(s))
        .attr('grid-area', '1 / 2 / 2 / 3');

      const leftAxis = root
        .append('g')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s))
        .attr('grid-area', '1 / 1 / 2 / 2')
        .attr('grid-template', '1fr / 1fr')
        .attr('grid-width', 70);

      leftAxis
        .append('text')
        .call((s) => textVerticalAttrs(s))
        .call((s) => textTitleAttrs(s))
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
        .call((s) => textHorizontalAttrs(s))
        .call((s) => textTitleAttrs(s))
        .attr('grid-area', '1 / 1 / 2 / 2')
        .attr('place-self', 'end end');
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
