import { select } from 'd3-selection';
import debounce from 'debounce';
import { computeLayout } from './layout/layout';
import { SVGComponent } from './components/svg-component';
import { GroupComponent } from './components/group-component';

export type ConfigureFunction = (chart: Chart) => void;

export class Chart {
  private _svg: SVGComponent;
  private _rootGroup: GroupComponent;

  constructor() {
    this._svg = new SVGComponent()
      .layout('grid-template', '1fr / 1fr')
      .child('root', (this._rootGroup = new GroupComponent().layout('grid-area', '1 / 1 / 2 / 2')));

    this._svg.selection().classed('chart', true).style('width', '100%').style('height', '100%');
  }

  mount(containerSelector: string): this {
    select(containerSelector).append(() => this._svg.selection().node());
    this._svg.mount(this);

    // first transition to initialize layout
    // second transition to actually configure with correct layout
    this.transition().transition();

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

    return this;
  }

  transition(): this {
    this._svg.configure().beforeLayout();

    let bbox = this._svg.selection().node()!.getBoundingClientRect();
    computeLayout(this._svg.selection().node()!, bbox);

    this._svg.afterLayout().transition();

    return this;
  }

  svg(): SVGComponent {
    return this._svg;
  }

  root(): GroupComponent {
    return this._rootGroup;
  }
}

export function chart(): Chart {
  return new Chart();
}
