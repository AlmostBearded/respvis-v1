import { BaseType, Selection } from 'd3-selection';

export function chart<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection
    .classed('chart', true)
    .layout('position', 'absolute')
    .layout('top', 0)
    .layout('bottom', 0)
    .layout('left', 0)
    .layout('right', 0);
}

// export function applyLayout(selection: Selection<Element, any, BaseType, any>): void {
//   selection.each(function () {
//     const s = select(this);
//     const hasLayout = s.attr('layout') !== null;
//     if (hasLayout) {
//       const isSVG = this.tagName === 'svg';
//       s.call(isSVG ? applyLayoutAsSVGAttrs : applyLayoutAsTransformAttr);
//       selectAll(this.children).call(applyLayout);
//     }
//   });
// }

// export function applyLayoutAsSVGAttrs(selection: Selection<SVGSVGElement, any, any, any>): void {
//   selection.each(function () {
//     const s = select(this);
//     const layoutAttr = s.attr('layout');
//     console.assert(layoutAttr);
//     const layout = rectFromString(layoutAttr);
//     s.attr('viewBox', rectToString({ ...layout, x: 0, y: 0 }))
//       .attr('x', layout.x)
//       .attr('y', layout.y)
//       .attr('width', layout.width)
//       .attr('height', layout.height);
//   });
// }

// export function applyLayoutAsTransformAttr(selection: Selection<SVGElement, any, any, any>): void {
//   selection.each(function () {
//     const s = select(this);
//     const layoutAttr = s.attr('layout');
//     console.assert(layoutAttr);
//     const layout = rectFromString(layoutAttr);

//     // todo: comment this code

//     const previousTransform: string = s.property('previous-transform') || '';
//     let transform = s.attr('transform') || '';
//     if (previousTransform === transform) {
//       transform = transform.substring(transform.indexOf(')') + 1);
//     }
//     transform = `translate(${layout.x}, ${layout.y})${transform}`;
//     s.attr('transform', transform).property('previous-transform', transform);
//   });
// }

// todo: should the resize listener be subscribed automatically like this?
// select(window).on('resize.charts', function () {
//   updateChart(broadcastEvent(selectAll('.chart'), 'resize'));
// });
