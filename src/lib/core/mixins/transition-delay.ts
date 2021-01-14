import { Component } from '../components/component';
import { Constructor } from './constructor';

export function TransitionDelayMixin<TWrappedComponentConstructor extends Constructor<Component>>(
  initialDelay: number,
  WrappedComponentConstructor: TWrappedComponentConstructor
) {
  return class TransitionDelayMixin extends WrappedComponentConstructor {
    protected _transitionDelay: number;

    init(): this {
      super.init();
      this._transitionDelay = initialDelay;
      return this;
    }

    transitionDelay(): number;
    transitionDelay(delay: number): this;
    transitionDelay(delay?: number): number | this {
      if (delay === undefined) return this._transitionDelay;
      this._transitionDelay = delay;
      return this;
    }
  };
}
