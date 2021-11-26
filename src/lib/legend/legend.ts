import { select, Selection } from 'd3-selection';
import { arrayIs, debug, nodeToString, Rect, rectFromString, WritingMode } from '../core';
import { pathRect } from '../core/utility/path';

export enum LegendPosition {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export enum LegendOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface LegendItem {
  label: string;
  styleClass: string;
  symbol: (pathElement: SVGPathElement, bounds: Rect) => void;
  key: string;
}

export interface Legend {
  title: string;
  labels: string[];
  symbols:
    | ((symbol: SVGPathElement, bounds: Rect) => void)
    | ((symbol: SVGPathElement, bounds: Rect) => void)[];
  styleClasses: string | string[];
  keys?: string[];
}

export function legendData(data: Partial<Legend>): Legend {
  const labels = data.labels || [];
  return {
    title: data.title || '',
    labels,
    styleClasses: data.styleClasses || labels.map((l, i) => `categorical-${i}`),
    symbols: data.symbols || ((e, b) => pathRect(select(e), b)),
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

export function legend(selection: Selection<Element, Legend>): void {
  selection.classed('legend', true);
  selection.append('text').classed('title', true).attr('data-orientation', WritingMode.Horizontal);

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
        .attr('data-style', (d) => d.styleClass)
        .attr('data-key', (d) => d.key)
        .call((s) => legend.dispatch('update', { detail: { selection: s } }));
    });
}
