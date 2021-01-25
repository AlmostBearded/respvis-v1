import { BaseType, Selection } from 'd3-selection';
import { Chart } from './chart';
import { LayoutProperties } from './layout/layout';
import { ISize } from './utils';

export interface ComponentEventData<TComponent extends Component> {
  component: TComponent;
}

export interface Component {
  init(): void;
  mount(chart: Chart): this;
  configure(): this;
  beforeLayout(): this;
  afterLayout(): this;
  render(): this;
  transition(): this;
  onConfigure(): (component: this) => void;
  onConfigure(callback: (component: this) => void): this;
  // todo: implement deleting of configure callbacks
  call(callback: (component: this) => void): this;
  selection(): Selection<SVGElement, any, any, any>;
  staticCloneSelection(): Selection<SVGElement, any, any, any>;
  size(): ISize;
  layout(name: keyof LayoutProperties): string | number | undefined;
  layout(name: keyof LayoutProperties, value: string | number): this;
  layout(name: keyof LayoutProperties, value: null): this;
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
  style(name: string): string;
  style(name: string, value: null): this;
  style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
  // todo: add style transition support
  classed(names: string): boolean;
  classed(names: string, value: boolean): this;
  text(): string;
  text(value: null): this;
  text(value: string | number | boolean): this;
  text(value: string | number | boolean, transitionDuration: number): this;
  text(value: string | number | boolean, transitionDuration: number, transitionDelay: number): this;
  html(): string;
  raise(): this;
  lower(): this;
  node(): SVGElement;
  on(typenames: string, callback: null): this;
  on(typenames: string, callback: (event: Event, data: ComponentEventData<this>) => void): this;
  select<DescElement extends BaseType>(selector: string): Selection<DescElement, any, any, any>;
  selectAll<DescElement extends BaseType>(selector: string): Selection<DescElement, any, any, any>;
}
