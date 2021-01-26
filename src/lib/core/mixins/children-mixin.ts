import { Chart } from '../chart';
import { Component, ComponentEventData } from '../component';
import { Constructor } from './types';

export interface ChildrenMixinEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  childIndex: number;
}

export function ChildrenMixin<TBaseComponent extends Constructor<Component>>(
  BaseComponent: TBaseComponent
) {
  return class ChildrenMixin extends BaseComponent {
    private _children: Component[] = [];

    children(): Component[];
    children(children: Component[]): this;
    children(children?: Component[]): Component[] | this {
      if (children === undefined) return this._children;
      this._children = children;
      return this;
    }

    mount(chart: Chart): this {
      super.mount(chart);
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
