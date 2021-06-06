import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, DataAxis, dataAxis } from '../axis';
import { debug, nodeToString } from './log';
import { ScaleAny } from './scale';

export interface DataChartCartesian {
  mainScale: ScaleAny<any, number, number>;
  mainTitle: string;
  mainSubtitle: string;
  configureMainAxis: ConfigureAxisFn;
  crossScale: ScaleAny<any, number, number>;
  crossTitle: string;
  crossSubtitle: string;
  configureCrossAxis: ConfigureAxisFn;
}

export function dataChartCartesian(data?: Partial<DataChartCartesian>): DataChartCartesian {
  return {
    mainScale: scaleLinear().domain([0, 1]).range([0, 500]),
    mainTitle: data?.mainTitle || '',
    mainSubtitle: data?.mainSubtitle || '',
    configureMainAxis: data?.configureMainAxis || (() => {}),
    crossScale: scaleLinear().domain([0, 1]).range([0, 500]),
    crossTitle: data?.crossTitle || '',
    crossSubtitle: data?.crossSubtitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
  };
}

export function chartCartesian<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('chart-cartesian', true)
    .each((d, i, g) => {
      const s = select<GElement, Datum>(g[i])
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr')
        .layout('padding', '20px');

      const drawArea = s
        .append('svg')
        .classed('draw-area', true)
        .attr('overflow', 'visible')
        .layout('grid-area', '1 / 2')
        .layout('display', 'grid');

      // const barSeries = drawArea
      //   .append('g')
      //   .layout('grid-area', '1 / 1')
      //   .datum((d) => dataSeriesBar(d))
      //   .call((s) => seriesBar(s));

      // drawArea
      //   .append('g')
      //   .layout('grid-area', '1 / 1')
      //   .datum((d) => dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
      //   .call((s) => seriesLabel(s));

      s.append('g')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s))
        .layout('grid-area', '1 / 1');

      s.append('g')
        .datum((d) => dataAxis())
        .call((s) => axisBottom(s))
        .layout('grid-area', '2 / 2');
    })
    .on('datachange.chartcartesian', function (e, chartData) {
      debug(`data change on ${nodeToString(this)}`);
      chartCartesianDataChange(select<GElement, Datum>(this));
    })
    .call((s) => chartCartesianDataChange(s));
}

export function chartCartesianDataChange<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartCartesian,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<GElement, Datum>(g[i]);

    // s.selectAll<SVGElement, DataSeriesBar>('.series-bar').datum((d) =>
    //   Object.assign(d, { creation: chartData })
    // );

    const axisConfig = (selection: Selection<Element, DataAxis>, main: boolean) =>
      selection
        .datum((d) =>
          Object.assign(d, {
            scale: main ? chartData.mainScale : chartData.crossScale,
            title: main ? chartData.mainTitle : chartData.crossTitle,
            subtitle: main ? chartData.mainSubtitle : chartData.crossSubtitle,
            configureAxis: main ? chartData.configureMainAxis : chartData.configureCrossAxis,
          })
        )
        .classed('axis-main', main)
        .classed('axis-cross', !main);

    if (chartData.orientation === Orientation.Horizontal) {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, true));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, false));
    } else {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, false));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, true));
    }
  });
}
