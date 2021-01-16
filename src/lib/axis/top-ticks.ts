import { Axis, AxisDomain, AxisScale, axisTop } from 'd3-axis';
import { Selection } from 'd3-selection';
import { TicksComponent } from './ticks';

export class TopTicksComponent extends TicksComponent {
  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisTop(scale);
  }

  update(): this {
    super.update();
    this.attr('height', this._bounds.height).attr(
      'transform',
      `translate(0, ${this._bounds.height})`
    );
    return this;
  }
}
