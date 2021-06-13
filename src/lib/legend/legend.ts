import { BaseType, create, select, Selection } from 'd3-selection';
import { DataSeries, debug, nodeToString, textHorizontalAttrs } from '../core';

export interface DataLegendItem {
  symbolTag: string;
  symbolAttributes: { name: string; value: string }[];
  label: string;
}

export function legend<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataSeries<DataLegendItem>,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('legend', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'row')
    .layout('justify-content', 'center')
    .layout('align-items', 'flex-start')
    .on('datachange.legend', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.legend', function (e, d) {
      debug(`render legend on ${nodeToString(this)}`);
      const s = select<GElement, Datum>(this);

      s.selectAll<SVGGElement, DataLegendItem>('.item')
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
