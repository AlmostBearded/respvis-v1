import { Selection, BaseType } from 'd3-selection';
import { applyAttributes, Attributes, IDictionary, nullFunction } from './utils';
import { deepExtend } from './utils';

export interface IComponentEventData {
  component: IComponent<IComponentConfig>;
}

export interface IComponentConfig {
  attributes: Attributes;
  responsiveConfigs: IDictionary<Partial<this>>;
  parseConfig: (previousConfig: this, newConfig: this) => void;
  applyConfig: (previousConfig: this, newConfig: this) => void;
  events: IDictionary<(event: Event, data: IComponentEventData) => void>;
}

export type MergeConfigsFn = <TConfig extends IComponentConfig>(
  target: Partial<TConfig>,
  source: Partial<TConfig>
) => Partial<TConfig>;

export interface IComponent<TConfig extends IComponentConfig> {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  resize(): this;
  render(animated: boolean): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
  config(config: Partial<TConfig>): this;
  config(configFn: (config: TConfig) => Partial<TConfig>): this;
  config(): TConfig;
  applyConfig(): this;
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
    return Object.assign(
      target,
      source,
      {
        attributes: deepExtend(target.attributes || {}, source.attributes || {}),
      },
      {
        events: deepExtend(target.events || {}, source.events || {}),
      },
      {
        responsiveConfigs: deepExtend(
          target.responsiveConfigs || {},
          source.responsiveConfigs || {}
        ),
      }
    );
  }

  static clearEventListeners(component: IComponent<IComponentConfig>, config: IComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, null);
    }
  }

  static setEventListeners(component: IComponent<IComponentConfig>, config: IComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        config.events[typenames](e, { component: component });
      });
    }
  }

  constructor(
    selection: Selection<SVGElement, unknown, BaseType, unknown>,
    config: TConfig,
    mergeConfigsFn: MergeConfigsFn
  ) {
    this._selection = selection;
    this._config = config;
    this._activeConfig = mergeConfigsFn({}, config) as TConfig;
    this._mergeConfigsFn = mergeConfigsFn;
  }

  abstract mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  abstract render(animated: boolean): this;
  abstract renderOrder(): number;

  abstract resize(): this;

  config(config: Partial<TConfig>): this;
  config(configFn: (config: TConfig) => Partial<TConfig>): this;
  config(): TConfig;
  config(c?: Partial<TConfig> | ((config: TConfig) => Partial<TConfig>)): any {
    if (c === undefined) return this._config;
    const config = c instanceof Function ? c(this._activeConfig) : c;
    this._mergeConfigsFn(this._config, config);
    this._config.parseConfig(this._activeConfig, this._config);
    this._activeConfig = this._mergeConfigsFn({}, this._config) as TConfig;
    return this;
  }

  activeConfig(): TConfig {
    return this._activeConfig;
  }

  applyConfig(): this {
    this._applyResponsiveConfigs();
    this._applyConfig();
    return this;
  }

  protected _applyConfig(): void {}

  protected _applyResponsiveConfigs(): this {
    const newConfig = this._mergeConfigsFn({}, this._config) as TConfig;

    for (const media in this._config.responsiveConfigs) {
      if (window.matchMedia(media).matches) {
        this._mergeConfigsFn(newConfig, this._config.responsiveConfigs[media]);
      }
    }

    // TODO: Is this needed here?
    newConfig.parseConfig(this._activeConfig, newConfig);

    newConfig.applyConfig(this._activeConfig, newConfig);

    this._selection.call(applyAttributes, newConfig.attributes);

    this._activeConfig = newConfig;

    return this;
  }

  call(componentFn: (component: this) => void): this {
    componentFn(this);
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
