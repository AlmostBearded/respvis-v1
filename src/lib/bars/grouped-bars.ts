import { Component, IComponent, IComponentConfig } from '../component';
import {
  IGroupedBarPositioner,
  GroupedBarPositioner,
  IGroupedBarPositionerConfig,
  IGroupedBars,
} from './grouped-bar-positioner';
import { BaseType, Selection, select, create } from 'd3-selection';
import { IBarPositionerConfig, Orientation } from './bar-positioner';
import { renderBars } from './bars';
import { ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import { Rect } from '../rect';
import { applyAttributes, deepExtend, ISize } from '../utils';
import { categorical as categoricalColors } from '../colors';
import chroma from 'chroma-js';

export interface IGroupedBarsConfig extends IComponentConfig, IGroupedBarPositionerConfig {
  transitionDuration: number;
}

export interface IGroupedBarsComponent extends IComponent<IGroupedBarsConfig>, IGroupedBars {}

export class GroupedBarsComponent
  extends Component<IGroupedBarsConfig>
  implements IGroupedBarsComponent {
  private _barPositioner: IGroupedBarPositioner = new GroupedBarPositioner();

  static defaultColors = categoricalColors;

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        categories: [],
        values: [],
        flipCategories: false,
        flipSubcategories: false,
        flipValues: false,
        orientation: Orientation.Vertical,
        categoryPadding: 0.1,
        subcategoryPadding: 0.1,
        transitionDuration: 0,
        attributes: Object.assign(
          {},
          ...GroupedBarsComponent.defaultColors.map((c, i) => ({
            [`.bar:nth-child(${i + 1}) > rect`]: {
              fill: c,
              stroke: chroma.hex(c).darken(2).hex(),
              'stroke-width': 4,
            },
          }))
        ),
        conditionalConfigs: [],
      },
      Component.mergeConfigs
    );

    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IGroupedBarsConfig): void {
    this._barPositioner.config(config);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());

    this._barPositioner.fitInSize({ width: 600, height: 400 });
    this.render(false);

    return this;
  }

  resize(): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout'));
    this._barPositioner.fitInSize(layoutRect);
    return this;
  }

  protected _afterResize(): void {}

  render(animated: boolean): this {
    const values = this.activeConfig().values;
    const bars = this._barPositioner.bars();
    this.selection()
      .selectAll<SVGGElement, number[][]>('.bar-group')
      .data(values)
      .join('g')
      .classed('bar-group', true)
      .each((d, i, groups) => {
        const barsPerGroup = bars.length / values.length;
        renderBars(
          select(groups[i]),
          bars.slice(i * barsPerGroup, i * barsPerGroup + barsPerGroup),
          animated ? this.activeConfig().transitionDuration : 0
        );
      });

    this.selection().call(applyAttributes, this.activeConfig().attributes);

    return this;
  }

  renderOrder(): number {
    return 0;
  }

  bars(): Rect[] {
    return this._barPositioner.bars();
  }

  categoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.categoriesScale();
  }

  subcategoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.subcategoriesScale();
  }

  valuesScale(): ScaleLinear<number, number> {
    return this._barPositioner.valuesScale();
  }
}

export function groupedBars(): GroupedBarsComponent {
  return new GroupedBarsComponent();
}
