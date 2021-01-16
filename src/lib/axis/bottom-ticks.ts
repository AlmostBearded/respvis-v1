import { Axis, axisBottom, AxisDomain, AxisScale } from 'd3-axis';
import { Selection } from 'd3-selection';
import { TicksComponent } from './ticks';

export class BottomTicksComponent extends TicksComponent {
  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisBottom(scale);
  }

  update(): this {
    super.update();
    this.attr('height', this._bounds.height);
    return this;
  }
}
