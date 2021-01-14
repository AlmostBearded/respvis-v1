import { Selection, BaseType, create, ValueFn } from 'd3-selection';
import { Chart } from './chart';
import { Component, isComponent } from './component';

// static setEventListeners(component: GroupComponent, config: IGroupComponentConfig) {
//   for (const typenames in config.events) {
//     component.selection().on(typenames, (e: Event) => {
//       let childElement = e.target as Element;
//       while (childElement.parentNode !== e.currentTarget) {
//         childElement = childElement.parentNode as Element;
//       }

//       const indexOf = Array.prototype.indexOf;
//       const childIndex = indexOf.call(childElement.parentNode!.children, childElement);

//       config.events[typenames](e, {
//         component: component,
//         childIndex: childIndex,
//       });
//     });
//   }
// }

export class ContainerComponent extends Component {
  private _children: Component[];

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:g'));
  }

  init(): this {
    super.init();
    this._children = [];
    return this;
  }

  // parent append signatures
  append<K extends keyof HTMLElementTagNameMap>(
    type: K
  ): Selection<HTMLElementTagNameMap[K], any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: string
  ): Selection<ChildElement, any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: ValueFn<SVGElement, any, ChildElement>
  ): Selection<ChildElement, any, SVGElement, any>;
  // new append signature
  append<ChildComponent extends Component>(component: ChildComponent): ChildComponent;
  append(arg: any): any {
    if (!isComponent(arg)) return super.append(arg);
    this.selection().append(() => arg.node());
    this._children.push(arg);
    return arg;
  }

  chart(): Chart;
  chart(chart: Chart): this;
  chart(chart?: Chart): Chart | this {
    if (chart === undefined) return super.chart();
    super.chart(chart);
    this._children.forEach((c) => c.chart(chart));
    return this;
  }

  render(): this {
    super.render();
    this._children.forEach((c) => c.render());
    return this;
  }

  transition(): this {
    super.transition();
    this._children.forEach((c) => c.transition());
    return this;
  }

  update(): this {
    super.update();
    this._children.forEach((c) => c.update());
    return this;
  }

  layout(): this {
    super.layout();
    this._children.forEach((c) => c.layout());
    return this;
  }
}
