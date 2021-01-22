import { Axis, axisBottom, AxisDomain, AxisScale } from 'd3-axis';
import { ContainerComponent } from '../core/components/container-component';
import { ISize } from '../core/utils';
import { TicksDecorator } from './ticks-decorator';

export class BottomTicksDecorator extends TicksDecorator {
  constructor(component: ContainerComponent) {
    super(component);
    this.component().layout('height', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisBottom(scale);
  }
}
