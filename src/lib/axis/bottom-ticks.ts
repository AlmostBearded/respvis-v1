import { Axis, axisBottom, AxisDomain, AxisScale } from 'd3-axis';
import { Selection } from 'd3-selection';
import { TicksComponent } from './ticks';

export class BottomTicksComponent extends TicksComponent {
  constructor(selection: Selection<SVGElement, any, any, any>) {
    super(selection);
    this.attr('height', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisBottom(scale);
  }

  protected renderAxis(axis: Axis<AxisDomain>): void {
    super.renderAxis(axis);
    this.selection().selectAll('.tick text').attr('dominant-baseline', 'hanging');
  }
}
