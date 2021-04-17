// import { select } from 'd3-selection';
// import debounce from 'debounce';
// import { computeLayout } from './layout/layout';
// import { GroupComponent } from './components/group-component';
// import { BaseComponent, BaseCompositeComponent } from './component';
// import { BaseChartCompositeComponent } from './chart-component';

import { BaseType, select, selectAll, Selection } from 'd3-selection';
import { computeLayout } from './layout/layout';
import { rectToString } from './rect';

// export type ConfigureFunction = (chart: Chart) => void;

// export class Chart extends BaseCompositeComponent {
//   private _svg: SVGComponent;
//   private _rootGroup: GroupComponent;

//   constructor() {
//     super('div');
//     this.child(
//       'svg',
//       (this._svg = new SVGComponent())
//         .layout('grid-template', '1fr / 1fr')
//         .classed('chart', true)
//         .style('width', '100%')
//         .style('height', '100%')
//         .child(
//           'root',
//           (this._rootGroup = new GroupComponent().layout('grid-area', '1 / 1 / 2 / 2'))
//         )
//     );
//   }

//   mount(container: Element): this;
//   mount(container: BaseComponent): this;
//   mount(container: Element | BaseComponent): this {
//     super.mount(container as any);

//     // first transition to initialize layout
//     // second transition to actually configure with correct layout
//     this.transition().transition();

//     window.addEventListener('resize', () => this.render());
//     window.addEventListener(
//       'resize',
//       debounce(() => this.transition(), 250)
//     );

//     return this;
//   }

//   render(): this {
//     this._svg.beforeLayout();

//     const bbox = this._svg.selection().node()!.getBoundingClientRect();
//     computeLayout(this._svg.selection().node()!, bbox);

//     this._svg.afterLayout().render();

//     return this;
//   }

//   transition(): this {
//     this._svg.selection().dispatch('configure').dispatch('beforelayout');

//     this._svg.configure().beforeLayout();

//     let bbox = this._svg.selection().node()!.getBoundingClientRect();
//     computeLayout(this._svg.selection().node()!, bbox);

//     this._svg.afterLayout().transition();

//     return this;
//   }

//   svg(): SVGComponent {
//     return this._svg;
//   }

//   root(): GroupComponent {
//     return this._rootGroup;
//   }
// }

// export interface ChartProperties {
//   svg: BaseChartCompositeComponent;
//   root: BaseChartCompositeComponent;
// }

// export function chart(): BaseCompositeComponent {
//   const chart = new BaseCompositeComponent<ChartProperties>('div');
//   chart.child(
//     'svg',
//     (this._svg = new BaseChartCompositeComponent('svg'))
//       .layout('grid-template', '1fr / 1fr')
//       .classed('chart', true)
//       .style('width', '100%')
//       .style('height', '100%')
//       .child(
//         'root',
//         (this._rootGroup = new BaseChartCompositeComponent('g')).layout(
//           'grid-area',
//           '1 / 1 / 2 / 2'
//         )
//       )
//   );

//   return new BaseCompositeComponent('div').child(
//     'svg',
//     (this._svg = new BaseChartCompositeComponent('svg'))
//       .layout('grid-template', '1fr / 1fr')
//       .classed('chart', true)
//       .style('width', '100%')
//       .style('height', '100%')
//       .child(
//         'root',
//         (this._rootGroup = new BaseChartCompositeComponent('g')).layout(
//           'grid-area',
//           '1 / 1 / 2 / 2'
//         )
//       )
//   );
// }

// svg

export function appendSVG<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.append('svg').call(initSVG);
}

export function initSVG(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.on('afterlayout.svg', function () {
    select(this).call(layoutAsSVGAttrs);
  });
}

export function layoutAsSVGAttrs(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.each(function () {
    const s = select(this);
    const layout = s.layout();
    if (!layout) return;
    s.attr('viewBox', rectToString({ ...layout, x: 0, y: 0 }))
      .attr('x', layout.x)
      .attr('y', layout.y)
      .attr('width', layout.width)
      .attr('height', layout.height);
  });
}

// g

export function appendG<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGGElement, Datum, PElement, PDatum> {
  return selection.append('g').call(initG);
}

export function initG(selection: Selection<SVGGElement, any, any, any>): void {
  selection.on('afterrender.g', function () {
    select(this).call(layoutAsTransformAttr);
  });
}

export function layoutAsTransformAttr(selection: Selection<SVGElement, any, any, any>): void {
  selection.each(function () {
    const s = select(this);
    const layout = s.layout();
    if (!layout) return;

    // todo: comment this code

    const previousTransform: string = s.property('previous-transform') || '';
    let transform = s.attr('transform') || '';
    if (previousTransform === transform) {
      transform = transform.substring(transform.indexOf(')') + 1);
    }
    transform = `translate(${layout.x}, ${layout.y})${transform}`;
    s.attr('transform', transform).property('previous-transform', transform);
  });
}

// chart

export function appendChart<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.append('svg').call(initChart);
}

export function initChart(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection
    .call(initSVG)
    .classed('chart', true)
    .style('width', '100%')
    .style('height', '100%')
    .layout('grid-template', '1fr / 1fr')
    .call((s) =>
      s.append('g').call(initG).classed('root', true).layout('grid-area', '1 / 1 / 2 / 2')
    );
}

export function renderChart(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.call(broadcastEvent, 'beforelayout');
  selection.each(function () {
    select(this).call(computeLayout, this.getBoundingClientRect());
  });
  selection
    .call(broadcastEvent, 'afterlayout')
    .call(broadcastEvent, 'render')
    .call(broadcastEvent, 'afterrender');
}

export function broadcastEvent(
  selection: Selection<Element, any, any, any>,
  eventType: string
): void {
  selection.dispatch(eventType).each(function () {
    selectAll(this.children).call(broadcastEvent, eventType);
  });
}

// todo: should the resize listener be subscribed automatically like this?
select(window).on('resize.charts', function () {
  selectAll('.chart').call(renderChart);
});
