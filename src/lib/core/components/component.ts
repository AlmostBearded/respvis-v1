import { Selection, BaseType, ValueFn, create } from 'd3-selection';
import { Constructor } from '../mixins/constructor';
import { Chart } from './chart';

// export interface Component {
//   init(): this;
//   onRender(callback: (component: this) => void): this;
//   onTransition(callback: (component: this) => void): this;
//   onUpdate(callback: (component: this) => void): this;
//   onMediaQuery(
//     mediaQuery: string,
//     matchCallback: (component: this) => void,
//     unmatchCallback: (component: this) => void
//   ): this;
//   chart(): Chart;
//   chart(chart: Chart): this;
//   render(): this;
//   transition(): this;
//   update(): this;
//   call(callback: (component: this) => void): this;
//   selection(): Selection<SVGElement, any, BaseType, any>;
//   select<DescElement extends BaseType>(
//     selector: string
//   ): Selection<DescElement, any, BaseType, any>;
//   selectAll<DescElement extends BaseType, OldDatum>(
//     selector: string
//   ): Selection<DescElement, OldDatum, BaseType, any>;

//   attr(name: string): string;
//   attr(name: string, value: null): this;
//   attr(name: string, value: string | number | boolean): this;

//   classed(names: string): boolean;
//   classed(names: string, value: boolean): this;
//   classed(names: string, value?: boolean): boolean | this;

//   style(name: string): string;
//   style(name: string, value: null): this;
//   style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
//   style(
//     name: string,
//     value?: null | string | number | boolean,
//     priority?: 'important' | null
//   ): string | this;

//   property(name: string): any;
//   property(name: string, value: null): this;
//   property(name: string, value: any): this;
//   property(name: string, value?: any): any;

//   text(): string;
//   text(value: null): this;
//   text(value: string | number | boolean): this;
//   text(value?: null | string | number | boolean): string | this;

//   html(): string;

//   raise(): this;

//   lower(): this;

//   append<K extends keyof HTMLElementTagNameMap>(
//     type: K
//   ): Selection<HTMLElementTagNameMap[K], any, SVGElement, any>;
//   append<ChildElement extends BaseType>(
//     type: string
//   ): Selection<ChildElement, any, SVGElement, any>;
//   append<ChildElement extends BaseType>(
//     type: ValueFn<SVGElement, any, ChildElement>
//   ): Selection<ChildElement, any, SVGElement, any>;

//   node(): SVGElement;
// }

// export function Component(selection: Selection<SVGElement, any, any, any>) {

// }

export class Component {
  private _chart: Chart;
  private _selection: Selection<SVGElement, any, any, any>;
  private _onRender: (component: this) => void;
  private _onTransition: (component: this) => void;
  private _onUpdate: (component: this) => void;
  private _onMediaQueries: [string, (component: this) => void, (component: this) => void][];

  constructor(selection: Selection<SVGElement, any, BaseType, any>);
  constructor();
  constructor(selection?: Selection<SVGElement, any, BaseType, any>) {
    if (selection === undefined) selection = create(`svg:g`);
    this._selection = selection;
    this._onRender = () => {};
    this._onTransition = () => {};
    this._onUpdate = () => {};
    this._onMediaQueries = [];
    this.init();
  }

  static create<T extends Component>(
    this: new (selection?: Selection<SVGElement, any, BaseType, any>) => T
  ): T;
  static create<T extends Component>(
    this: new (selection?: Selection<SVGElement, any, BaseType, any>) => T,
    tag: string
  ): T;
  static create<T extends Component>(
    this: new (selection?: Selection<SVGElement, any, BaseType, any>) => T,
    tag?: string
  ): T {
    if (tag === undefined) return new this();
    return new this(create(`svg:${tag}`));
  }

  init(): this {
    return this;
  }

  onRender(callback: (component: this) => void): this {
    this._onRender = callback;
    return this;
  }

  onTransition(callback: (component: this) => void): this {
    this._onTransition = callback;
    return this;
  }

  onUpdate(callback: (component: this) => void): this {
    this._onUpdate = callback;
    return this;
  }

  onMediaQuery(
    mediaQuery: string,
    matchCallback: (component: this) => void,
    unmatchCallback: (component: this) => void
  ): this {
    // todo: implement deletion of callbacks/queries
    this._onMediaQueries.push([mediaQuery, matchCallback, unmatchCallback]);
    return this;
  }

  chart(): Chart;
  chart(chart: Chart): this;
  chart(chart?: Chart): Chart | this {
    if (chart === undefined) return this._chart;
    this._chart = chart;
    return this;
  }

  render(): this {
    this._onRender(this);
    return this;
  }

  transition(): this {
    this._onTransition(this);
    return this;
  }

  layout(): this {
    return this;
  }

  update(): this {
    this._onUpdate(this);
    for (let i = 0; i < this._onMediaQueries.length; ++i) {
      if (window.matchMedia(this._onMediaQueries[i][0]).matches) this._onMediaQueries[i][1](this);
      else this._onMediaQueries[i][2](this);
    }
    return this;
  }

  call(callback: (component: this) => void): this {
    callback(this);
    return this;
  }

  selection(): Selection<SVGElement, any, BaseType, any> {
    return this._selection;
  }

  select<DescElement extends BaseType>(
    selector: string
  ): Selection<DescElement, any, BaseType, any> {
    return this._selection.select(selector);
  }

  selectAll<DescElement extends BaseType, OldDatum>(
    selector: string
  ): Selection<DescElement, OldDatum, BaseType, any> {
    return this._selection.selectAll(selector);
  }

  attr(name: string): string;
  attr(name: string, value: null): this;
  attr(name: string, value: string | number | boolean): this;
  attr(name: string, value?: null | string | number | boolean): string | this {
    if (value === undefined) return this._selection.attr(name);
    if (value === null) this._selection.attr(name, null);
    else this._selection.attr(name, value);
    return this;
  }

  classed(names: string): boolean;
  classed(names: string, value: boolean): this;
  classed(names: string, value?: boolean): boolean | this {
    if (value === undefined) return this._selection.classed(names);
    this._selection.classed(names, value);
    return this;
  }

  style(name: string): string;
  style(name: string, value: null): this;
  style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
  style(
    name: string,
    value?: null | string | number | boolean,
    priority?: 'important' | null
  ): string | this {
    if (value === undefined) return this._selection.style(name);
    if (value === null) this._selection.style(name, null);
    else this._selection.style(name, value, priority);
    return this;
  }

  property(name: string): any;
  property(name: string, value: null): this;
  property(name: string, value: any): this;
  property(name: string, value?: any): any {
    if (value === undefined) return this._selection.property(name);
    this._selection.property(name, value);
    return this;
  }

  text(): string;
  text(value: null): this;
  text(value: string | number | boolean): this;
  text(value?: null | string | number | boolean): string | this {
    if (value === undefined) return this._selection.text();
    if (value === null) this._selection.text(null);
    else this._selection.text(value);
    return this;
  }

  html(): string {
    return this._selection.html();
  }

  raise(): this {
    this._selection.raise();
    return this;
  }

  lower(): this {
    this._selection.lower();
    return this;
  }

  append<K extends keyof HTMLElementTagNameMap>(
    type: K
  ): Selection<HTMLElementTagNameMap[K], any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: string
  ): Selection<ChildElement, any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: ValueFn<SVGElement, any, ChildElement>
  ): Selection<ChildElement, any, SVGElement, any>;
  append(type: any): any {
    return this._selection.append(type);
  }

  node(): SVGElement {
    return this._selection.node()!;
  }
}

export function isComponent(arg: any): arg is Component {
  return arg && arg.render;
}
