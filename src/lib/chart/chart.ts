import { BaseType, select, Selection } from 'd3-selection';
import debounce from 'debounce';
import { IComponent } from '../component';
import { ILayout, Layout } from '../layout/layout';
import { nullFunction } from '../utils';

export interface IChart {
  mount(containerSelector: string): this;
  layout(layout: IComponent): this;
  layout(): IComponent;
  onTransition(callback: () => void): this;
  onTransition(): () => void;
}

export class Chart implements IChart {
  private _gridLayout: ILayout;
  private _layout: IComponent;
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  private _onTransition = nullFunction;

  constructor() {
    this._gridLayout = new Layout();
  }

  mount(containerSelector: string): this {
    this._selection = select(containerSelector)
      .append('svg')
      .classed('chart', true);

    this._gridLayout.layout(this._layout).mount(this._selection);

    const resize = () => {
      const boundingRect = this._selection.node()!.getBoundingClientRect();
      this._selection.attr(
        'viewBox',
        `0, 0, ${boundingRect.width}, ${boundingRect.height}`
      );
      this._gridLayout.resize();
    };

    resize();

    let resizing = false;
    let resizeIntervalHandle: number;
    window.addEventListener('resize', () => {
      if (!resizing) {
        resizing = true;
        resizeIntervalHandle = window.setInterval(resize, 10);
      }
    });

    window.addEventListener(
      'resize',
      debounce(() => {
        resizing = false;
        window.clearInterval(resizeIntervalHandle);

        this._selection.classed('transition', true);
        this._onTransition();

        this._gridLayout.transition();

    window.setTimeout(() => this._selection.classed('transition', false), 1000);
      }, 1000)
    );

    return this;
  }

  layout(layout?: IComponent): any {
    if (layout === undefined) return this._layout;
    this._layout = layout;
    // TODO: Handle changing after mount.
    return this;
  }

  onTransition(callback?: () => void): any {
    if (callback === undefined) return this._onTransition;
    this._onTransition = callback;
    return this;
  }
}

export function chart(): Chart {
  return new Chart();
}
