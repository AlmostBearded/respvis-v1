import { ComponentDecorator } from '../component-decorator';
import { ContainerComponent } from '../components/container-component';

// todo: this might be better placed in some kind of utility module and not in the core module
export class PaddingDecorator<T extends ContainerComponent> extends ComponentDecorator<T> {
  private _top: number;
  private _right: number;
  private _bottom: number;
  private _left: number;

  constructor(component: T) {
    super(component);
    this._top = this._right = this._bottom = this._left = 0;
  }

  all(padding: number): this {
    this._top = this._right = this._bottom = this._left = padding;
    return this;
  }

  horizontal(padding: number): this {
    this._left = this._right = padding;
    return this;
  }

  vertical(padding: number): this {
    this._bottom = this._top = padding;
    return this;
  }

  top(padding: number): this {
    this._top = padding;
    return this;
  }

  bottom(padding: number): this {
    this._bottom = padding;
    return this;
  }

  left(padding: number): this {
    this._left = padding;
    return this;
  }

  right(padding: number): this {
    this._right = padding;
    return this;
  }

  beforeLayout(): this {
    super.beforeLayout();
    this.component()
      .layout(
        'grid-template',
        `${this._top} 1fr ${this._bottom} / ${this._left} 1fr ${this._right}`
      )
      .children()
      .forEach((c) => c.layout('grid-area', '2 / 2 / 3 / 3'));
    return this;
  }
}
