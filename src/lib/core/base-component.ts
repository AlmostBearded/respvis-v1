import { ChartComponent } from './chart-component';
import { Component } from './component';
import { ChildrenMixin } from './mixins/children-mixin';
import { Constructor } from './mixins/types';

export class BaseComponent extends ChildrenMixin<Component, typeof Component>(Component) {
  mount(container: Element): this;
  mount(container: Component): this;
  mount(container: Element | Component): this {
    super.mount(container as any);
    this.children().forEach((c) => c.mount(this));
    return this;
  }
}
