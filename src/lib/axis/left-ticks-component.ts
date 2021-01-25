import { Axis, AxisDomain, axisLeft, AxisScale } from 'd3-axis';
import { TicksComponent } from './ticks-component';

export class LeftTicksComponent extends TicksComponent {
  constructor() {
    super();
    this.layout('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisLeft(scale);
  }

  beforeLayout(): this {
    super.beforeLayout();
    this.attr('transform', `translate(${this.size().width}, 0)`);
    return this;
  }
}

export function leftTicks(): LeftTicksComponent {
  return new LeftTicksComponent();
}
