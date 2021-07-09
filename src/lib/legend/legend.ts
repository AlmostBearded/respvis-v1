import { BaseType, create, select, Selection } from 'd3-selection';
import { JoinEvent } from '../bars';
import {
  DataSeriesGenerator,
  debug,
  findByDataProperty,
  findByIndex,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,
} from '../core';
import { filterBrightness } from '../filters';

export interface DataLegendItem {
  symbolTag: string;
  symbolAttributes: { name: string; value: string }[];
  label: string;
}

export interface DataLegend extends DataSeriesGenerator<DataLegendItem> {
  title: string;
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
    .call((legend) => {
      legend
        .append('text')
        .classed('title', true)
        .layout('margin', '0 0.5em')
        .call((s) => textHorizontalAttrs(s))
        .call((s) => textTitleAttrs(s));
      legend
        .append('g')
        .classed('items', true)
        .layout('display', 'flex')
        .layout('flex-direction', 'row')
        .layout('justify-content', 'center')
        .layout('align-items', 'flex-start');
    })
    .call((s) =>
      s
        .append('defs')
        .append('filter')
        .call((s) => filterBrightness(s, 1.3))
    )
    .on('legenditementer.legend', (e: JoinEvent<SVGGElement, DataLegendItem>) => {
      e.detail.selection.on('mouseover.legend mouseout.legend', (e) => {
        legendItemHighlight(select(e.currentTarget), e.type.endsWith('over'));
      });
    })
    .on('datachange.legend', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.legend', function (e, d) {
      debug(`render legend on ${nodeToString(this)}`);
      const legend = select<GElement, Datum>(this);

      legend.selectAll('.title').text(d.title);

      legend
        .selectAll('.items')
        .selectAll<SVGGElement, DataLegendItem>('.legend-item')
        .data(d.dataGenerator(legend), (d) => d.label)
        .join(
          (enter) =>
            enter
              .append('g')
              .classed('legend-item', true)
              .layout('display', 'flex')
              .layout('flex-direction', 'row')
              .layout('justify-content', 'center')
              .layout('margin', '0.25em')
              .call((s) =>
                s
                  .append((d) => create(`svg:${d.symbolTag}`).node()!)
                  .classed('symbol', true)
                  .layout('width', 'fit')
                  .layout('height', 'fit')
                  .layout('margin-right', '0.5em')
              )
              .call((s) =>
                s
                  .append('text')
                  .classed('label', true)
                  .call((s) => textHorizontalAttrs(s))
              )
              .call((s) => legend.dispatch('legenditementer', { detail: { selection: s } })),
          undefined,
          (exit) =>
            exit
              .remove()
              .call((s) => legend.dispatch('legenditemexit', { detail: { selection: s } }))
        )
        .call((s) =>
          s
            .select('.symbol')
            .each((d, i, g) =>
              d.symbolAttributes.forEach((a) => select(g[i]).attr(a.name, a.value))
            )
        )
        .call((s) => s.select('.label').text((d) => d.label.toString()))
        .call((s) => legend.dispatch('legenditemupdate', { detail: { selection: s } }));
    });
}

export function legendItemHighlight(item: Selection, highlight: boolean): void {
  if (highlight) {
    item
      .selectAll('.symbol')
      .attr(
        'filter',
        `url(#${item.closest('.legend').selectAll('.filter-brightness').attr('id')})`
      );
    item.selectAll('.label').attr('text-decoration', 'underline');
  } else {
    item.selectAll('.symbol').attr('filter', null);
    item.selectAll('.label').attr('text-decoration', null);
  }
}

export function legendItemFindByLabel(
  container: Selection,
  label: string
): Selection<SVGGElement, DataLegendItem> {
  return findByDataProperty<SVGGElement, DataLegendItem>(container, '.legend-item', 'label', label);
}

export function legendItemFindByIndex(
  container: Selection,
  index: number
): Selection<SVGGElement, DataLegendItem> {
  return findByIndex<SVGGElement, DataLegendItem>(container, '.legend-item', index);
}
