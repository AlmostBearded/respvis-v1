import { BaseType, create, Selection } from 'd3-selection';
import { setUniformAttributes, transitionUniformAttributes } from '../attributes';
import { IRect } from '../rect';
import { ISize } from '../utils';
import { Chart } from './chart';
import { Component } from './component';

export class RectComponent extends Component {
  private _rect: IRect<number>;
  private _transitionDuration: number;

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:rect'));
  }

  init(): this {
    super.init();
    this._rect = { x: 0, y: 0, width: 10, height: 10 };
    this._transitionDuration = 250;
    this.render();
    return this;
  }

  rect(): IRect<number>;
  rect(rect: IRect<number>): this;
  rect(rect?: IRect<number>): IRect<number> | this {
    if (rect === undefined) return this._rect;
    this._rect = rect;
    return this;
  }

  size(): ISize;
  size(size: ISize): this;
  size(size?: ISize): ISize | this {
    if (size === undefined) return this._rect;
    this._rect = { ...this._rect, ...size };
    return this;
  }

  transitionDuration(): number;
  transitionDuration(duration: number): this;
  transitionDuration(duration?: number): number | this {
    if (duration === undefined) return this._transitionDuration;
    this._transitionDuration = duration;
    return this;
  }

  render(): this {
    this.selection().call(setUniformAttributes, this._rect);
    return super.render();
  }

  transition(): this {
    this.selection()
      .transition()
      .duration(this._transitionDuration)
      .call(transitionUniformAttributes, this._rect);
    this.chart().requestLayout(this._transitionDuration);
    return super.transition();
  }
}
