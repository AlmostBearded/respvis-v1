import { select, Selection } from 'd3';
import { arrayIs, Rect, rectFromSize, rectFromString, Size } from '../core';
import { pathRect } from '../core/utilities/path';

export enum LegendOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface LegendItem {
  label: string;
  styleClass: string;
  symbol: (pathElement: SVGPathElement, size: Size) => void;
  key: string;
}

export interface Legend {
  title: string;
  labels: string[];
  symbols:
    | ((symbol: SVGPathElement, size: Size) => void)
    | ((symbol: SVGPathElement, size: Size) => void)[];
  styleClasses: string | string[];
  keys?: string[];
}

export function legendData(data: Partial<Legend>): Legend {
  const labels = data.labels || [];
  return {
    title: data.title || '',
    labels,
    styleClasses: data.styleClasses || labels.map((l, i) => `categorical-${i}`),
    symbols: data.symbols || ((e, s) => pathRect(e, rectFromSize(s))),
    keys: data.keys,
  };
}

export function legendCreateItems(legendData: Legend): LegendItem[] {
  const { labels, styleClasses, symbols, keys } = legendData;

  return labels.map((l, i) => {
    return {
      label: l,
      styleClass: arrayIs(styleClasses) ? styleClasses[i] : styleClasses,
      symbol: arrayIs(symbols) ? symbols[i] : symbols,
      key: keys === undefined ? l : keys[i],
    };
  });
}

export function legendRender(selection: Selection<Element, Legend>): void {
  selection.classed('legend', true).each((legendD, i, g) => {
    const legendS = select<Element, Legend>(g[i]);

    legendS
      .selectAll('.title')
      .data([null])
      .join('text')
      .classed('title', true)
      .text(legendD.title);

    const itemS = legendS.selectAll('.items').data([null]).join('g').classed('items', true);

    itemS
      .selectAll<SVGGElement, LegendItem>('.legend-item')
      .data(legendCreateItems(legendD), (d) => d.label)
      .join(
        (enter) =>
          enter
            .append('g')
            .classed('legend-item', true)
            .call((itemS) => itemS.append('path').classed('symbol', true))
            .call((itemS) => itemS.append('text').classed('label', true))
            .call((s) => legendS.dispatch('enter', { detail: { selection: s } })),
        undefined,
        (exit) => exit.remove().call((s) => legendS.dispatch('exit', { detail: { selection: s } }))
      )
      .each((itemD, i, g) => {
        const itemS = select(g[i]);
        itemS.selectAll('.label').text(itemD.label);
        itemS.selectAll<SVGPathElement, any>('.symbol').call((symbolS) => {
          const boundsAttr = symbolS.attr('bounds');
          if (!boundsAttr) return;
          itemD.symbol(symbolS.node()!, rectFromString(boundsAttr));
        });
      })
      .attr('data-style', (d) => d.styleClass)
      .attr('data-key', (d) => d.key)
      .call((s) => legendS.dispatch('update', { detail: { selection: s } }));
  });

  selection.on('mouseover.legend mouseout.legend', (e: MouseEvent) => {
    const item = (<Element>e.target).closest('.legend-item');
    if (item) {
      item.classList.toggle('highlight', e.type.endsWith('over'));
    }
  });
}