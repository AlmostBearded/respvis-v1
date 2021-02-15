import { BottomAxisComponent, LeftAxisComponent } from '../axis';
import { GroupComponent, SVGComponent } from '../core';

export class CartesianChartComponent extends GroupComponent {
  private _xAxis: BottomAxisComponent;
  private _yAxis: LeftAxisComponent;
  private _drawArea: SVGComponent;

  constructor() {
    super();

    this._xAxis = new BottomAxisComponent();
    this._yAxis = new LeftAxisComponent();
    this._drawArea = new SVGComponent();

    this.layout('grid-template', '1fr auto / auto 1fr')
      .layout('padding-horizontal', 20)
      .layout('padding-vertical', 20)
      .children([
        this._drawArea.layout('grid-area', '1 / 2 / 2 / 3'),
        this._yAxis.layout('grid-area', '1 / 1 / 2 / 2'),
        this._xAxis.layout('grid-area', '2 / 2 / 3 / 3'),
      ]);
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
