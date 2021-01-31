import { select } from 'd3-selection';
import debounce from 'debounce';
import { applyLayoutTransforms, computeLayout } from './layout/layout';
import { SVGComponent } from './components/svg-component';
import { rectFromString, rectToString } from './rect';
import { GroupComponent } from './components/group-component';

export type ConfigureFunction = (chart: Chart) => void;

export class Chart {
  private _svg: SVGComponent;
  private _rootGroup: GroupComponent;
  // private _layoutDuration: number;
  // private _lastLayoutTime: number;

  constructor() {
    this._svg = new SVGComponent()
      .layout('grid-template', '1fr / 1fr')
      .children([(this._rootGroup = new GroupComponent().layout('grid-area', '1 / 1 / 2 / 2'))]);

    // this._layoutDuration = 0;

    this._svg.selection().classed('chart', true).style('width', '100%').style('height', '100%');
  }

  mount(containerSelector: string): this {
    select(containerSelector).append(() => this._svg.selection().node());
    this._svg.mount(this);

    this.transition();

    window.addEventListener('resize', () => this.render());
    window.addEventListener(
      'resize',
      debounce(() => this.transition(), 250)
    );

    return this;
  }

  render(): this {
    this._svg.beforeLayout();

    const bbox = this._svg.selection().node()!.getBoundingClientRect();
    computeLayout(this._svg.selection().node()!, bbox);

    this._svg.afterLayout().render();

    applyLayoutTransforms(this._svg.selection().node()!);

    return this;
  }

  transition(): this {
    this._svg.configure().beforeLayout();

    let bbox = this._svg.selection().node()!.getBoundingClientRect();
    computeLayout(this._svg.selection().node()!, bbox);

    this._svg.afterLayout().transition();

    applyLayoutTransforms(this._svg.selection().node()!);

    return this;
  }

  svg(): SVGComponent {
    return this._svg;
  }

  root(): GroupComponent {
    return this._rootGroup;
  }

  // requestLayout(duration: number): this {
  //   // add a few milliseconds to the requested layouting duration to make sure
  //   // transitions have ended when stopping layouting.
  //   duration += 25;
  //   this._layoutDuration = Math.max(this._layoutDuration, duration);
  //   this._lastLayoutTime = Date.now();

  //   const layoutStep = () => {
  //     let bbox = Rect.fromString(this.attr('viewBox'));
  //     computeLayout(this.node(), bbox);

  //     super.layout();

  //     applyLayoutTransforms(this.node());

  //     const currentTime = Date.now();
  //     const msSinceLastLayout = currentTime - this._lastLayoutTime;

  //     this._layoutDuration -= msSinceLastLayout;

  //     if (this._layoutDuration >= 0) {
  //       window.requestAnimationFrame(layoutStep);
  //     }
  //     this._lastLayoutTime = currentTime;
  //   };

  //   window.requestAnimationFrame(layoutStep);
  //   return this;
  // }
}

export function chart(): Chart {
  return new Chart();
}
