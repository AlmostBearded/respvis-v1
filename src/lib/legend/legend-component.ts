import { GridComponent, LayoutTransformMixin } from '../core';
import { SwatchComponent } from './swatch-component';

export class LegendComponent extends GridComponent {
  constructor(swatchCount: number) {
    super();
    this.rowCount(swatchCount).columnCount(1).layout('place-content', 'center center');
    for (let i = 0; i < swatchCount; ++i) this.child(`swatch-${i}`, new SwatchComponent());
  }

  swatchCount(): number;
  swatchCount(count: number): this;
  swatchCount(count?: number) {
    if (count === undefined) return this.children().length;
    for (let i = count; i < this.children().length; ++i) this.child(`swatch-${i}`, null);
    for (let i = this.children().length; i < count; ++i)
      this.child(`swatch-${i}`, new SwatchComponent());
    return this;
  }

  swatches(): SwatchComponent[] {
    return this.children() as SwatchComponent[];
  }
}

export function legend(swatchCount: number): LegendComponent {
  return new LegendComponent(swatchCount);
}
