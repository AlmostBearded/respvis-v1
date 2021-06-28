import { Selection } from 'd3-selection';
import { DataLegend, DataLegendItem } from './legend';

export interface DataLegendSquares extends DataLegend {
  labels: string[];
  colors: string | string[] | ((label: string) => string);
  sizes: string | string[] | ((label: string) => string);
}

export function dataLegendSquares(data: Partial<DataLegendSquares>): DataLegendSquares {
  return {
    labels: data.labels || [],
    colors: data.colors || '#000000',
    sizes: data.sizes || '0.7em',
    title: data.title || '',
    dataGenerator: data.dataGenerator || dataLegendItemSquareGenerator,
  };
}

export function dataLegendItemSquareGenerator(
  selection: Selection<Element, DataLegendSquares>
): DataLegendItem[] {
  const seriesDatum = selection.datum();

  return seriesDatum.labels.map((l, i) => {
    const color =
      typeof seriesDatum.colors === 'string'
        ? seriesDatum.colors
        : Array.isArray(seriesDatum.colors)
        ? seriesDatum.colors[i]
        : seriesDatum.colors instanceof Function
        ? seriesDatum.colors(l)
        : '#232323';
    const size =
      typeof seriesDatum.sizes === 'string'
        ? seriesDatum.sizes
        : Array.isArray(seriesDatum.sizes)
        ? seriesDatum.sizes[i]
        : seriesDatum.sizes instanceof Function
        ? seriesDatum.sizes(l.toString())
        : '1em';
    return {
      label: l,
      symbolTag: 'rect',
      symbolAttributes: [
        ...['width', 'height'].map((name) => ({ name: name, value: size })),
        { name: 'fill', value: color },
      ],
    };
  });
}
