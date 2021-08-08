import { select, Selection, ValueFn } from 'd3-selection';

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
    const chartS = select(g[i]),
      parentS = select(g[i].parentElement!),
      parentInnerHTML = parentS.html(),
      chartOuterHTML = parentInnerHTML
        .match(/<svg.*class=.*chart.*<\/svg>/)![0]
        .replace(/ (style|layout|bounds)=".*?"/g, ''),
      chartBlob = new Blob([chartOuterHTML], {
        type: 'image/svg+xml;charset=utf-8',
      }),
      chartURL = URL.createObjectURL(chartBlob),
      anchor = document.createElement('a'),
      anchorDownloadAttr = fileName instanceof Function ? fileName.call(g[i], d, i, g) : fileName;

    anchor.href = chartURL;
    anchor.download = anchorDownloadAttr;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  });
}
