import { AxisScale, scaleLinear, ScaleLinear, scalePoint, select, Selection, style } from 'd3';
import { Position, ScaleAny, rectFromString, arrayIs, pathLine } from '../core';

export interface Line {
  positions: Position[];
  styleClass: string;
  key: string;
}

export interface SeriesLine {
  xValues: any[][];
  xScale: ScaleAny<any, number, number>;
  yValues: any[][];
  yScale: ScaleAny<any, number, number>;
  styleClasses: string | string[];
  keys: string[];
}

export function seriesLineData(data: Partial<SeriesLine>): SeriesLine {
  const xValues = data.xValues || [];
  const yValues = data.yValues || [];
  const xScale =
    data.xScale || typeof xValues?.[0]?.[0] === 'number'
      ? scaleLinear().domain([
          Math.min(...xValues.map((a) => Math.min(...a))),
          Math.max(...xValues.map((a) => Math.max(...a))),
        ])
      : scalePoint().domain(new Set(xValues.flat()));
  const yScale =
    data.yScale || typeof yValues?.[0]?.[0] === 'number'
      ? scaleLinear().domain([
          Math.min(...yValues.map((a) => Math.min(...a))),
          Math.max(...yValues.map((a) => Math.max(...a))),
        ])
      : scalePoint().domain(new Set(yValues.flat()));
  const styleClasses = data.styleClasses || 'categorical-0';
  const keys = data.keys || xValues.map((c, i) => i.toString());

  return { xValues, yValues, xScale, yScale, styleClasses, keys };
}

export function seriesLineRender(selection: Selection<Element, SeriesLine>): void {
  selection
    .classed('series-line', true)
    .attr('data-ignore-layout-children', true)
    .each((seriesD, i, g) => {
      const seriesS = select<Element, SeriesLine>(g[i]);
      const boundsStr = seriesS.attr('bounds');
      if (!boundsStr) return;

      const bounds = rectFromString(boundsStr);
      const { xValues, yValues, xScale, yScale, keys, styleClasses } = seriesD;
      xScale.range([0, bounds.width]);
      yScale.range([bounds.height, 0]);

      const lines: Line[] = xValues.map((xValues, lineIndex) => ({
        positions: xValues.map((xValue, pointIndex) => ({
          x: xScale(xValue)!,
          y: yScale(yValues[lineIndex][pointIndex])!,
        })),
        key: keys[lineIndex],
        styleClass: arrayIs(styleClasses) ? styleClasses[lineIndex] : styleClasses,
      }));

      // todo: enter transition
      // todo: exit transition

      seriesS
        .selectAll<SVGPathElement, Line>('path')
        .data(lines, (d) => d.key)
        .join(
          (enter) =>
            enter
              .append('path')
              .classed('line', true)
              .call((s) => seriesS.dispatch('enter', { detail: { selection: s } })),
          undefined,
          (exit) =>
            exit.remove().call((s) => seriesS.dispatch('exit', { detail: { selection: s } }))
        )
        .each((lineD, i, g) => {
          pathLine(g[i], lineD.positions);
        })
        .attr('data-style', (d) => d.styleClass)
        .attr('data-key', (d) => d.key)
        .call((s) => seriesS.dispatch('update', { detail: { selection: s } }));
    })
    .on('mouseover.serieslinehighlight mouseout.serieslinehighlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    );
}
