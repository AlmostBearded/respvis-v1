import { Axis, AxisDomain, axisLeft, AxisScale } from 'd3-axis';
import { Selection } from 'd3-selection';
import { active } from 'd3-transition';
import { TicksComponent } from './ticks';

export class LeftTicksComponent extends TicksComponent {
  constructor(selection: Selection<SVGElement, any, any, any>) {
    super(selection);
    this.attr('width', 'min-content');
  }

  protected createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain> {
    return axisLeft(scale);
  }

  render(): this {
    super.render();
    this._transformIntoLayoutRect();
    return this;
  }

  layout(): this {
    super.layout();
    this._transformIntoLayoutRect();
    return this;
  }

  private _transformIntoLayoutRect(): void {
    this.selection().attr(
      'transform',
      `translate(${this.node().getBoundingClientRect().width}, 0)`
    );
  }
}
