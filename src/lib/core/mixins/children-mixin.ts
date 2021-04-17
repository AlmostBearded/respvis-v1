import { BaseComponent, ComponentEventData } from '../component';
import { Constructor, Mixin } from './types';

export interface ChildrenMixinEventData<TComponent extends BaseComponent>
  extends ComponentEventData<TComponent> {
  childIndex: number;
}

export function withChildren<
  TChildrenBaseComponent extends BaseComponent,
  TBaseComponentConstructor extends Constructor<BaseComponent>
>(BaseComponent: TBaseComponentConstructor) {
  return class WithChildren extends BaseComponent {
    private _children: Map<string, TChildrenBaseComponent>;

    constructor(...args: any[]) {
      super(...args);
      this._children = new Map();
    }

    // todo: 'index' or 'order' instead of 'name'?
    // - would solve the issue of child order
    // - 'index' would have to be unique, 'order' not a good idea?
    child<TChild extends TChildrenBaseComponent = TChildrenBaseComponent>(
      name: string
    ): TChild | undefined;
    child(name: string, component: null): this;
    child(name: string, component: BaseComponent): this;
    child<TChild extends TChildrenBaseComponent = TChildrenBaseComponent>(
      name: string,
      component?: TChild | null
    ): TChild | undefined | this {
      if (component === undefined) return this._children.get(name) as TChild;
      else if (component === null) this._children.delete(name);
      else this._children.set(name, component);
      return this;
    }

    // todo: this is probably very heavy on performance
    // - if the children would be accessed by index they could be
    //   stored as an array and this method wouldn't have to create
    //   artificial ones on every invokation.
    children(): TChildrenBaseComponent[] {
      return Array.from(this._children.values());
    }

    // mount(chart: Chart): this {
    //   super.mount(chart);

    //   // todo: ordering of children
    //   this._children.forEach((c) => {
    //     this.selection().append(() => c.selection().node());
    //     c.mount(chart);
    //   });
    //   return this;
    // }

    // configure(): this {
    //   super.configure();
    //   this._children.forEach((c) => c.configure());
    //   return this;
    // }

    // beforeLayout(): this {
    //   super.beforeLayout();
    //   this._children.forEach((c) => c.beforeLayout());
    //   return this;
    // }

    // afterLayout(): this {
    //   super.afterLayout();
    //   this._children.forEach((c) => c.afterLayout());
    //   return this;
    // }

    // render(): this {
    //   super.render();
    //   this._children.forEach((c) => c.render());
    //   return this;
    // }

    // transition(): this {
    //   super.transition();
    //   this._children.forEach((c) => c.transition());
    //   return this;
    // }

    // eventData(event: Event): ChildrenMixinEventData<this> | null {
    //   let childElement = event.target as Element;
    //   while (childElement.parentNode !== event.currentTarget) {
    //     childElement = childElement.parentNode as Element;
    //   }
    //   const indexOf = Array.prototype.indexOf;
    //   const childIndex = indexOf.call(childElement.parentNode!.children, childElement);
    //   return {
    //     component: this,
    //     childIndex: childIndex,
    //   };
    // }
  };
}

export type ComponentWithChildren = Mixin<typeof withChildren>;
