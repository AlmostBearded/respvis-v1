import { ChartComponent, LayoutTransformMixin } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { GridMixin } from '../core/mixins/grid-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { SwatchComponent } from './swatch-component';

export class LegendComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(GridMixin(ChildrenMixin(LayoutTransformMixin(ChartComponent))))
) {
  constructor(swatchCount: number) {
    super('g');
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
