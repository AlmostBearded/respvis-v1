import { Component, ComponentEventData } from './component';
import { Selection } from 'd3-selection';
import { Chart } from './chart';
import { ISize } from './utils';
import { LayoutProperties } from './layout/layout';

export class ComponentDecorator<TDecoratedComponent extends Component> implements Component {
  private _component: TDecoratedComponent;
  private _onConfigure: (component: this) => void;

  constructor(component: TDecoratedComponent) {
    this._component = component;
    this._onConfigure = () => {};
  }

  component(): TDecoratedComponent {
    return this._component;
  }

  onConfigure(): (component: this) => void;
  onConfigure(callback: (component: this) => void): this;
  onConfigure(callback?: (component: this) => void): ((component: this) => void) | this {
    if (callback === undefined) return this._onConfigure;
    this._onConfigure = callback;
    return this;
  }

  call(callback: (component: this) => void): this {
    callback(this);
    return this;
  }

  selection(): Selection<SVGElement, any, any, any> {
    return this._component.selection();
  }

  staticCloneSelection(): Selection<SVGElement, any, any, any> {
    return this._component.staticCloneSelection();
  }

  size(): ISize {
    return this._component.size();
  }

  layout(name: keyof LayoutProperties): string | number | undefined;
  layout(name: keyof LayoutProperties, value: string | number): this;
  layout(name: keyof LayoutProperties, value: null): this;
  layout(name: any, value?: any) {
    if (value === undefined) return this._component.layout(name);
    this._component.layout(name, value);
    return this;
  }

  attr(name: string): string;
  attr(name: string, value: null): this;
  attr(name: string, value: string | number | boolean): this;
  attr(name: string, value: string | number | boolean, transitionDuration: number): this;
  attr(
    name: string,
    value: string | number | boolean,
    transitionDuration: number,
    transitionDelay: number
  ): this;
  attr(name: any, value?: any, transitionDuration?: any, transitionDelay?: any) {
    if (value === undefined) return this._component.attr(name);
    this._component.attr(name, value, transitionDuration, transitionDelay);
    return this;
  }

  style(name: string): string;
  style(name: string, value: null): this;
  style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
  style(name: any, value?: any, priority?: any) {
    if (value === undefined) return this._component.style(name);
    this._component.style(name, value, priority);
    return this;
  }

  classed(names: string): boolean;
  classed(names: string, value: boolean): this;
  classed(names: any, value?: any) {
    if (value === undefined) return this._component.classed(names);
    this._component.classed(names, value);
    return this;
  }

  text(): string;
  text(value: null): this;
  text(value: string | number | boolean): this;
  text(value: string | number | boolean, transitionDuration: number): this;
  text(value: string | number | boolean, transitionDuration: number, transitionDelay: number): this;
  text(value?: any, transitionDuration?: any, transitionDelay?: any) {
    if (value === undefined) return this._component.text();
    this._component.text(value, transitionDuration, transitionDelay);
    return this;
  }

  html(): string {
    return this._component.html();
  }

  raise(): this {
    this._component.raise();
    return this;
  }

  lower(): this {
    this._component.lower();
    return this;
  }

  node(): SVGElement {
    return this._component.node();
  }

  mount(chart: Chart): this {
    this._component.mount(chart);
    return this;
  }

  configure(): this {
    this._component.configure();
    this._onConfigure(this);
    return this;
  }

  beforeLayout(): this {
    this._component.beforeLayout();
    return this;
  }

  afterLayout(): this {
    this._component.afterLayout();
    return this;
  }

  render(): this {
    this._component.render();
    return this;
  }

  transition(): this {
    this._component.transition();
    return this;
  }

  on(typenames: string, callback: null): this;
  on(typenames: string, callback: (event: Event, data: ComponentEventData<this>) => void): this;
  on(typenames: any, callback: any) {
    if (callback === null) this._component.selection().on(typenames, null);
    else this._component.selection().on(typenames, (event: Event) => callback(event, this.eventData(event))));
    return this;
  }

  eventData(event: Event): ComponentEventData<this> {
    return { component: this };
  }
}
