import {
  create as d3Create,
  select as d3Select,
  selectAll as d3SelectAll,
  Selection,
} from 'd3-selection';
import { withChildren } from './mixins/children-mixin';
import { IDictionary } from './utils';

// export class Component {
//   private _selection: Selection<Element, any, any, any>;
//   // private _children: Map<string, Component>;

//   constructor(tag: string) {
//     this._selection = create(tag);
//     // this._children = new Map();
//   }

//   // todo: 'index' or 'order' instead of 'name'?
//   // - would solve the issue of child order
//   // - 'index' would have to be unique, 'order' not a good idea?
//   // child<TChild extends Component = Component>(name: string): TChild | undefined;
//   // child(name: string, component: null): this;
//   // child(name: string, component: Component): this;
//   // child<TChild extends Component = Component>(
//   //   name: string,
//   //   component?: TChild | null
//   // ): TChild | undefined | this {
//   //   if (component === undefined) return this._children.get(name) as TChild;
//   //   else if (component === null) this._children.delete(name);
//   //   else this._children.set(name, component);
//   //   return this;
//   // }

//   // todo: this is probably very heavy on performance
//   // - if the children would be accessed by index they could be
//   //   stored as an array and this method wouldn't have to create
//   //   artificial ones on every invokation.
//   // children(): Component[] {
//   //   return Array.from(this._children.values());
//   // }

//   mount(container: Element): this;
//   mount(container: Component): this;
//   mount(container: Element | Component): this {
//     const containerElement = container instanceof Element ? container : container.node();
//     containerElement.appendChild(this.node());
//     // this.children().forEach((c) => c.mount(this));
//     return this;
//   }

//   call(callback: (component: this, ...args: any[]) => void, ...args: any[]): this {
//     callback(this, ...args);
//     return this;
//   }

//   selection(): Selection<Element, any, any, any> {
//     return this._selection;
//   }

//   size(): ISize {
//     return this.node().getBoundingClientRect();
//   }

//   attr(name: string): string | null;
//   attr(name: string, value: null): this;
//   attr(name: string, value: string | number | boolean): this;
//   attr(name: string, value: string | number | boolean, transitionDuration: number): this;
//   attr(
//     name: string,
//     value: string | number | boolean,
//     transitionDuration: number,
//     transitionDelay: number
//   ): this;
//   attr(
//     name: string,
//     value?: null | string | number | boolean,
//     transitionDuration?: number,
//     transitionDelay?: number
//   ): string | null | this {
//     if (value === undefined) return this._getAttr(name);
//     if (value === null) this._removeAttr(name);
//     else if (transitionDuration === undefined) this._setAttr(name, value);
//     else this._transitionAttr(name, value, transitionDuration, transitionDelay || 0);
//     return this;
//   }

//   protected _getAttr(name: string): string | null {
//     return this.selection().attr(name);
//   }

//   protected _removeAttr(name: string): void {
//     this.selection().attr(name, null);
//   }

//   protected _setAttr(name: string, value: string | number | boolean): void {
//     this.selection().attr(name, value);
//   }

//   protected _transitionAttr(
//     name: string,
//     value: string | number | boolean,
//     transitionDuration: number,
//     transitionDelay: number
//   ): void {
//     this._selection
//       .transition(name)
//       .delay(transitionDelay)
//       .duration(transitionDuration)
//       .attr(name, value);
//   }

//   // todo: refactor style/property/... methods to protected submethod style like _setAttr/_getAttr/...

//   classed(names: string): boolean;
//   classed(names: string, value: boolean): this;
//   classed(names: string, value?: boolean): boolean | this {
//     if (value === undefined) return this._selection.classed(names);
//     this._selection.classed(names, value);
//     return this;
//   }

//   style(name: string): string | null;
//   style(name: string, value: null): this;
//   style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
//   style(
//     name: string,
//     value?: null | string | number | boolean,
//     priority?: 'important' | null
//   ): string | null | this {
//     if (value === undefined) return this._selection.style(name);
//     if (value === null) this._selection.style(name, null);
//     else this._selection.style(name, value, priority);
//     return this;
//   }

//   property(name: string): any;
//   property(name: string, value: null): this;
//   property(name: string, value: any): this;
//   property(name: string, value?: any): any {
//     if (value === undefined) return this._selection.property(name);
//     this._selection.property(name, value);
//     return this;
//   }

