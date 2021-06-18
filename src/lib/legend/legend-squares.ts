import { DataLegend, DataLegendItem } from './legend';

export interface DataLegendSquares {
  title: string;
  labels: string[];
  colors: string | string[] | ((label: string) => string);
  sizes: string | string[] | ((label: string) => string);
}

export function dataLegendSquares(data: Partial<DataLegendSquares>): DataLegend {
  return {
    title: data.title || '',
    data: (s) => {
      const labels = data?.labels || [];

      return labels.map((l, i) => {
        const color =
          typeof data.colors === 'string'
            ? data.colors
            : Array.isArray(data.colors)
            ? data.colors[i]
            : data.colors instanceof Function
            ? data.colors(l)
            : '#232323';
        const size =
          typeof data.sizes === 'string'
            ? data.sizes
            : Array.isArray(data.sizes)
            ? data.sizes[i]
            : data.sizes instanceof Function
            ? data.sizes(l.toString())
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
    },
    key: (d) => d.label.toString(),
  };
}
