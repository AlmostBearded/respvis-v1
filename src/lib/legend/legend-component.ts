import { range } from 'd3-array';
import { BaseComponent, PaddingComponent } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { GridMixin } from '../core/mixins/grid-mixin';
import { SwatchComponent } from './swatch-component';

export class LegendComponent extends GridMixin(ChildrenMixin(BaseComponent)) {
  constructor(swatchCount: number) {
    super('g');
    this.rowCount(swatchCount).columnCount(1);
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

// export default function withSwatchLegend(group) {
//   const legend = withGridLayout(group);
//   legend.config((c) => ({
//     labels: [],
//     colors: [],
//     parseConfig: (previousConfig, newConfig) => {
//       legend.swatches = newConfig.labels.map((label, i) => {
//         let swatch = legend.swatches?.[i];
//         if (!swatch) {
//           swatch = withSwatch(respVis.group());
//           swatch.rect.config({ attributes: { fill: newConfig.colors[i] } });
//           swatch.label.config({ text: label });
//         } else {
//           if (previousConfig.colors[i] !== newConfig.colors[i])
//             swatch.rect.config({ attributes: { fill: newConfig.colors[i] } });
//           if (previousConfig.labels[i] !== newConfig.labels[i])
//             swatch.label.config({ text: label });
//         }
//         return swatch;
//       });
//       newConfig.children = legend.swatches;
//       c.parseConfig(previousConfig, newConfig);
//     },
//   }));
//   return legend;
// }
