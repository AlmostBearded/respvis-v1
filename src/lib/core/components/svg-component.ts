// import { BaseChartComponent } from '../chart-component';
// import { rectFromString, rectToString } from '../rect';

// export function svg(): BaseChartComponent {
//   return new BaseChartComponent('svg')
//     .layout('grid-template', '1fr / 1fr')
//     .on('afterlayout.svg', (e, d) => {
//       // todo: better if layout attribute is mandatory on all chart components?
//       const layoutAttr = this.attr('layout');
//       if (layoutAttr !== null) {
//         const layout = rectFromString(layoutAttr);
//         this.attr('viewBox', rectToString({ ...layout, x: 0, y: 0 }))
//           .attr('x', layout.x)
//           .attr('y', layout.y)
//           .attr('width', layout.width)
//           .attr('height', layout.height);
//       }
//     });
// }
