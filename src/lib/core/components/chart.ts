import { BaseType, create, select, Selection, ValueFn } from 'd3-selection';
import debounce from 'debounce';
import { Component, isComponent } from './component';
import { applyLayoutTransforms, computeLayout } from '../layout/layout';
import { ContainerComponent } from './container';
import { Rect } from '../rect';

export class Chart extends ContainerComponent {
  private _layoutDuration: number;
  private _layoutTimeout: any;
  private _lastLayoutTime: number;

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:svg'));
  }

  init(): this {
    super.init();
    this._layoutDuration = 0;
    this._layoutTimeout = undefined;
    return this.classed('chart', true)
      .style('width', '100%')
      .style('height', '100%')
      .attr('grid-template', '1fr / 1fr');
  }

  append<K extends keyof HTMLElementTagNameMap>(
    type: K
  ): Selection<HTMLElementTagNameMap[K], any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: string
  ): Selection<ChildElement, any, SVGElement, any>;
  append<ChildElement extends BaseType>(
    type: ValueFn<SVGElement, any, ChildElement>
  ): Selection<ChildElement, any, SVGElement, any>;
  append<ChildComponent extends Component>(component: ChildComponent): ChildComponent;
  append(arg: any): any {
    if (isComponent(arg)) arg.chart(this);
    return super.append(arg);
  }

  mount(containerSelector: string): this {
    select(containerSelector).append(() => this.node());

    this.transition();

    window.addEventListener('resize', () => this.render());
    window.addEventListener(
      'resize',
      debounce(() => this.transition(), 250)
    );

    return this;
  }

  render(): this {
    const bbox = this.node().getBoundingClientRect();
    this.attr('viewBox', `0, 0, ${bbox.width}, ${bbox.height}`);

    computeLayout(this.node(), bbox);

    super.render();

    applyLayoutTransforms(this.node());

    return this;
  }

  transition(): this {
    this.update();

    let bbox = this.node().getBoundingClientRect();
    this.attr('viewBox', `0, 0, ${bbox.width}, ${bbox.height}`);
    computeLayout(this.node(), bbox);

    super.transition();

    applyLayoutTransforms(this.node());

    return this;
  }

  requestLayout(duration: number): this {
    // add a few milliseconds to the requested layouting duration to make sure
    // transitions have ended when stopping layouting.
    duration += 25;
    this._layoutDuration = Math.max(this._layoutDuration, duration);
    this._lastLayoutTime = Date.now();

    const layoutStep = () => {
      let bbox = Rect.fromString(this.attr('viewBox'));
      computeLayout(this.node(), bbox);

      super.layout();

      applyLayoutTransforms(this.node());

      const currentTime = Date.now();
      const msSinceLastLayout = currentTime - this._lastLayoutTime;

      this._layoutDuration -= msSinceLastLayout;

      if (this._layoutDuration >= 0) {
        window.requestAnimationFrame(layoutStep);
      }
      this._lastLayoutTime = currentTime;
    };

    window.requestAnimationFrame(layoutStep);
    return this;
  }
}
