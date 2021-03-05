import { AxisComponent, BottomAxisComponent, LeftAxisComponent } from '../axis';
import { BarsComponent } from '../bars';
import { BaseComponent, GroupComponent, Mixin, SVGComponent } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class CartesianChartComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(BaseComponent))
) {
  private _drawArea: SVGComponent;

  constructor() {
    super('g');

    this._drawArea = new SVGComponent();

    this.layout('grid-template', 'auto 1fr auto / auto 1fr auto')
      .layout('margin-horizontal', 20)
      .layout('margin-vertical', 20)
      .child('draw-area', this._drawArea.layout('grid-area', '2 / 2 / 3 / 3'));
  }

  leftAxis(): AxisComponent | undefined;
  leftAxis(axis: AxisComponent | null): this;
  leftAxis(axis?: AxisComponent | null): AxisComponent | undefined | this {
    if (axis === undefined) return this.child<AxisComponent>('left-axis');
    else if (axis === null) this.child('left-axis', null);
    else this.child('left-axis', axis.layout('grid-area', '2 / 1 / 3 / 2'));
    return this;
  }

  bottomAxis(): AxisComponent | undefined;
  bottomAxis(axis: AxisComponent | null): this;
  bottomAxis(axis?: AxisComponent | null): AxisComponent | undefined | this {
    if (axis === undefined) return this.child<AxisComponent>('bottom-axis');
    else if (axis === null) this.child('bottom-axis', null);
    else this.child('bottom-axis', axis.layout('grid-area', '3 / 2 / 4 / 3'));
    return this;
  }

  rightAxis(): AxisComponent | undefined;
  rightAxis(axis: AxisComponent | null): this;
  rightAxis(axis?: AxisComponent | null): AxisComponent | undefined | this {
    if (axis === undefined) return this.child<AxisComponent>('right-axis');
    else if (axis === null) this.child('right-axis', null);
    else this.child('right-axis', axis.layout('grid-area', '2 / 3 / 3 / 4'));
    return this;
  }

  topAxis(): AxisComponent | undefined;
  topAxis(axis: AxisComponent | null): this;
  topAxis(axis?: AxisComponent | null): AxisComponent | undefined | this {
    if (axis === undefined) return this.child<AxisComponent>('top-axis');
    else if (axis === null) this.child('top-axis', null);
    else this.child('top-axis', axis.layout('grid-area', '1 / 2 / 2 / 3'));
    return this;
  }

  drawArea(): SVGComponent {
    return this._drawArea;
  }
}

export function cartesianChart(): CartesianChartComponent {
  return new CartesianChartComponent();
}
