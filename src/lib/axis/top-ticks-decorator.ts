import { Axis, AxisDomain, AxisScale, axisTop } from 'd3-axis';
import { ContainerComponent } from '../core/components/container-component';
import { TicksDecorator } from './ticks-decorator';

export class TopTicksDecorator extends TicksDecorator {
  constructor(component: ContainerComponent) {
    super(component);
    this.component().layout('height', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisTop(scale);
  }

  beforeLayout(): this {
    this.component().attr('transform', `translate(0, ${this.component().size().height})`);
    return this;
  }
}
