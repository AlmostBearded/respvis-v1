import { Selection, BaseType, select, create, selection } from 'd3-selection';
import { ITextConfig } from './components/text';
import { ILayout, ILayoutStyle } from './layout/layout';
import { applyAttributes, Attributes } from './utils';
import deepDiff from 'deep-diff';

export interface IConditionalComponentConfig<TConfig> {
  media: string;
  config: TConfig;
}

export interface IComponentConfig {
  attributes: Attributes;
  conditionalConfigs: IConditionalComponentConfig<this>[];
}

export interface IComponent<TConfig extends IComponentConfig> {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  fitInLayout(layout: ILayout): this;
  render(): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
  config(config: Partial<TConfig>): this;
  config(): TConfig;
}

export abstract class Component<TConfig extends IComponentConfig> implements IComponent<TConfig> {
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  protected _config: TConfig;
  protected _activeConfig: TConfig;

  protected _mediaQueries: { [query: string]: MediaQueryList } = {};

  constructor(selection: Selection<SVGElement, unknown, BaseType, unknown>, config: TConfig) {
    this._selection = selection;
    this._config = config;
  }

  abstract mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  abstract fitInLayout(layout: ILayout): this;
  abstract render(): this;
  abstract renderOrder(): number;

  config(config: Partial<TConfig>): this;
  config(): TConfig;
  config(config?: Partial<TConfig>): any {
    if (config === undefined) return this._config;
    deepDiff.observableDiff(this._config, config, (change) => {
      // TODO: Allow components to apply their own config changes?
      // TODO: Special case for applying conditionalConfig changes?
      if (change.kind !== 'D') {
        deepDiff.applyChange(this._config, config, change);
      }
    });
    // merge(this._config, config);
    for (let i = 0; i < this._config.conditionalConfigs.length; ++i) {
      const mediaQuery = this._config.conditionalConfigs[i].media;
      if (this._mediaQueries[mediaQuery] === undefined) {
        this._mediaQueries[mediaQuery] = window.matchMedia(mediaQuery);
        this._mediaQueries[mediaQuery].addEventListener('change', () =>
          this._onMediaQueryChanged()
        );
      }
    }
    this._onMediaQueryChanged();
    return this;
  }

  protected abstract _applyConfig(config: TConfig, diff: deepDiff.Diff<TConfig, TConfig>[]): void;

  private _onMediaQueryChanged(): void {
    console.log('onMediaQueryChanged');
    const newConfig = Object.assign({}, this._config);
    console.log(newConfig);

    this._config.conditionalConfigs.forEach((conditionalConfig) => {
      console.log(
        `${conditionalConfig.media} ${this._mediaQueries[conditionalConfig.media].matches}`
      );
      if (this._mediaQueries[conditionalConfig.media].matches) {
        console.log(conditionalConfig.config);
        deepDiff.observableDiff(newConfig, conditionalConfig.config, (change) => {
          // TODO: Allow components to apply their own config changes?
          // TODO: Special case for applying conditionalConfig changes?
          if (change.kind !== 'D') {
            deepDiff.applyChange(newConfig, conditionalConfig.config, change);
          }
        });
        // merge(newConfig, conditionalConfig.config);
      }
    });

    console.log(this._activeConfig);
    console.log(newConfig);
    const changes = deepDiff.diff(this._activeConfig, newConfig);
    if (changes) {
      this._activeConfig = newConfig;
      this._selection.call(applyAttributes, this._activeConfig.attributes);
      this._applyConfig(this._activeConfig, changes);
    }
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
