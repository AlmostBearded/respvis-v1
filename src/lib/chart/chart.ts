import { BaseType, select, Selection } from 'd3-selection';
import debounce from 'debounce';
import { IComponent } from '../component';
import { ILayout, Layout } from '../layout/layout';

export interface IChart {
  mount(containerSelector: string): this;
  layout(layout: IComponent): this;
  layout(): IComponent;
}

export class Chart implements IChart {
  private _gridLayout: ILayout;
  private _layout: IComponent;
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;

  constructor() {
    this._gridLayout = new Layout();
  }

  mount(containerSelector: string): this {
    this._selection = select(containerSelector).append('svg').classed('chart', true);

    this._gridLayout.layout(this._layout).mount(this._selection);

    const resize = () => {
      const boundingRect = this._selection.node()!.getBoundingClientRect();
      this._selection.attr('viewBox', `0, 0, ${boundingRect.width}, ${boundingRect.height}`);
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

        this._gridLayout.transition();
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
}

export function chart(): Chart {
  return new Chart();
}
