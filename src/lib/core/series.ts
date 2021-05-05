import { Selection } from 'd3-selection';

export interface DataSeries<Datum> {
  data: ((selection: Selection<Element>) => Datum[]) | Datum[];
  key: (datum: Datum, index: number) => string | number;
}

export function dataSeries<SeriesDatum>(
  data?: Partial<DataSeries<SeriesDatum>>
): DataSeries<SeriesDatum> {
  return {
    data: data?.data || ((s) => []),
    key: data?.key || ((d, i) => i),
  };
}
