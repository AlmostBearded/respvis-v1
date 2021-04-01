import { Chart } from '../chart';
import { Component, ComponentEventData } from '../component';
import { Constructor, Mixin } from './types';

export function ConfiguratorsMixin<TBaseComponent extends Constructor<Component>>(
  BaseComponent: TBaseComponent
) {
  return class ConfiguratorsMixin extends BaseComponent {
    private _configurators: Map<number, (component: this) => void>;
    private _configuratorOrders: number[];

    constructor(...args: any[]) {
      super(...args);
      this._configurators = new Map();
      this._configuratorOrders = [];
    }

    // todo: what happens when multiple configurators with the same order are added?
    
    configurator(order: number): ((component: this) => void) | undefined;
    configurator(order: number, callback: null): this;
    configurator(order: number, callback: (component: this) => void): this;
    configurator(
      order: number,
      callback?: ((component: this) => void) | null
    ): ((component: this) => void) | undefined | this {
      if (callback === undefined) return this._configurators.get(order);
      else if (callback === null) {
        this._configurators.delete(order);
        this._configuratorOrders.splice(this._configuratorOrders.indexOf(order), 1);
      } else {
        this._configurators.set(order, callback);
        this._configuratorOrders.push(order);
        this._configuratorOrders.sort((a, b) => a - b);
      }
      return this;
    }

    configure(): this {
      super.configure();
      for (let i = 0; i < this._configuratorOrders.length; ++i)
        this._configurators.get(this._configuratorOrders[i])!(this);
      return this;
    }
  };
}

export type ComponentWithConfigurators = Mixin<typeof ConfiguratorsMixin>;
