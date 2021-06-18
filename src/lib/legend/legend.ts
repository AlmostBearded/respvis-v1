import { BaseType, create, select, Selection } from 'd3-selection';
import { DataSeries, debug, nodeToString, textHorizontalAttrs, textTitleAttrs } from '../core';

export interface DataLegend extends DataSeries<DataLegendItem> {
  title: string;
}

export interface DataLegendItem {
  symbolTag: string;
  symbolAttributes: { name: string; value: string }[];
  label: string;
}

export function legend<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataLegend,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('legend', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'column')
    .layout('align-items', 'center')
    .attr('font-size', '0.8em') // todo: font size incosistent with 0.7em used mostly everywhere else
    .call((legend) =>
      legend
        .append('text')
        .classed('title', true)
        .layout('margin', '0 0.5em')
        .call((s) => textHorizontalAttrs(s))
        .call((s) => textTitleAttrs(s))
    )
    .call((legend) =>
      legend
        .append('g')
        .classed('items', true)
        .layout('display', 'flex')
        .layout('flex-direction', 'row')
        .layout('justify-content', 'center')
        .layout('align-items', 'flex-start')
    )
    .on('datachange.legend', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.legend', function (e, d) {
      debug(`render legend on ${nodeToString(this)}`);
      const s = select<GElement, Datum>(this);

      s.selectAll('.title').text(d.title);

      s.selectAll('.items')
        .selectAll<SVGGElement, DataLegendItem>('.item')
        .data(d.data instanceof Function ? d.data(s) : d.data, d.key)
        .join((enter) =>
          enter
            .append('g')
            .classed('item', true)
            .layout('display', 'flex')
            .layout('flex-direction', 'row')
            .layout('justify-content', 'center')
            .layout('margin', '0.25em')
            .call((item) =>
              item
                .append((d) => document.createElementNS('http://www.w3.org/2000/svg', d.symbolTag))
                .classed('symbol', true)
                .layout('width', 'fit')
                .layout('height', 'fit')
                .layout('margin-right', '0.5em')
            )
            .call((item) =>
              item
                .append('text')
                .classed('label', true)
                .call((s) => textHorizontalAttrs(s))
            )
        )
        .call((s) =>
          s
            .select('.symbol')
            .each((d, i, g) =>
              d.symbolAttributes.forEach((a) => select(g[i]).attr(a.name, a.value))
            )
        )
        .call((s) => s.select('.label').text((d) => d.label.toString()));
    });
}
