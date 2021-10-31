import { Selection } from 'd3-selection';
import { toolDownloadSVG } from '.';
import { layouter, resizeEventListener, Layouter } from '../core';
import { toolbar } from './toolbar';

export type ChartWindowSelection<Data> = Selection<HTMLDivElement, Partial<Data>>;

export function chartWindow<Data>(selection: ChartWindowSelection<Data>): void {
  selection.classed('chart-window', true);

  selection
    .selectAll<HTMLDivElement, null>('.toolbar')
    .data([null])
    .join('div')
    .call((s) => toolbar(s));

  selection
    .selectAll<HTMLDivElement, Layouter>('.layouter')
    .data([null])
    .join('div')
    .call((s) => layouter(s));

  resizeEventListener(selection);
}

export function chartWindowAddDownloadSVGTool(selection: ChartWindowSelection<unknown>): void {
  selection
    .selectAll('.menu-tools > .items')
    .selectAll<HTMLLIElement, unknown>('.tool-save-svg')
    .data([null])
    .join('li')
    .call((s) => toolDownloadSVG(s));
}
