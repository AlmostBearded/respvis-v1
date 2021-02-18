import { BottomAxisComponent, LeftAxisComponent } from '../axis';
import { BaseComponent, GroupComponent, SVGComponent } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';

export class CartesianChartComponent extends ChildrenMixin(BaseComponent) {
  private _xAxis: BottomAxisComponent;
  private _yAxis: LeftAxisComponent;
  private _drawArea: SVGComponent;

  constructor() {
    super('g');

    this._xAxis = new BottomAxisComponent();
    this._yAxis = new LeftAxisComponent();
    this._drawArea = new SVGComponent();

    this.layout('grid-template', '1fr auto / auto 1fr')
      .layout('margin-horizontal', 20)
      .layout('margin-vertical', 20)
      .child('draw-area', this._drawArea.layout('grid-area', '1 / 2 / 2 / 3'))
      .child('y-axis', this._yAxis.layout('grid-area', '1 / 1 / 2 / 2'))
      .child('x-axis', this._xAxis.layout('grid-area', '2 / 2 / 3 / 3'));
  }

  xAxis(): BottomAxisComponent {
    return this._xAxis;
  }

  yAxis(): LeftAxisComponent {
    return this._yAxis;
  }

  drawArea(): SVGComponent {
    return this._drawArea;
  }
}

export function cartesianChart(): CartesianChartComponent {
  return new CartesianChartComponent();
}
