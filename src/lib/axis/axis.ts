import {
  Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';

export interface ConfigureAxisFn {
  (axis: Axis<AxisDomain>): void;
}

export interface DataAxis {
  scale: AxisScale<AxisDomain>;
  configureAxis: ConfigureAxisFn;
}

export function dataAxis(data?: Partial<DataAxis>): DataAxis {
  return {
    scale: data?.scale || scaleLinear().domain([0, 1]).range([0, 600]),
    configureAxis: data?.configureAxis || (() => {}),
  };
}

export function axisLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return axis(selection)
    .classed('axis-left', true)
    .on('render.axisleft', function (e, d) {
      renderAxisLeft(select<GElement, DataAxis>(this));
    });
}

export function renderAxisLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    const s = select(g[i]);
    renderAxis(s, d3Axis(d3AxisLeft, d));
    const layoutTranslation = `translate(${s.layout().width}, 0)`;
    s.selectAll('.tick').transformAttr('transform', (v) => `${v}${layoutTranslation}`);
    s.select('.domain').attr('transform', layoutTranslation);
  });
}

export function axisBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return axis(selection)
    .classed('axis-bottom', true)
    .on('render.axisbottom', function (e, d) {
      renderAxisBottom(select<GElement, DataAxis>(this));
    });
}

export function renderAxisBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => renderAxis(select(g[i]), d3Axis(d3AxisBottom, d)));
}

function axis<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.classed('axis', true);
}

function renderAxis<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  axis: Axis<AxisDomain>
): Selection<GElement, Datum, PElement, PDatum> {
  selection.call(axis).attr('fill', null);
  selection
    .selectAll<SVGTextElement, unknown>('.tick text')
    .attr('fill', null)
    .call(xyAttrsToTransformAttr);
  selection.select('.domain').attr('fill', 'none');
  return selection;
}

function d3Axis(
  axisGenerator: (scale: AxisScale<AxisDomain>) => Axis<AxisDomain>,
  data: DataAxis
): Axis<AxisDomain> {
  const axis = axisGenerator(data.scale);
  data.configureAxis(axis);
  return axis;
}

export function xyAttrsToTransformAttr(
  selection: SelectionOrTransition<Element, any, BaseType, any>
): void {
  selection
    .attr('transform', function () {
      return `translate(${this.getAttribute('x') || 0}, ${this.getAttribute('y') || 0})`;
    })
    .attr('x', null)
    .attr('y', null);
}
