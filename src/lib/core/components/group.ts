import { Component, IComponent, IComponentConfig } from '../component';
import { Selection, BaseType, create } from 'd3-selection';
import { nullFunction } from '../utils';

export interface IGroupComponentConfig extends IComponentConfig {
  children: IComponent<IComponentConfig>[];
}

export interface IGroupComponent extends IComponent<IGroupComponentConfig> {}

export class GroupComponent extends Component<IGroupComponentConfig> implements IGroupComponent {
  constructor() {
    super(
      create<SVGElement>('svg:g'),
      {
        children: [],
        attributes: {
          'grid-template': 'auto / auto',
        },
        conditionalConfigs: [],
        customConfigParser: nullFunction,
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IGroupComponentConfig): void {
    // TODO: Handle mounting/unmounting of children after group has been mounted
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.activeConfig()
      .children.sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.mount(this.selection()));
    return this;
  }

  resize(): this {
    this.activeConfig()
      .children.sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.resize());
    return this;
  }

  protected _afterResize(): void {
    this.activeConfig()
      .children.sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.afterResize());
  }

  render(animated: boolean): this {
    this.activeConfig()
      .children.sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.render(animated));
    return this;
  }

  renderOrder(): number {
    // TODO: This should probably configurable by the user
    return 0;
  }
}

export function group(): GroupComponent {
  return new GroupComponent();
}
