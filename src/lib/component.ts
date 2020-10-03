import { Selection, BaseType, select, create, selection } from 'd3-selection';
import { ITextConfig } from './components/text';
import { ILayout, ILayoutStyle } from './layout/layout';
import { applyAttributes, Attributes } from './utils';
import merge from 'lodash.merge';

export interface IComponentConfig {
  attributes: Attributes;
  responsiveConfigs: [string, this][];
}

export interface IComponent<TConfig extends IComponentConfig> {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  fitInLayout(layout: ILayout): this;
  render(transitionDuration: number): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
  config(config: TConfig): this;
  config(): TConfig;
  // attr(name: string, value: string | number | boolean | null): this;
  // attr(name: string): string;
  // attributes(attributes: Attributes): this;
  // layout(name: string, value: string | number | null): this;
  // layout(name: string): string;
  // layout(): ILayoutStyle;
  // mediaQuery(
  //   query: string,
  //   callback: ((component: IComponent<TConfig>) => void) | null
  // ): this;
}

export abstract class Component<TConfig extends IComponentConfig>
  implements IComponent<TConfig> {
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  protected _config: TConfig;
  protected _activeConfig: TConfig;

  protected _mediaQueries: { [query: string]: MediaQueryList } = {};
  // protected _mediaQueryCallbacks: {
  //   [query: string]: (component: IComponent<TConfig>) => void;
  // } = {};

  constructor(
    selection: Selection<SVGElement, unknown, BaseType, unknown>,
    config: TConfig
  ) {
    this._selection = selection;
    this._config = config;
  }

  abstract mount(
    selection: Selection<SVGElement, unknown, BaseType, unknown>
  ): this;
  abstract fitInLayout(layout: ILayout): this;
  abstract render(transitionDuration: number): this;
  abstract renderOrder(): number;

  config(config: TConfig): this;
  config(): TConfig;
  config(config?: TConfig): any {
    if (config === undefined) return this._config;
    merge(this._config, config);
    for (let i = 0; i < this._config.responsiveConfigs.length; ++i) {
      const responsiveConfig = this._config.responsiveConfigs[i];
      if (this._mediaQueries[responsiveConfig[0]] === undefined) {
        this._mediaQueries[responsiveConfig[0]] = window.matchMedia(
          responsiveConfig[0]
        );
        this._mediaQueries[responsiveConfig[0]].addEventListener('change', () =>
          this._onMediaQueryChanged()
        );
      }
    }
    this._onMediaQueryChanged();
    return this;
  }

  protected abstract _applyConfig(config: TConfig): void;

  private _onMediaQueryChanged(): void {
    console.log('onMediaQueryChanged');
    this._activeConfig = this._config;

    this._config.responsiveConfigs.forEach((responsiveConfig) => {
      console.log(
        `${responsiveConfig[0]} ${
          this._mediaQueries[responsiveConfig[0]].matches
        }`
      );
      if (this._mediaQueries[responsiveConfig[0]].matches) {
        this._activeConfig = merge({}, this._activeConfig, responsiveConfig[1]);
      }
    });

    this._selection.call(applyAttributes, this._activeConfig.attributes);
    this._applyConfig(this._activeConfig);
  }

  // attr(name: string, value: string | number | boolean | null): this;
  // attr(name: string): string;
  // attr(name: any, value?: string | number | boolean | null): any {
  //   if (value === undefined) return this.selection().attr(name);
  //   if (value === null) this.selection().attr(name, null);
  //   else this.selection().attr(name, value);
  //   return this;
  // }

  // attributes(attributes: Attributes): this {
  //   this._attributes = Object.assign(this._attributes, attributes);
  //   this.selection().call(applyAttributes, attributes);
  //   return this;
  // }

  // layout(name: string, value: string | number | null): this;
  // layout(name: string): string;
  // layout(): ILayoutStyle;
  // layout(name?: string, value?: string | number | null): any {
  //   if (name === undefined) return this._layout;
  //   if (value === undefined) return this._layout[name];
  //   if (value === null) delete this._layout[name];
  //   else this._layout[name] = value;
  //   return this;
  // }

  // mediaQuery(
  //   query: string,
  //   callback: ((component: IComponent) => void) | null
  // ): this {
  //   if (callback === null) {
  //     this._mediaQueries[query].removeEventListener(
  //       'change',
  //       this._onMediaQueryChanged
  //     );
  //     delete this._mediaQueries[query];
  //     delete this._mediaQueryCallbacks[query];
  //   } else {
  //     const mediaQuery = this._mediaQueries[query] || window.matchMedia(query);
  //     this._mediaQueries[query] = mediaQuery;
  //     this._mediaQueryCallbacks[query] = callback;
  //     mediaQuery.addEventListener('change', this._onMediaQueryChanged);
  //   }
  //   return this;
  // }

  // private _onMediaQueryChanged(): void {
  //   debugger;
  //   for (let query in this._mediaQueries) {
  //     if (this._mediaQueries[query].matches) {
  //       this._mediaQueryCallbacks[query](this);
  //     }
  //   }
  // }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}
