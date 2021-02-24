import { Chart } from '../chart';
import { Component, ComponentEventData } from '../component';
import { Constructor, Mixin } from './types';

export interface ChildrenMixinEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  childIndex: number;
}

export function ChildrenMixin<TBaseComponent extends Constructor<Component>>(
  BaseComponent: TBaseComponent
) {
  return class ChildrenMixin extends BaseComponent {
    private _children: Map<string, Component>;

    constructor(...args: any[]) {
      super(...args);
      this._children = new Map();
    }

    child<T extends Component = Component>(name: string): T | undefined;
    child(name: string, component: null): this;
    child(name: string, component: Component): this;
    child<T extends Component = Component>(
      name: string,
      component?: T | null
    ): T | undefined | this {
      if (component === undefined) return this._children.get(name) as T;
      else if (component === null) this._children.delete(name);
      else this._children.set(name, component);
      return this;
    }

    children(): Component[] {
      return Array.from(this._children.values());
    }

    mount(chart: Chart): this {
      super.mount(chart);

      // todo: ordering of children
      this._children.forEach((c) => {
        this.selection().append(() => c.selection().node());
        c.mount(chart);
      });
      return this;
    }

    configure(): this {
      super.configure();
      this._children.forEach((c) => c.configure());
      return this;
    }

    beforeLayout(): this {
      super.beforeLayout();
      this._children.forEach((c) => c.beforeLayout());
      return this;
    }

    afterLayout(): this {
      super.afterLayout();
      this._children.forEach((c) => c.afterLayout());
      return this;
    }

    render(): this {
      super.render();
      this._children.forEach((c) => c.render());
      return this;
    }

    transition(): this {
      super.transition();
      this._children.forEach((c) => c.transition());
      return this;
    }

    eventData(event: Event): ChildrenMixinEventData<this> | null {
      let childElement = event.target as Element;
      while (childElement.parentNode !== event.currentTarget) {
        childElement = childElement.parentNode as Element;
      }
      const indexOf = Array.prototype.indexOf;
      const childIndex = indexOf.call(childElement.parentNode!.children, childElement);
      return {
        component: this,
        childIndex: childIndex,
      };
    }
  };
}

export type ComponentWithChildren = Mixin<typeof ChildrenMixin>;
