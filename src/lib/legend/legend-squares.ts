import { Selection } from 'd3-selection';
import { arrayIs } from '../core';
import { DataLegend, DataLegendItem } from './legend';

export interface DataLegendSquares extends DataLegend {
  labels: string[];
  colors: string | string[] | ((label: string) => string);
  sizes: string | string[] | ((label: string) => string);
  strokes: string | string[] | ((label: string) => string);
  strokeWidths: number | number[] | ((label: string) => number);
}

export function dataLegendSquares(data: Partial<DataLegendSquares>): DataLegendSquares {
  return {
    labels: data.labels || [],
    colors: data.colors || '#000000',
    sizes: data.sizes || '0.7em',
    strokes: data.strokes || '#000',
    strokeWidths: data.strokeWidths || 1,
    title: data.title || '',
    dataGenerator: data.dataGenerator || dataLegendItemSquareGenerator,
  };
}

export function dataLegendItemSquareGenerator(
  selection: Selection<Element, DataLegendSquares>
): DataLegendItem[] {
  const { labels, colors, sizes, strokes, strokeWidths } = selection.datum();

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
      symbolTag: 'rect',
      symbolAttributes: [
        ...['width', 'height'].map((name) => ({ name: name, value: size })),
        { name: 'fill', value: color },
        { name: 'stroke', value: stroke },
        { name: 'stroke-width', value: strokeWidth.toString() },
      ],
    };
  });
}
