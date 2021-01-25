import { Axis, AxisDomain, AxisScale, axisTop } from 'd3-axis';
import { TicksComponent } from './ticks-component';

export class TopTicksComponent extends TicksComponent {
  constructor() {
    super();
    this.layout('height', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisTop(scale);
  }

  beforeLayout(): this {
    this.attr('transform', `translate(0, ${this.size().height})`);
    return this;
  }
}

export function topTicks(): TopTicksComponent {
  return new TopTicksComponent();
}
