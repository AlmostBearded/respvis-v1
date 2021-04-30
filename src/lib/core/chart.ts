// import { select } from 'd3-selection';
// import debounce from 'debounce';
// import { computeLayout } from './layout/layout';
// import { GroupComponent } from './components/group-component';
// import { BaseComponent, BaseCompositeComponent } from './component';
// import { BaseChartCompositeComponent } from './chart-component';

import { BaseType, create, select, selectAll, Selection } from 'd3-selection';
import { computeLayout } from './layout/layout';
import { rectFromString, rectToString } from './rect';
import { LAYOUT_ATTR_NAMES } from './selection';

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

// chart

export function chart<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection
    .classed('chart', true)
    .style('width', '100%')
    .style('height', '100%')
    .attr('grid-template', '1fr / 1fr')
    .call((s) => s.append('g').classed('root', true).attr('grid-area', '1 / 1 / 2 / 2'))
    .call(renderOnAttributeChange);
}

export function updateChart(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.each(function () {
    select(this).call(computeLayout, this.getBoundingClientRect());
  });
  broadcastEvent(selection, 'render');
  applyLayout(selection);
}

export function applyLayout(selection: Selection<Element, any, BaseType, any>): void {
  selection.each(function () {
    const s = select(this);
    const hasLayout = s.attr('layout') !== null;
    if (hasLayout) {
      const isSVG = this.tagName === 'svg';
      s.call(isSVG ? applyLayoutAsSVGAttrs : applyLayoutAsTransformAttr);
      selectAll(this.children).call(applyLayout);
    }
  });
}

export function applyLayoutAsSVGAttrs(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.each(function () {
    const s = select(this);
    const layoutAttr = s.attr('layout');
    console.assert(layoutAttr);
    const layout = rectFromString(layoutAttr);
    s.attr('viewBox', rectToString({ ...layout, x: 0, y: 0 }))
      .attr('x', layout.x)
      .attr('y', layout.y)
      .attr('width', layout.width)
      .attr('height', layout.height);
  });
}

export function applyLayoutAsTransformAttr(selection: Selection<SVGElement, any, any, any>): void {
  selection.each(function () {
    const s = select(this);
    const layoutAttr = s.attr('layout');
    console.assert(layoutAttr);
    const layout = rectFromString(layoutAttr);

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

export function renderOnAttributeChange(selection: Selection<SVGSVGElement, any, any, any>): void {
  selection.each(function () {
    const mutationObserver = new MutationObserver(
      (mutations: MutationRecord[], observer: MutationObserver) => {
        let changed = false;

        const uniqueMutationsByTargetAttribute = mutations.filter(
          (v, i, array) =>
            array.findIndex(
              (v2) => v2.target === v.target && v2.attributeName === v.attributeName
            ) === i
        );
        // console.log(mutations, uniqueMutationsByTargetAttribute);

        for (let mutation of uniqueMutationsByTargetAttribute) {
          const element = mutation.target as Element;
          const value = element.getAttribute(mutation.attributeName!);
          if (mutation.oldValue !== value) {
            const s = select(mutation.target as Element);
            // todo: comment these conditions
            if (
              s.attr('grid-width') === 'fit' ||
              s.attr('grid-height') === 'fit' ||
              LAYOUT_ATTR_NAMES.indexOf(mutation.attributeName!) >= 0 ||
              !s.selectAll('[grid-width=fit],[grid-height=fit]').empty()
            ) {
              // console.log(mutation.target, mutation.attributeName, mutation.oldValue);
              changed = true;
              break;
            }
          }
        }
        if (changed) {
          selection.call(updateChart);
        }
      }
    );
    mutationObserver.observe(this, {
      attributes: true,
      // attributeFilter: ['font-size', 'transform'],
      attributeOldValue: true,
      subtree: true,
    });
  });
}

export function broadcastEvent<GElement extends Element, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  eventType: string
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.dispatch(eventType).each(function () {
    broadcastEvent(selectAll(this.children), eventType);
  });
}

// todo: should the resize listener be subscribed automatically like this?
select(window).on('resize.charts', function () {
  updateChart(broadcastEvent(selectAll('.chart'), 'resize'));
});
