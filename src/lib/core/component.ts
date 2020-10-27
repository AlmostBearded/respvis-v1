import { Selection, BaseType } from 'd3-selection';
import { applyAttributes, Attributes, nullFunction } from './utils';
import { deepExtend } from './utils';

export interface IConditionalComponentConfig<TConfig> {
  media: string;
  config: Partial<TConfig>;
}

export interface IComponentConfig {
  attributes: Attributes;
  conditionalConfigs: IConditionalComponentConfig<this>[];
  customConfigParser: (previousConfig: this, newConfig: this) => void;
}

export type MergeConfigsFn = <TConfig extends IComponentConfig>(
  target: Partial<TConfig>,
  source: Partial<TConfig>
) => Partial<TConfig>;

export interface IComponent<TConfig extends IComponentConfig> {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  resize(): this;
  afterResize(): this;
  render(animated: boolean): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
  config(config: Partial<TConfig>): this;
  config(configFn: (config: TConfig) => Partial<TConfig>): this;
  config(): TConfig;
  activeConfig(): TConfig;
  call(componentFn: (component: this) => void): this;
}

export abstract class Component<TConfig extends IComponentConfig> implements IComponent<TConfig> {
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  private _config: TConfig;
  private _activeConfig: TConfig;
  private _mergeConfigsFn: MergeConfigsFn;

  static mergeConfigs<TConfig extends IComponentConfig>(
    target: Partial<TConfig>,
    source: Partial<TConfig>
  ): Partial<TConfig> {
    return Object.assign(target, source, {
      attributes: deepExtend(target.attributes || {}, source.attributes || {}),
    });
  }

  constructor(
    selection: Selection<SVGElement, unknown, BaseType, unknown>,
    config: TConfig,
    mergeConfigsFn: MergeConfigsFn
  ) {
    this._selection = selection;
    this._config = config;
    this._mergeConfigsFn = mergeConfigsFn;
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
  config(configFn: (config: TConfig) => Partial<TConfig>): this;
  config(): TConfig;
  config(c?: Partial<TConfig> | ((config: TConfig) => Partial<TConfig>)): any {
    if (c === undefined) return this._config;
    const config = c instanceof Function ? c(this._activeConfig) : c;
    this._mergeConfigsFn(this._config, config);
    this._applyConditionalConfigs();
    return this;
  }

  activeConfig(): TConfig {
    return this._activeConfig;
  }

  protected _applyConditionalConfigs(): this {
    const newConfig = this._mergeConfigsFn({}, this._config) as TConfig;

    this._config.conditionalConfigs.forEach((conditionalConfig) => {
      if (window.matchMedia(conditionalConfig.media).matches) {
        this._mergeConfigsFn(newConfig, conditionalConfig.config);
      }
    });

    this._applyConfig(newConfig);
    newConfig.customConfigParser!(this._activeConfig, newConfig);

    this._selection.call(applyAttributes, newConfig.attributes);

    this._activeConfig = newConfig;

    return this;
  }

  protected abstract _applyConfig(config: TConfig): void;

  call(componentFn: (component: this) => void): this {
    componentFn(this);
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
