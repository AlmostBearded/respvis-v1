import { Component } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class ColorMatrixComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(Component)
) {
  constructor() {
    super('feColorMatrix');
  }
}

export function colorMatrix(): ColorMatrixComponent {
  return new ColorMatrixComponent();
}