//   text(): string;
//   text(value: null): this;
//   text(value: string | number | boolean): this;
//   text(value: string | number | boolean, transitionDuration: number): this;
//   text(value: string | number | boolean, transitionDuration: number, transitionDelay: number): this;
//   text(
//     value?: null | string | number | boolean,
//     transitionDuration?: number,
//     transitionDelay?: number
//   ): string | this {
//     if (value === undefined) return this._selection.text();
//     if (value === null) this._selection.text(null);
//     else {
//       if (transitionDuration === undefined) this._selection.text(value);
//       else {
//         this._selection
//           .transition('text')
//           .delay(transitionDelay || 0)
//           .duration(transitionDuration)
//           .text(value);
//       }
//     }
//     return this;
//   }

//   html(): string {
//     return this.selection().html();
//   }

//   raise(): this {
//     this.selection().raise();
//     return this;
//   }

//   lower(): this {
//     this.selection().lower();
//     return this;
//   }

//   node(): Element {
//     return this.selection().node()!;
//   }

//   on(typenames: string, callback: null): this;
//   on(typenames: string, callback: (event: Event, data: ComponentEventData<this>) => void): this;
//   on(typenames: any, callback: ((event: Event, data: ComponentEventData<this>) => void) | null) {
//     if (callback === null) this._selection.on(typenames, null);
//     else
//       this._selection.on(typenames, (event: Event) => {
//         const data = this.eventData(event);
//         if (data) callback(event, data);
//       });
//     return this;
//   }

//   eventData(event: Event): ComponentEventData<this> | null {
//     return { component: this };
//   }

//   select<DescElement extends Element>(selector: string): Selection<DescElement, any, any, any> {
//     return this._selection.selectAll(selector);
//   }

//   selectAll<DescElement extends Element>(selector: string): Selection<DescElement, any, any, any> {
//     return this._selection.selectAll(selector);
//   }
// }

export interface ComponentEventData<TComponent extends Component> {
  component: TComponent;
}

export class Component<
  TInputProperties extends Record<string, any> = {},
  TOutputProperties extends Record<string, any> = {}
