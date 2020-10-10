import { Selection, BaseType, select, create, selection } from 'd3-selection';
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
  resize(): this;
  afterResize(): this;
  render(animated: boolean): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
  config(config: Partial<TConfig>): this;
  config(): TConfig;
}

export abstract class Component<TConfig extends IComponentConfig> implements IComponent<TConfig> {
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  protected _config: TConfig;
  protected _activeConfig: TConfig;

  constructor(selection: Selection<SVGElement, unknown, BaseType, unknown>, config: TConfig) {
    this._selection = selection;
    this._config = config;
  }

  abstract mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  abstract render(animated: boolean): this;
  abstract renderOrder(): number;

  abstract resize(): this;

  afterResize(): this {
    this._applyConditionalConfigs();
    this._afterResize();
    return this;
  }

  protected abstract _afterResize(): void;

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
    this._applyConditionalConfigs();
    return this;
  }

  private _applyConditionalConfigs(): this {
    const newConfig = Object.assign({}, this._config, {
      attributes: JSON.parse(JSON.stringify(this._config.attributes)),
    });

    this._config.conditionalConfigs.forEach((conditionalConfig) => {
      if (window.matchMedia(conditionalConfig.media).matches) {
        deepDiff.observableDiff(newConfig, conditionalConfig.config, (change) => {
          // TODO: Allow components to apply their own config changes?
          // TODO: Special case for applying conditionalConfig changes?
          if (change.kind !== 'D') {
            deepDiff.applyChange(newConfig, conditionalConfig.config, change);
          }
        });
      }
    });

    const changes = deepDiff.diff(this._activeConfig, newConfig);
    if (changes) {
      this._activeConfig = newConfig;
      this._selection.call(applyAttributes, this._activeConfig.attributes);
      this._applyConfig(this._activeConfig, changes);
    }

    return this;
  }

  protected abstract _applyConfig(config: TConfig, diff: deepDiff.Diff<TConfig, TConfig>[]): void;

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
