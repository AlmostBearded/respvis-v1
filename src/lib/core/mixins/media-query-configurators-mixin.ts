import { Chart } from '../chart';
import { Component, ComponentEventData } from '../component';
import { ComponentWithChildren } from './children-mixin';
import { Constructor, Mixin } from './types';
import { ComponentWithConfigurators } from './configurators-mixin';

export function MediaQueryConfiguratorsMixin<
  TBaseComponent extends Constructor<ComponentWithConfigurators>
>(BaseComponent: TBaseComponent) {
  return class MediaQueryConfiguratorsMixin extends BaseComponent {
    mediaQueryConfigurator(
      order: number,
      mediaQuery: string,
      callback: (component: this) => void
    ): this {
      return this.configurator(
        order,
        (component) => window.matchMedia(mediaQuery).matches && callback(component)
      );
    }
  };
}

export type ComponentWithMediaQueryConfigurators = Mixin<typeof MediaQueryConfiguratorsMixin>;
