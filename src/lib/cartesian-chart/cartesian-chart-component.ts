import {
  AxisComponent,
  BottomAxisComponent,
  LeftAxisComponent,
  RightAxisComponent,
  TopAxisComponent,
  XAxisPosition,
  YAxisPosition,
} from '../axis';
import { BaseComponent, GroupComponent, LayoutTransformMixin, Mixin, SVGComponent } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class CartesianChartComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(BaseComponent)))
) {
  private _drawArea: GroupComponent;
  private _xAxisPosition: XAxisPosition;
  private _yAxisPosition: YAxisPosition;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto 1fr auto / auto 1fr auto')
      .layout('margin-horizontal', 20)
      .layout('margin-vertical', 20)
      .child(
        'draw-area',
        (this._drawArea = new GroupComponent().layout('grid-area', '2 / 2 / 3 / 3'))
      );

    this._xAxisPosition = XAxisPosition.Bottom;
    this._yAxisPosition = YAxisPosition.Left;

    this.bottomAxis(new BottomAxisComponent()).leftAxis(new LeftAxisComponent());
  }

  // todo: switching axis positions hasn't yet been tested!
  xAxisPosition(): XAxisPosition;
  xAxisPosition(position: XAxisPosition): this;
  xAxisPosition(position?: XAxisPosition): XAxisPosition | this {
    if (position === undefined) return this._xAxisPosition;

    const title = this.xAxis().title().text(),
      scale = this.xAxis().ticks().scale();

    if (this._xAxisPosition === XAxisPosition.Bottom) this.bottomAxis(null);
    if (this._xAxisPosition === XAxisPosition.Top) this.topAxis(null);

    if (position === XAxisPosition.Bottom) this.bottomAxis(new BottomAxisComponent());
    if (position === XAxisPosition.Top) this.topAxis(new TopAxisComponent());

    this._xAxisPosition = position;

    this.xAxis()
      .call((a) => a.ticks().scale(scale))
      .call((a) => a.title().text(title));

    return this;
  }

  // todo: switching axis positions hasn't yet been tested!
  yAxisPosition(): YAxisPosition;
  yAxisPosition(position: YAxisPosition): this;
  yAxisPosition(position?: YAxisPosition): YAxisPosition | this {
    if (position === undefined) return this._yAxisPosition;

    const title = this.yAxis().title().text(),
      scale = this.yAxis().ticks().scale();

    if (this._yAxisPosition === YAxisPosition.Left) this.leftAxis(null);
    if (this._yAxisPosition === YAxisPosition.Right) this.rightAxis(null);

    if (position === YAxisPosition.Left) this.leftAxis(new LeftAxisComponent());
    if (position === YAxisPosition.Right) this.rightAxis(new RightAxisComponent());

    this._yAxisPosition = position;

    this.yAxis()
      .call((a) => a.ticks().scale(scale))
      .call((a) => a.title().text(title));

    return this;
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

  xAxis(): AxisComponent {
    if (this._xAxisPosition === XAxisPosition.Bottom) return this.bottomAxis()!;
    else return this.topAxis()!;
  }

  yAxis(): AxisComponent {
    if (this._yAxisPosition === YAxisPosition.Left) return this.leftAxis()!;
    else return this.rightAxis()!;
  }

  drawArea(): GroupComponent {
    return this._drawArea;
  }
}

export function cartesianChart(): CartesianChartComponent {
  return new CartesianChartComponent();
}
