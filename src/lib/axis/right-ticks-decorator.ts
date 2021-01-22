import { Axis, AxisDomain, axisRight, AxisScale } from 'd3-axis';
import { ContainerComponent } from '../core/components/container-component';
import { TicksDecorator } from './ticks-decorator';

export class RightTicksDecorator extends TicksDecorator {
  constructor(component: ContainerComponent) {
    super(component);
    this.component().layout('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisRight(scale);
  }
}
