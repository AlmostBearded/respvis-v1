import { select, Selection } from 'd3-selection';
import {
  arrayIs,
  debug,
  findByDataProperty,
  findByIndex,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,classOneOfEnum
} from '../core';

export enum LegendOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface LegendSquaresItem {
  label: string;
  index: number;
}

export interface LegendSquares {
  title: string;
  labels: string[];
  indices?: number[];
  orientation: LegendOrientation;
}

export function legendSquaresData(data: Partial<LegendSquares>): LegendSquares {
  return {
    title: data.title || '',
    labels: data.labels || [],
    orientation: data.orientation || LegendOrientation.Vertical,
  };
}

export function legendSquaresCreateItems(legendData: LegendSquares): LegendSquaresItem[] {
  const { labels, indices } = legendData;

  return labels.map((l, i) => {
    return {
      label: l,
      index: indices === undefined ? i : indices[i],
    };
  });
}

export function legendSquares(selection: Selection<Element, LegendSquares>): void {
  selection.classed('legend', true).classed('legend-squares', true);
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
      const legend = select<Element, LegendSquares>(this);
      const { orientation } = legend.datum();

      classOneOfEnum(legend, LegendOrientation, orientation);

      legend.selectAll('.title').text(d.title);

      legend
        .selectAll('.items')
        .selectAll<SVGGElement, LegendSquaresItem>('.legend-item')
        .data(legendSquaresCreateItems(d), (d) => d.label)
        .join(
          (enter) =>
            enter
              .append('g')
              .classed('legend-item', true)
              .call((s) => s.append('rect').classed('symbol', true))
              .call((s) =>
                s
                  .append('text')
                  .classed('label', true)
                  .call((s) => textHorizontalAttrs(s))
              )
              .call((s) => legend.dispatch('enter', { detail: { selection: s } })),
          undefined,
          (exit) => exit.remove().call((s) => legend.dispatch('exit', { detail: { selection: s } }))
        )
        .attr('index', (d) => d.index)
        .each((d, i, g) => {
          select(g[i]).selectAll('.label').text(d.label.toString());
        })
        .call((s) => legend.dispatch('update', { detail: { selection: s } }));
    });
}

export function legendItemFindByLabel(
  container: Selection,
  label: string
): Selection<SVGGElement, LegendSquaresItem> {
  return findByDataProperty<SVGGElement, LegendSquaresItem>(
    container,
    '.legend-item',
    'label',
    label
  );
}

export function legendItemFindByIndex(
  container: Selection,
  index: number
): Selection<SVGGElement, LegendSquaresItem> {
  return findByIndex<SVGGElement, LegendSquaresItem>(container, '.legend-item', index);
}
