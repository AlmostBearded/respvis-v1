import { BaseComponent } from '../base-component';
import { rectFromString } from '../rect';
import { Constructor, Mixin } from './types';

// prepends the translation that represents the layout to the transform attribute
//
// must be mixed-in on a higher level than e.g. the static clone mixin.

export function LayoutTransformMixin<TBaseComponent extends Constructor<BaseComponent>>(
  BaseComponent: TBaseComponent
) {
  return class LayoutTransformMixin extends BaseComponent {
    private _transform: string = '';

    protected _removeAttr(name: string): void {
      if (name === 'transform') {
        this._transform = '';
        const layoutTransform = this._prependLayoutTransform('');
        if (layoutTransform !== '') {
          super._setAttr(name, layoutTransform);
          return;
        }
      }
      super._removeAttr(name);
    }

    protected _setAttr(name: string, value: string | number | boolean): void {
      if (name === 'transform') {
        this._transform = value as string;
        super._setAttr(name, this._prependLayoutTransform(this._transform));
      } else super._setAttr(name, value);
    }

    protected _transitionAttr(
      name: string,
      value: string | number | boolean,
      transitionDuration: number,
      transitionDelay: number
    ): void {
      if (name === 'transform') {
        this._transform = value as string;
        super._transitionAttr(
          name,
          this._prependLayoutTransform(this._transform),
          transitionDuration,
          transitionDelay
        );
      } else super._transitionAttr(name, value, transitionDuration, transitionDelay);
    }

    afterLayout(): this {
      super.afterLayout();
      this._setAttr('transform', this._transform);
      return this;
    }

    protected _prependLayoutTransform(transform: string): string {
      if (this.attr('laidOut') !== null) {
        const layout = rectFromString(this.attr('layout')!);
        const layoutTransform = `translate(${layout.x}, ${layout.y})`;
        return `${layoutTransform}${transform}`;
      }
      return transform;
    }
  };
}

export type ComponentWithLayoutTransform = Mixin<typeof LayoutTransformMixin>;