> {
  private _selection: Selection<Element, any, any, any>;
  private _parent: Component | undefined;
  private _children: Map<string, Component>;

  constructor(selection: Selection<Element, any, any, any>) {
    // this._selection = create(tag);
    this._selection = selection;
    this._children = new Map();
  }

  // todo: 'index' or 'order' instead of 'name'?
  // - would solve the issue of child order
  // - 'index' would have to be unique, 'order' not a good idea?
  child<TChild extends Component = Component>(name: string): TChild | undefined;
  child(name: string, component: null): this;
  child(name: string, component: Component): this;
  child<TChild extends Component = Component>(
    name: string,
    component?: TChild | null
  ): TChild | undefined | this {
    if (component === undefined) return this._children.get(name) as TChild;
    else if (component === null) this._children.delete(name);
    else this._children.set(name, component);
    return this;
  }

  // todo: this is probably very heavy on performance
  // - if the children would be accessed by index they could be
  //   stored as an array and this method wouldn't have to create
  //   artificial ones on every invokation.
  children(): Component[] {
    return Array.from(this._children.values());
  }

  mount(parent: Selection<Element, any, any, any>): this;
  mount(parent: Component): this;
  mount(parent: Selection<Element, any, any, any> | Component): this {
    this._parent = parent instanceof Component ? parent : new Component(parent);

    this.selection().each((d, i, elements) => this._parent!.selection().append(() => elements[i]));

    this.children().forEach((c) => c.mount(this));
    return this;
  }

  call(callback: (component: this, ...args: any[]) => void, ...args: any[]): this {
    callback(this, ...args);
    return this;
  }

  selection(): Selection<Element, any, any, any> {
    return this._selection;
  }

  attr(name: string): string | null;
  attr(name: string, value: null): this;
  attr(name: string, value: string | number | boolean): this;
  attr(name: string, value: string | number | boolean, transitionDuration: number): this;
  attr(
    name: string,
    value: string | number | boolean,
    transitionDuration: number,
    transitionDelay: number
  ): this;
  attr(
    name: string,
    value?: null | string | number | boolean,
    transitionDuration?: number,
    transitionDelay?: number
  ): string | null | this {
    if (value === undefined) return this._getAttr(name);
    if (value === null) this._removeAttr(name);
    else if (transitionDuration === undefined) this._setAttr(name, value);
    else this._transitionAttr(name, value, transitionDuration, transitionDelay || 0);
    return this;
  }

  protected _getAttr(name: string): string | null {
    return this.selection().attr(name);
  }

  protected _removeAttr(name: string): void {
    this.selection().attr(name, null);
  }

  protected _setAttr(name: string, value: string | number | boolean): void {
    this.selection().attr(name, value);
  }

  protected _transitionAttr(
    name: string,
    value: string | number | boolean,
    transitionDuration: number,
    transitionDelay: number
  ): void {
    this.selection()
      .transition(name)
      .delay(transitionDelay)
      .duration(transitionDuration)
      .attr(name, value);
  }

  // todo: refactor style/property/... methods to protected submethod style like _setAttr/_getAttr/...

  classed(names: string): boolean;
  classed(names: string, value: boolean): this;
  classed(names: string, value?: boolean): boolean | this {
    if (value === undefined) return this.selection().classed(names);
    this.selection().classed(names, value);
    return this;
  }

  style(name: string): string | null;
  style(name: string, value: null): this;
  style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
  style(
    name: string,
    value?: null | string | number | boolean,
    priority?: 'important' | null
  ): string | null | this {
    if (value === undefined) return this.selection().style(name);
    if (value === null) this.selection().style(name, null);
    else this.selection().style(name, value, priority);
    return this;
  }

  // prop<TPropertyKey extends keyof TOutputProperties>(
  //   name: TPropertyKey
  // ): TOutputProperties[TPropertyKey];
  // prop<TPropertyKey extends keyof TInputProperties>(
  //   name: TPropertyKey,
  //   value: TInputProperties[TPropertyKey]
  // ): this;
  // prop<
  //   TPropertyKey extends keyof TOutputProperties | TInputProperties,
  //   TPropertyValue = TPropertyKey extends keyof TOutputProperties
  //     ? TOutputProperties[TPropertyKey]
  //     : TPropertyKey extends keyof TInputProperties
  //     ? TInputProperties[TPropertyKey]
  //     : never
  // >(name: TPropertyKey, value?: TPropertyValue): TPropertyValue | this {
  //   if (value === undefined) return this.selection().property(name as string);
  //   this.selection().property(name as string, value);
  //   return this;
  // }

  // property(name: string): any;
  // property(name: string, value: any): this;
  // property(name: string, value?: any): any | this {
  //   if (value === undefined) return this.selection().property(name);
  //   this.selection().property(name, value);
  //   return this;
  // }

  property<TPropertyKey extends keyof TOutputProperties>(
    name: TPropertyKey
  ): TOutputProperties[TPropertyKey];
  property<TPropertyKey extends keyof TInputProperties>(
    name: TPropertyKey,
    value: TInputProperties[TPropertyKey]
  ): this;
  property<
    TPropertyKey extends keyof TOutputProperties | TInputProperties,
    TPropertyValue = TPropertyKey extends keyof TOutputProperties
      ? TOutputProperties[TPropertyKey]
      : TPropertyKey extends keyof TInputProperties
      ? TInputProperties[TPropertyKey]
      : never
  >(name: TPropertyKey, value?: TPropertyValue): TPropertyValue | this {
    if (value === undefined) return this.selection().property(name as string);
    this.selection().property(name as string, value);
    return this;
  }

  text(): string;
  text(value: null): this;
  text(value: string | number | boolean): this;
  text(value: string | number | boolean, transitionDuration: number): this;
  text(value: string | number | boolean, transitionDuration: number, transitionDelay: number): this;
  text(
    value?: null | string | number | boolean,
    transitionDuration?: number,
    transitionDelay?: number
  ): string | this {
    if (value === undefined) return this.selection().text();
    if (value === null) this.selection().text(null);
    else {
      if (transitionDuration === undefined) this.selection().text(value);
      else {
        this.selection()
          .transition('text')
          .delay(transitionDelay || 0)
          .duration(transitionDuration)
          .text(value);
      }
    }
    return this;
  }

  html(): string {
    return this.selection().html();
  }

  raise(): this {
    this.selection().raise();
    return this;
  }

  lower(): this {
    this.selection().lower();
    return this;
  }

  select<DescElement extends Element>(selector: string): Selection<DescElement, any, any, any> {
    return this.selection().select(selector);
  }

  selectAll<DescElement extends Element>(selector: string): Selection<DescElement, any, any, any> {
    return this.selection().selectAll(selector);
  }

  node(): Element {
    return this.selection().node()!;
  }

  dispatch(type: string): this {
    this.selection().dispatch(type);
    return this;
  }

  on(type: string, callback: null): this;
  on(type: string, callback: (event: Event, data: ComponentEventData<this>) => void): this;
  on(type: string, callback: ((event: Event, data: ComponentEventData<this>) => void) | null) {
    if (callback === null) this.selection().on(type, null);
    else
      this.selection().on(type, (event: Event) => {
        const data = this.eventData(event);
        if (data) callback(event, data);
      });
    return this;
  }

  eventData(event: Event): ComponentEventData<this> | null {
    return { component: this };
  }
}

