import { Selection } from 'd3-selection';
import { toolDownloadSVG } from '.';
import { layouter, resizeEventListener } from '../core';
import { toolbarRender } from './toolbar';

export type ChartWindowSelection<Data> = Selection<HTMLDivElement, Data>;

export function chartWindowRender<Data>(selection: ChartWindowSelection<Data>): void {
  selection.classed('chart-window', true);

  selection
    .selectAll<HTMLDivElement, null>('.toolbar')
    .data([null])
    .join('div')
    .call((s) => toolbarRender(s));

  selection
    .selectAll<HTMLDivElement, unknown>('.layouter')
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
