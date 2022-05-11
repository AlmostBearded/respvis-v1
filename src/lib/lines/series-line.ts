import { AxisScale, scaleLinear, ScaleLinear, scalePoint, select, Selection, style } from 'd3';
import { Position, ScaleAny, rectFromString, arrayIs, pathLine } from '../core';

export interface Line {
  positions: Position[];
  styleClass: string;
  key: string;
}

export interface SeriesLine {
  xValues: any[];
  xScale: ScaleAny<any, number, number>;
  yValues: any[][];
  yScale: ScaleAny<any, number, number>;
  styleClasses: string | string[];
  keys: string[];
  flipped: boolean;
}

export function seriesLineData(data: Partial<SeriesLine>): SeriesLine {
  const xValues = data.xValues || [];
  const yValues = data.yValues || [];

  // todo: figure out a better way to create default scales
  // todo: what if typeof xValues[0] === Date? scaleUTC?
  // todo: should we support xValues: any[][]?

  const xScale =
    data.xScale || typeof xValues?.[0] === 'number'
      ? scaleLinear()
          .domain([Math.min(...xValues), Math.max(...xValues)])
          .nice()
      : scalePoint().domain(new Set(xValues));
  const yScale =
    data.yScale || typeof yValues?.[0]?.[0] === 'number'
      ? scaleLinear()
          .domain([
            Math.min(...yValues.map((a) => Math.min(...a))),
            Math.max(...yValues.map((a) => Math.max(...a))),
          ])
          .nice()
      : scalePoint().domain(new Set(yValues.flat()));

  const styleClasses = data.styleClasses || yValues.map((_, i) => `categorical-${i}`);
  const keys = data.keys || yValues.map((c, i) => i.toString());
  const flipped = data.flipped || false;

  return { xValues, yValues, xScale, yScale, styleClasses, keys, flipped };
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
      const { xValues, yValues, xScale, yScale, keys, styleClasses, flipped } = seriesD;

      const lines: Line[] = yValues.map((yValues, lineIndex) => ({
        positions: yValues.map((yValue, pointIndex) => {
          const x = xScale(xValues[pointIndex])!;
          const y = yScale(yValue)!;
          return {
            x: flipped ? y : x,
            y: flipped ? x : y,
          };
        }),
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
    .on('pointerover.serieslinehighlight pointerout.serieslinehighlight', (e: PointerEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    );
}
