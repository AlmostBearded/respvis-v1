import { Axis, AxisDomain, axisLeft, AxisScale } from 'd3-axis';
import { Selection } from 'd3-selection';
import { active } from 'd3-transition';
import { TicksComponent } from './ticks';

export class LeftTicksComponent extends TicksComponent {
  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisLeft(scale);
  }

  update(): this {
    super.update();
    this.attr('width', this._bounds.width).attr('transform', `translate(${this._bounds.width}, 0)`);
    return this;
  }
}
