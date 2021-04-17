import { BaseChartComponent } from '../chart-component';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { StaticSizeMixin } from '../mixins/static-size-mixin';

export class RectComponent extends LayoutTransformMixin(StaticSizeMixin(BaseChartComponent)) {
  constructor() {
    super('rect');
    this.layout('width', 'min-content').layout('height', 'min-content');
  }
}

export function rect(): RectComponent {
  return new RectComponent();
}
