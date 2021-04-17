import { BaseChartComponent } from '../chart-component';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { StaticSizeMixin } from '../mixins/static-size-mixin';

export function text(): BaseChartComponent {
  return (
    new (LayoutTransformMixin(StaticSizeMixin(BaseChartComponent)))('text')
      // auto-size grid cell to text bounding box
      .layout('width', 'min-content')
      .layout('height', 'min-content')

      // set origin to top-left corner
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')

      .attr('font-family', 'sans-serif')
  );
}
