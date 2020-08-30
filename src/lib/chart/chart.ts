import { BaseType, select, Selection } from 'd3-selection';
import debounce from 'debounce';
import { ILayout } from '../layout/layout';

export interface IChart {
  mount(containerSelector: string): this;
  layout(layout?: ILayout): ILayout | this;
}

export class Chart implements IChart {
  private _layout: ILayout;
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;

  mount(containerSelector: string): this {
    this._selection = select(containerSelector)
      .append('svg')
      .classed('chart', true);

    this._layout.mount(this._selection);

    const resize = () => {
      const boundingRect = this._selection.node()!.getBoundingClientRect();
      this._selection.attr(
        'viewBox',
        `0, 0, ${boundingRect.width}, ${boundingRect.height}`
      );
      this._layout.resize();
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

        this._layout.transition();
      }, 1000)
    );

    return this;
  }

  layout(layout?: ILayout): ILayout | this {
    if (!arguments.length) return this._layout;
    console.assert(layout, 'Cannot set layout to an undefined value');
    this._layout = layout!;
    return this;
  }
}

export function chart(): Chart {
  return new Chart();
}
