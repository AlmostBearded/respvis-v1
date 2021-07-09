import { Selection } from 'd3-selection';

export interface DataSeriesGenerator<Datum> {
  dataGenerator: (selection: Selection<Element, this>) => Datum[];
}
