import { Component } from '../components/component';
import { Constructor } from './constructor';

export interface ComponentEventData {
  component: Component;
}

export type ComponentEventFunction = (event: Event, data: ComponentEventData) => void;

export function EventsMixin<TWrappedComponentConstructor extends Constructor<Component>>(
  WrappedComponentConstructor: TWrappedComponentConstructor
) {
  abstract class EventsMixin extends WrappedComponentConstructor {
    protected _events: Map<string, ComponentEventFunction>;

    init(): this {
      super.init();
      this._events = new Map<string, ComponentEventFunction>();
      return this;
    }

    on(typenames: string): ComponentEventFunction | undefined;
    on(typenames: string, callback: null): this;
    on(typenames: string, callback: ComponentEventFunction): this;
    on(
      typenames: string,
      callback?: ComponentEventFunction | null
    ): ComponentEventFunction | undefined | this {
      if (callback === undefined) return this._events.get(typenames);
      if (callback === null) {
        this._events.delete(typenames);
        this.selection().on(typenames, null);
      } else {
        this._events.set(typenames, callback);
        this.selection().on(typenames, (event: Event) =>
          callback(event, this.createEventData(event))
        );
      }
      return this;
    }

    abstract createEventData(event: Event): ComponentEventData;
  }
  return EventsMixin;
}
