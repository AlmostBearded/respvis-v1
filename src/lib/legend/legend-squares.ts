import { select, Selection } from 'd3-selection';
import { JoinEvent } from '../bars';
import {
  arrayIs,
  debug,
  findByDataProperty,
  findByIndex,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,
} from '../core';
import { filterBrightness } from '../filters';

export interface LegendSquaresItem {
  label: string;
  color: string;
  size: string;
  stroke: string;
  strokeWidth: number;
}

export interface LegendSquares {
  title: string;
  labels: string[];
  colors: string | string[] | ((label: string) => string);
  sizes: string | string[] | ((label: string) => string);
  strokes: string | string[] | ((label: string) => string);
  strokeWidths: number | number[] | ((label: string) => number);
}

export function legendSquaresData(data: Partial<LegendSquares>): LegendSquares {
  return {
    labels: data.labels || [],
    colors: data.colors || '#000000',
    sizes: data.sizes || '0.7em',
    strokes: data.strokes || '#000',
    strokeWidths: data.strokeWidths || 1,
    title: data.title || '',
  };
}

export function legendSquaresCreateItems(legendData: LegendSquares): LegendSquaresItem[] {
  const { labels, colors, sizes, strokes, strokeWidths } = legendData;

  return labels.map((l, i) => {
    const color = typeof colors === 'string' ? colors : arrayIs(colors) ? colors[i] : colors(l);
    const size = typeof sizes === 'string' ? sizes : arrayIs(sizes) ? sizes[i] : sizes(l);
    const stroke =
      typeof strokes === 'string' ? strokes : arrayIs(strokes) ? strokes[i] : strokes(l);
    const strokeWidth =
      typeof strokeWidths === 'number'
        ? strokeWidths
        : arrayIs(strokeWidths)
        ? strokeWidths[i]
        : strokeWidths(l);
    return {
      label: l,
      color: color,
      size: size,
      stroke: stroke,
      strokeWidth: strokeWidth,
    };
  });
}

export function legendSquares(selection: Selection<Element, LegendSquares>): void {
  selection
    .classed('legend', true)
    .classed('legend-squares', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'column')
    .layout('align-items', 'center')
    .attr('font-size', '0.8em'); // todo: font size incosistent with 0.7em used mostly everywhere else

  selection
    .append('text')
    .classed('title', true)
    .layout('margin', '0 0.5em')
    .call((s) => textHorizontalAttrs(s))
    .call((s) => textTitleAttrs(s));

  selection
    .append('g')
    .classed('items', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'row')
    .layout('justify-content', 'center')
    .layout('align-items', 'flex-start');

  selection
    .append('defs')
    .append('filter')
    .call((s) => filterBrightness(s, 1.3));

  selection.on('mouseover.legend mouseout.legend', (e) => {
    const item = (<Element>e.target).closest('.legend-item');
    if (item) {
      legendItemHighlight(select(item), e.type.endsWith('over'));
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
              .layout('display', 'flex')
              .layout('flex-direction', 'row')
              .layout('justify-content', 'center')
              .layout('margin', '0.25em')
              .call((s) => s.append('rect').classed('symbol', true).layout('margin-right', '0.5em'))
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
        .each((d, i, g) => {
          const s = select(g[i]);
          s.selectAll('.symbol')
            .layout('width', d.size)
            .layout('height', d.size)
            .attr('fill', d.color)
            .attr('stroke', d.stroke)
            .attr('stroke-width', d.strokeWidth);
          s.selectAll('.label').text(d.label.toString());
        })
        .call((s) => legend.dispatch('update', { detail: { selection: s } }));
    });
}

export function legendItemHighlight(items: Selection<Element>, highlight: boolean): void {
  items.each((d, i, g) => {
    const item = select(g[i]);
    if (highlight) {
      select(g[i])
        .selectAll('.symbol')
        .attr(
          'filter',
          `url(#${select(g[i].closest('.legend')).selectAll('.filter-brightness').attr('id')})`
        );
      item.selectAll('.label').attr('text-decoration', 'underline');
    } else {
      item.selectAll('.symbol').attr('filter', null);
      item.selectAll('.label').attr('text-decoration', null);
    }
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
