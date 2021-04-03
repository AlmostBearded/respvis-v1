import { ChartComponent, ChildrenMixin, LayoutTransformMixin, TextComponent } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { TicksComponent } from './ticks-component';

export abstract class AxisComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(ChartComponent)))
) {
  private _ticks: TicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.child('ticks', (this._ticks = this._createTicks())).child(
      'title',
      (this._title = this._createTitle())
    );
  }

  protected abstract _createTicks(): TicksComponent;
  protected abstract _createTitle(): TextComponent;

  title(): TextComponent {
    return this._title;
  }

  ticks(): TicksComponent {
    return this._ticks;
  }
}
