import { Axis, axisBottom, AxisDomain, AxisScale } from 'd3-axis';
import { TicksComponent } from './ticks-component';

export class BottomTicksComponent extends TicksComponent {
  constructor() {
    super();
    this.layout('height', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisBottom(scale);
  }
}

export function bottomTicks(): BottomTicksComponent {
  return new BottomTicksComponent();
}
