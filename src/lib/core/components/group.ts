import { Component, IComponent, IComponentConfig, IComponentEventData } from '../component';
import { Selection, BaseType, create } from 'd3-selection';
import { IDictionary, nullFunction } from '../utils';

export interface IGroupComponentConfig extends IComponentConfig {
  children: IComponent<IComponentConfig>[];
  events: IDictionary<(event: Event, data: IGroupEventData) => void>;
}

export interface IGroupEventData extends IComponentEventData {
  childIndex: number;
}

export interface IGroupComponent extends IComponent<IGroupComponentConfig> {}

export class GroupComponent extends Component<IGroupComponentConfig> implements IGroupComponent {
  static setEventListeners(component: GroupComponent, config: IGroupComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        let childElement = e.target as Element;
        while (childElement.parentNode !== e.currentTarget) {
          childElement = childElement.parentNode as Element;
        }

        const indexOf = Array.prototype.indexOf;
        const childIndex = indexOf.call(childElement.parentNode!.children, childElement);

        config.events[typenames](e, {
          component: component,
          childIndex: childIndex,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGElement>('svg:g'),
      {
        children: [],
        attributes: {
          'grid-template': 'auto / auto',
        },
        conditionalConfigs: [],
        configParser: (previousConfig: IGroupComponentConfig, newConfig: IGroupComponentConfig) => {
          GroupComponent.clearEventListeners(this, previousConfig);
          GroupComponent.setEventListeners(this, newConfig);
          // clone children array before sorting to retain order
          [...newConfig.children]
            .sort((a, b) => a.renderOrder() - b.renderOrder())
            .forEach((child) => child.config({}));
        },
        events: {},
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    // clone children array before sorting to retain order
    [...this.activeConfig().children]
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.mount(this.selection()));
    return this;
  }

  resize(): this {
    // clone children array before sorting to retain order
    [...this.activeConfig().children]
      .sort((a, b) => a.renderOrder() - b.renderOrder())
      .forEach((child) => child.resize());
    return this;
  }

  render(animated: boolean): this {
    // clone children array before sorting to retain order
    [...this.activeConfig().children]
      .sort((a, b) => a.renderOrder() - b.renderOrder())
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
