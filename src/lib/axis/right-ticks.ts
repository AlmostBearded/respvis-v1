import { Axis, AxisDomain, axisRight, AxisScale } from 'd3-axis';
import { Selection } from 'd3-selection';
import { TicksComponent } from './ticks';

export class RightTicksComponent extends TicksComponent {
  constructor(selection: Selection<SVGElement, any, any, any>) {
    super(selection);
    this.attr('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisRight(scale);
  }
}
