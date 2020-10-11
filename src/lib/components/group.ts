import { Component, IComponent, IComponentConfig } from '../component';
import { Selection, BaseType, select, create } from 'd3-selection';

export interface IGroupConfig extends IComponentConfig {
  children: IComponent<IComponentConfig>[];
}

export interface IGroup extends IComponent<IGroupConfig> {}

export class Group extends Component<IGroupConfig> implements IGroup {
  constructor() {
    super(create<SVGElement>('svg:g'), {
      children: [],
      attributes: {
        'grid-template': 'auto / auto',
      },
      conditionalConfigs: [],
    });
  }

  protected _applyConfig(config: IGroupConfig): void {
    // TODO: Handle mounting/unmounting of children after group has been mounted
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this._activeConfig.children
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.mount(this.selection()));
    return this;
  }

  resize(): this {
    this._activeConfig.children
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.resize());
    return this;
  }

  protected _afterResize(): void {
    this._activeConfig.children
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.afterResize());
  }

  render(animated: boolean): this {
    this._activeConfig.children
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.render(animated));
    return this;
  }

  renderOrder(): number {
    // TODO: This should probably configurable by the user
    return 0;
  }
}

export function group(): Group {
  return new Group();
}
