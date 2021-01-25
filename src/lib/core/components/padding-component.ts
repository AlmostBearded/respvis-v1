import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';

export class PaddingComponent extends ChildrenMixin(BaseComponent) {
  private _top: string = '0';
  private _right: string = '0';
  private _bottom: string = '0';
  private _left: string = '0';

  constructor() {
    super('g');
  }

  all(padding: string | number): this {
    this._top = this._right = this._bottom = this._left = padding.toString();
    return this;
  }

  horizontal(padding: string | number): this {
    this._left = this._right = padding.toString();
    return this;
  }

  vertical(padding: string | number): this {
    this._bottom = this._top = padding.toString();
    return this;
  }

  top(padding: string | number): this {
    this._top = padding.toString();
    return this;
  }

  bottom(padding: string | number): this {
    this._bottom = padding.toString();
    return this;
  }

  left(padding: string | number): this {
    this._left = padding.toString();
    return this;
  }

  right(padding: string | number): this {
    this._right = padding.toString();
    return this;
  }

  beforeLayout(): this {
    super.beforeLayout();
    this.layout(
      'grid-template',
      `${this._top} 1fr ${this._bottom} / ${this._left} 1fr ${this._right}`
    )
      .children()
      .forEach((c) => c.layout('grid-area', '2 / 2 / 3 / 3'));
    return this;
  }
}

export function padding(): PaddingComponent {
  return new PaddingComponent();
}
