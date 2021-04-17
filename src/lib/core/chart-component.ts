import { Selection } from 'd3-selection';
import { BaseComponent } from './component';
import { LayoutProperties } from './layout/layout';
import { withChildren } from './mixins/children-mixin';

export class BaseChartComponent<
  TInputProperties extends Record<string, any> = {},
  TOutputProperties extends Record<string, any> = {}
> extends BaseComponent<TInputProperties, TOutputProperties> {
  // private _configurators: Map<number, (component: this) => void>;
  // private _configuratorOrders: number[];

  constructor(selection: Selection<Element, any, any, any>) {
    super(selection);

    // this._configurators = new Map();
    // this._configuratorOrders = [];

    this.layout('grid-area', '1 / 1 / 2 / 2');

    // pass chart component events to children
    for (const eventType in ['configure', 'beforelayout', 'afterlayout', 'render', 'transition']) {
      this.on(`${eventType}.propagate`, (e, d) =>
        this.children().forEach((c) => c.dispatch(eventType))
      );
    }

    // can't access 'this' within the bounds calculator callback
    const that = this;
    this.selection().layoutBoundsCalculator(() => that.selection().node()!.getBoundingClientRect());
  }

  // todo: what happens when multiple configurators with the same order are added?
  // - rename order parameter to index?
  // configurator(order: number): ((component: this) => void) | undefined;
  // configurator(order: number, callback: null): this;
  // configurator(order: number, callback: (component: this) => void): this;
  // configurator(
  //   order: number,
  //   callback?: ((component: this) => void) | null
  // ): ((component: this) => void) | undefined | this {
  //   if (callback === undefined) return this._configurators.get(order);
  //   else if (callback === null) {
  //     this._configurators.delete(order);
  //     this._configuratorOrders.splice(this._configuratorOrders.indexOf(order), 1);
  //   } else {
  //     this._configurators.set(order, callback);
  //     this._configuratorOrders.push(order);
  //     this._configuratorOrders.sort((a, b) => a - b);
  //   }
  //   return this;
  // }

  // mediaQueryConfigurator(
  //   order: number,
  //   mediaQuery: string,
  //   callback: (component: this) => void
  // ): this {
  //   return this.configurator(
  //     order,
  //     (component) => window.matchMedia(mediaQuery).matches && callback(component)
  //   );
  // }

  // configure(): this {
  //   for (let i = 0; i < this._configuratorOrders.length; ++i)
  //     this._configurators.get(this._configuratorOrders[i])!(this);
  //   return this;
  // }

  // beforeLayout(): this {
  //   return this;
  // }

  // afterLayout(): this {
  //   return this;
  // }

  // render(): this {
  //   return this;
  // }

  // transition(): this {
  //   return this;
  // }

  layout(name: keyof LayoutProperties): string | number | undefined;
  layout(name: keyof LayoutProperties, value: string | number): this;
  layout(name: keyof LayoutProperties, value: null): this;
  layout(
    name: keyof LayoutProperties,
    value?: string | number | null
  ): string | number | undefined | this {
    if (value === undefined) return this.selection().layout(name);
    if (value === null) this.selection().layout(name, null);
    else this.selection().layout(name, value);
    return this;
  }
}

// export class BaseChartCompositeComponent extends withChildren<
//   BaseChartComponent,
//   typeof BaseChartComponent
// >(BaseChartComponent) {
//   configure(): this {
//     super.configure();
//     this.children().forEach((c) => c.configure());
//     return this;
//   }

//   beforeLayout(): this {
//     super.beforeLayout();
//     this.children().forEach((c) => c.beforeLayout());
//     return this;
//   }

//   afterLayout(): this {
//     super.afterLayout();
//     this.children().forEach((c) => c.afterLayout());
//     return this;
//   }

//   render(): this {
//     super.render();
//     this.children().forEach((c) => c.render());
//     return this;
//   }

//   transition(): this {
//     super.transition();
//     this.children().forEach((c) => c.transition());
//     return this;
//   }
// }
