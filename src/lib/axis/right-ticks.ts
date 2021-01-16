import { Axis, AxisDomain, axisRight, AxisScale } from 'd3-axis';
import { TicksComponent } from './ticks';

export class RightTicksComponent extends TicksComponent {
  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisRight(scale);
  }

  update(): this {
    super.update();
    this.attr('width', this._bounds.width);
    return this;
  }
}
