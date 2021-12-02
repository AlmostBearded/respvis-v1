import { select, Selection, ValueFn } from 'd3-selection';
import {
  elementComputedStyleWithoutDefaults,
  elementSVGPresentationAttrs,
} from '../utility/element';

// TODO: maybe SVGO could be used to optimize the downloaded SVG? https://github.com/svg/svgo

export function toolDownloadSVG(selection: Selection<HTMLLIElement>): void {
  selection
    .classed('tool-save-svg', true)
    .text('Download SVG')
    .on('click', function () {
      select(this.closest('.chart-window'))
        .selectAll<SVGSVGElement, unknown>('.layouter > svg.chart')
        .call((s) => chartSaveSVG(s, 'chart.svg'));
    });
}

export function chartSaveSVG<Datum>(
  chartSelection: Selection<SVGSVGElement, Datum>,
  fileName: string | ValueFn<SVGSVGElement, Datum, string>
): void {
  chartSelection.each((d, i, g) => {
    const clonedChart = <Element>g[i].cloneNode(true);
    attrsFromComputedStyle(clonedChart, g[i]);

    const cloneContainer = document.createElement('div');
    cloneContainer.append(clonedChart);

    const cloneHTML = cloneContainer.innerHTML.replace(
      / (style|layout|bounds|data-ignore-layout|data-ignore-layout-children)=".*?"/g,
      ''
    );

    const blobType = 'image/svg+xml;charset=utf-8';
    const blob = new Blob([cloneHTML], { type: blobType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    fileName = fileName instanceof Function ? fileName.call(g[i], d, i, g) : fileName;

    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  });
}

function attrsFromComputedStyle(target: Element, source: Element): void {
  const style = elementComputedStyleWithoutDefaults(source, elementSVGPresentationAttrs);
  for (let prop in style) {
    target.setAttribute(prop, style[prop]);
  }
  for (let i = 0; i < source.children.length; ++i) {
    attrsFromComputedStyle(target.children[i], source.children[i]);
  }
}
