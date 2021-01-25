import { Axis, AxisDomain, axisRight, AxisScale } from 'd3-axis';
import { TicksComponent } from './ticks-component';

export class RightTicksComponent extends TicksComponent {
  constructor() {
    super();
    this.layout('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisRight(scale);
  }
}

export function rightTicks(): RightTicksComponent {
  return new RightTicksComponent();
}
