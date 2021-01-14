import { Component } from '../components/component';
import { Constructor } from './constructor';

export function TransitionDurationMixin<
  TWrappedComponentConstructor extends Constructor<Component>
>(initialDuration: number, WrappedComponentConstructor: TWrappedComponentConstructor) {
  return class TransitionDurationMixin extends WrappedComponentConstructor {
    protected _transitionDuration: number;

    init(): this {
      super.init();
      this._transitionDuration = initialDuration;
      return this;
    }

    transitionDuration(): number;
    transitionDuration(duration: number): this;
    transitionDuration(duration?: number): number | this {
      if (duration === undefined) return this._transitionDuration;
      this._transitionDuration = duration;
      return this;
    }
  };
}