// export class BaseCompositeComponent extends withChildren<BaseComponent, typeof BaseComponent>(
//   BaseComponent
// ) {
//   mount(container: Element): this;
//   mount(container: BaseComponent): this;
//   mount(container: Element | BaseComponent): this {
//     super.mount(container as any);
//     this.children().forEach((c) => c.mount(this));
//     return this;
//   }
// }

// export function create(tag: string): BaseComponent {
//   return new BaseComponent(d3Create(tag));
// }

// export function select(selector: string): BaseComponent;
// export function select(node: Element): BaseComponent;
// export function select(selectorOrNode: string | Element): BaseComponent {
//   return new BaseComponent(d3Select(selectorOrNode as any));
// }

// export function selectAll(selector: string): BaseComponent;
// export function selectAll(nodes: ArrayLike<Element>): BaseComponent;
// export function selectAll(selectorOrNodes: string | ArrayLike<Element>): BaseComponent {
//   return new BaseComponent(d3SelectAll<Element, any>(selectorOrNodes as any));
// }

/*

export class Element extends Component {
  constructor(tag: string) {
    super(d3Create(tag));
  }
}

export function element(tag: string): Element {
  return new Element(tag);
}

export class Series extends Component {
  constructor() {
    super(d3SelectAll(null));
    this.property('update', (update) => {}))
      .property('exit', (exit) => exit.remove())
      .property('data', []);
      .property('data-key', (d, i) => i)
  }

  render() {
    super.render();
    // this.selection = ???
    this.selection()
      .data(this.property('data'), this.property('data-key'))
      .join(this.property('enter'), null, this.property('exit'))
      .call(this.property('update'));
  }
}

export function series(): Series {
  return new Series();
}

export class BarSeries extends Component {
  private _series: Series;

  constructor() {
    super(d3SelectAll(null));
    this._series = new Series();
    this.property('enter', (enter) => enter.append('rect'))
      .property('update', (update) => selection
        .attr('x', (d) => d.rect.x)
        .attr('y', (d) => d.rect.y)
        .attr('width', (d) => d.rect.width)
        .attr('height', (d) => d.rect.height))
      .property('exit', (exit) => exit.remove());
  }

  render() {
    super.render();
    this._selection = this._series
      .property('enter', this.property('enter'))
      .property('update', this.property('update'))
      .property('exit', this.property('exit'))
    
  }
}

const root = respVis.element('div')
  .child(0, respVis.series()
    .property('enter', (enter) => enter.append('p'))
    .property('update', (update) => update.text(d => d))
    .property('data', ['a', 'b', 'c'])
  )

const root = respVis.element('div')
  .child(0, respVis.barSeries()
    .property('main-values', cities)
    .property('main-scale', cityScale)
    .property('cross-values', populations)
    .property('cross-scale', populationScale)
    .property('enter', (enter, c) => 
      enter.call(c.property('enter'), c).attr('fill', '#123456'))
  )

const root = respVis.element('div')
  .child(0, respVis.barSeries()
    .property('main-values', cities)
    .property('main-scale', cityScale)
    .property('cross-values', populations)
    .property('cross-scale', populationScale)
    .property('enter', (enter, c) => 
      enter.call(c.property('enter'), c).attr('fill', '#123456'))
  )

*/
