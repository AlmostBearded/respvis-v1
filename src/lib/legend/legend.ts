import { select, Selection } from 'd3-selection';
import { arrayIs, debug, nodeToString, classOneOfEnum, Rect, rectFromString } from '../core';
import { pathRect } from '../core/utility/path';

export enum LegendPosition {
  Top = 'with-legend-top',
  Right = 'with-legend-right',
  Bottom = 'with-legend-bottom',
  Left = 'with-legend-left',
}

export function classLegendPosition(selection: Selection, position: LegendPosition): void {
  classOneOfEnum(selection, LegendPosition, position);
}

export enum LegendOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export function classLegendOrientation(selection: Selection, orientation: LegendOrientation): void {
  classOneOfEnum(selection, LegendOrientation, orientation);
}

export interface LegendItem {
  label: string;
  index: number;
  symbol: (pathElement: SVGPathElement, bounds: Rect) => void;
  key: string;
}

export interface Legend {
  title: string;
  labels: string[];
  symbols:
    | ((symbol: SVGPathElement, bounds: Rect) => void)
    | ((symbol: SVGPathElement, bounds: Rect) => void)[];
  indices?: number[];
  keys?: string[];
}

export function legendData(data: Partial<Legend>): Legend {
  const labels = data.labels || [];
  return {
    title: data.title || '',
    labels,
    symbols: data.symbols || ((e, b) => pathRect(select(e), b)),
    keys: data.keys,
  };
}

export function legendCreateItems(legendData: Legend): LegendItem[] {
  const { labels, indices, symbols, keys } = legendData;

  return labels.map((l, i) => {
    return {
      label: l,
      index: indices === undefined ? i : indices[i],
      symbol: arrayIs(symbols) ? symbols[i] : symbols,
      key: keys === undefined ? l : keys[i],
    };
  });
}

export function legend(selection: Selection<Element, Legend>): void {
  selection.classed('legend', true);
  selection.append('text').classed('title', true).classed('horizontal', true);

  selection.append('g').classed('items', true);

  selection.on('mouseover.legend mouseout.legend', (e: MouseEvent) => {
    const item = (<Element>e.target).closest('.legend-item');
    if (item) {
      item.classList.toggle('highlight', e.type.endsWith('over'));
    }
  });

  selection
    .on('datachange.legend', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.legend', function (e, d) {
      debug(`render squares legend on ${nodeToString(this)}`);
      const legend = select<Element, Legend>(this);

      legend.selectAll('.title').text(d.title);

      legend
        .selectAll('.items')
        .selectAll<SVGGElement, LegendItem>('.legend-item')
        .data(legendCreateItems(d), (d) => d.label)
        .join(
          (enter) =>
            enter
              .append('g')
              .classed('legend-item', true)
              .call((itemS) =>
                itemS
                  .append('path')
                  .classed('symbol', true)
                  .on('render.symbol', function (e, d) {
                    d.symbol(this, rectFromString(this.getAttribute('bounds')!));
                  })
              )
              .call((itemS) => itemS.append('text').classed('label', true))
              .call((s) => legend.dispatch('enter', { detail: { selection: s } })),
          undefined,
          (exit) => exit.remove().call((s) => legend.dispatch('exit', { detail: { selection: s } }))
        )
        .each((d, i, g) => select(g[i]).selectAll('.label').text(d.label))
        .attr('index', (d) => d.index)
        .attr('data-key', (d) => d.key)
        .call((s) => legend.dispatch('update', { detail: { selection: s } }));
    });
}
