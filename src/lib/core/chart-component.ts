import { Chart } from './chart';
import { Component } from './component';
import { LaidOutElement, LayoutProperties } from './layout/layout';
import { ChildrenMixin } from './mixins/children-mixin';

export class ChartComponent extends ChildrenMixin<ChartComponent, typeof Component>(Component) {
  constructor(tag: string) {
    super(`svg:${tag}`);

    this.layout('grid-area', '1 / 1 / 2 / 2');

    // can't access 'this' within the bounds calculator callback
    const that = this;
    this.selection().layoutBoundsCalculator(() => that.size());
  }

  configure(): this {
    this.children().forEach((c) => c.confi);
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
