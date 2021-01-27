import { range } from 'd3-array';
import { BaseComponent } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { GridMixin } from '../core/mixins/grid-mixin';
import { SwatchComponent } from './swatch-component';

export class LegendComponent extends GridMixin(ChildrenMixin(BaseComponent)) {
  constructor(swatchCount: number) {
    super('g');
    this.rowCount(swatchCount).columnCount(1).layout('place-content', 'center center');
    for (let i = 0; i < swatchCount; ++i) this.children().push(new SwatchComponent());
  }

  swatchCount(): number;
  swatchCount(count: number): this;
  swatchCount(count?: number) {
    if (count === undefined) return this.children().length;
    for (let i = 0; i < count; ++i) this.children([]).children().push(new SwatchComponent());
    return this;
  }

  swatches(): SwatchComponent[] {
    return this.children() as SwatchComponent[];
  }
}

export function legend(swatchCount: number): LegendComponent {
  return new LegendComponent(swatchCount);
}
