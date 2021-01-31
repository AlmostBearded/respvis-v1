import { create, select, selectAll, Selection, BaseType } from 'd3-selection';
import { Chart } from './chart';
import { Component, ComponentEventData } from './component';
import { LaidOutElement, LayoutProperties } from './layout/layout';
import { ISize } from './utils';

export class BaseComponent implements Component {
  private _selection: Selection<SVGElement & LaidOutElement, any, any, any>;
  private _onConfigure: (component: this) => void;

  constructor(tag: string) {
    this._selection = create(`svg:${tag}`);

    this.layout('grid-area', '1 / 1 / 2 / 2');

    this._onConfigure = () => {};

    // can't access 'this' within the bounds calculator callback
    const that = this;
    this._selection.layoutBoundsCalculator(() => that.size());

    this.init();
  }

  init(): void {}

  mount(chart: Chart): this {
    return this;
  }

  configure(): this {
    this._onConfigure(this);
    return this;
  }

  beforeLayout(): this {
    return this;
  }

  afterLayout(): this {
    return this;
  }

  render(): this {
    return this;
  }

  transition(): this {
    return this;
  }

  onConfigure(): (component: this) => void;
  onConfigure(callback: (component: this) => void): this;
  onConfigure(
    callback?: (component: this) => void
  ): ((component: this) => void) | this {
    if (callback === undefined) return this._onConfigure;
    this._onConfigure = callback;
    return this;
  }

  call(callback: (component: this) => void): this {
    callback(this);
    return this;
  }

  selection(): Selection<SVGElement, any, any, any> {
    return this._selection;
  }

  size(): ISize {
    return this.node().getBoundingClientRect();
  }

  attr(name: string): string;
  attr(name: string, value: null): this;
  attr(name: string, value: string | number | boolean): this;
  attr(
    name: string,
    value: string | number | boolean,
    transitionDuration: number
  ): this;
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
  ): string | this {
    if (value === undefined) return this.selection().attr(name);
    if (value === null) this.selection().attr(name, null);
    else {
      if (transitionDuration === undefined) this.selection().attr(name, value);
      else {
        this._selection
          .transition(name)
          .delay(transitionDelay || 0)
          .duration(transitionDuration)
          .attr(name, value);
      }
    }

    return this;
  }

  layout(name: keyof LayoutProperties): string | number | undefined;
  layout(name: keyof LayoutProperties, value: string | number): this;
  layout(name: keyof LayoutProperties, value: null): this;
  layout(
    name: keyof LayoutProperties,
    value?: string | number | null
  ): string | number | undefined | this {
    if (value === undefined) return this._selection.layout(name);
    if (value === null) this._selection.layout(name, null);
    else this._selection.layout(name, value);
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
  style(
    name: string,
    value: string | number | boolean,
    priority?: 'important' | null
  ): this;
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
  text(value: string | number | boolean, transitionDuration: number): this;
  text(
    value: string | number | boolean,
    transitionDuration: number,
    transitionDelay: number
  ): this;
  text(
    value?: null | string | number | boolean,
    transitionDuration?: number,
    transitionDelay?: number
  ): string | this {
    if (value === undefined) return this._selection.text();
    if (value === null) this._selection.text(null);
    else {
      if (transitionDuration === undefined) this._selection.text(value);
      else {
        this._selection
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

  node(): SVGElement & LaidOutElement {
    return this.selection().node()!;
  }

  on(typenames: string, callback: null): this;
  on(
    typenames: string,
    callback: (event: Event, data: ComponentEventData<this>) => void
  ): this;
  on(typenames: any, callback?: any) {
    if (callback === null) this._selection.on(typenames, null);
    else
      this._selection.on(typenames, (event: Event) => {
        const data = this.eventData(event);
        if (data) callback(event, data);
      });
    return this;
  }

  eventData(event: Event): ComponentEventData<this> | null {
    return { component: this };
  }

  select<DescElement extends BaseType>(
    selector: string
  ): Selection<DescElement, any, any, any> {
    return this._selection.selectAll(selector);
  }

  selectAll<DescElement extends BaseType>(
    selector: string
  ): Selection<DescElement, any, any, any> {
    return this._selection.selectAll(selector);
  }
}
