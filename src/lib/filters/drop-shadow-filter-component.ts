import { BaseComponent, Rect, uuid } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { IPosition } from '../core/utils';
import { BlendComponent } from './blend-component';
import { ColorMatrixComponent } from './color-matrix-component';
import { GaussianBlurComponent } from './gaussian-blur-component';
import { OffsetComponent } from './offset-component';

export class DropShadowFilterComponent extends ChildrenMixin(BaseComponent) {
  private _offset: OffsetComponent;
  private _blur: GaussianBlurComponent;
  private _colorMatrix: ColorMatrixComponent;
  private _blend: BlendComponent;

  constructor(
    offset: IPosition,
    blurStdDeviation: number,
    rect: Rect<string> = { x: '-100%', y: '-100%', width: '300%', height: '300%' }
  ) {
    super('filter');
    this.classed('drop-shadow', true)
      .attr('id', uuid())
      .attr('x', rect.x)
      .attr('y', rect.y)
      .attr('width', rect.width)
      .attr('height', rect.height);
    this.child(
      'offset',
      (this._offset = new OffsetComponent()
        .attr('in', 'SourceGraphic')
        .attr('result', 'offOut')
        .attr('dx', offset.x)
        .attr('dy', offset.y))
    )
      .child(
        'color-matrix',
        (this._colorMatrix = new ColorMatrixComponent()
          .attr('result', 'matrixOut')
          .attr('in', 'offOut')
          .attr('type', 'matrix')
          .attr('values', '0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 1 0'))
      )
      .child(
        'blur',
        (this._blur = new GaussianBlurComponent()
          .attr('in', 'matrixOut')
          .attr('result', 'blurOut')
          .attr('stdDeviation', blurStdDeviation))
      )
      .child(
        'blend',
        (this._blend = new BlendComponent()
          .attr('in', 'SourceGraphic')
          .attr('in2', 'blurOut')
          .attr('mode', 'normal'))
      );
  }

  offset(): OffsetComponent {
    return this._offset;
  }

  blur(): GaussianBlurComponent {
    return this._blur;
  }

  colorMatrix(): ColorMatrixComponent {
    return this._colorMatrix;
  }

  blend(): BlendComponent {
    return this._blend;
  }
}

export function dropShadowFilter(
  offset: IPosition,
  blurStdDeviation: number,
  rect: Rect<string> = { x: '-25%', y: '-25%', width: '150%', height: '150%' }
): DropShadowFilterComponent {
  return new DropShadowFilterComponent(offset, blurStdDeviation, rect);
}
