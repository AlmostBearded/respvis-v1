import { Selection, BaseType, select, create, selection } from 'd3-selection';
import { applyAttributes, Attributes } from './utils';
import extend from 'extend';

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
    extend(true, this._config, config);
    this._applyConditionalConfigs();
    return this;
  }

  private _applyConditionalConfigs(): this {
    const newConfig = extend(true, {}, this._config);

    this._config.conditionalConfigs.forEach((conditionalConfig) => {
      if (window.matchMedia(conditionalConfig.media).matches) {
        extend(true, newConfig, conditionalConfig.config);
      }
    });

    this._selection.call(applyAttributes, newConfig.attributes);
    this._applyConfig(newConfig);

    this._activeConfig = newConfig;

    return this;
  }

  protected abstract _applyConfig(config: TConfig): void;

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
