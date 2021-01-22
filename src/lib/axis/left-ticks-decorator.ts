import { Axis, AxisDomain, axisLeft, AxisScale } from 'd3-axis';
import { ContainerComponent } from '../core/components/container-component';
import { ISize } from '../core/utils';
import { TicksDecorator } from './ticks-decorator';

export class LeftTicksDecorator extends TicksDecorator {
  constructor(component: ContainerComponent) {
    super(component);
    this.component().layout('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisLeft(scale);
  }

  beforeLayout(): this {
    super.beforeLayout();
    this.component().attr('transform', `translate(${this.component().size().width}, 0)`);
    return this;
  }
}
