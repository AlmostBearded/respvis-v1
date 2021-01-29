import { create, select, selectAll, Selection } from 'd3-selection';
import { Chart } from '../chart';
import { Component, ComponentEventData } from '../component';
import { LaidOutElement } from '../layout/layout';
import { ISize } from '../utils';
import { Constructor } from './types';

export function StaticSizeMixin<TBaseComponent extends Constructor<Component>>(
  BaseComponent: TBaseComponent
) {
  return class StaticSizeMixin extends BaseComponent {
    private _staticCloneSelection: Selection<SVGElement & LaidOutElement, any, any, any>;
    private _combinedSelection: Selection<SVGElement & LaidOutElement, any, any, any>;

    constructor(...args: any[]) {
      super(...args);
      this._staticCloneSelection = create(`svg:${this.node().tagName}`);
      this._combinedSelection = selectAll([
        this.selection().node()!,
        this._staticCloneSelection.node()!,
      ]);

      // can't access 'this' within the bounds calculator callback
      const that = this;
      this._combinedSelection.layoutBoundsCalculator(() => that.size());
    }

    attr(name: string): string;
    attr(name: string, value: null): this;
    attr(name: string, value: string | number | boolean): this;
    attr(name: string, value: string | number | boolean, transitionDuration: number): this;
    attr(
      name: string,
      value: string | number | boolean,
      transitionDuration: number,
      transitionDelay: number
    ): this;
    attr(
      name: string,
      value?: null | string | number | boolean,
      transitionDuration?: number,
      transitionDelay?: number
    ): string | this {
      if (value === undefined) return this.selection().attr(name);
      if (value === null) this._combinedSelection.attr(name, null);
      else {
        if (transitionDuration === undefined) this._combinedSelection.attr(name, value);
        else {
          // transition attribute
          this.selection()
            .transition(name)
            .delay(transitionDelay || 0)
            .duration(transitionDuration)
            .attr(name, value);

          // set attribute without transition on clone
          this._staticCloneSelection.attr(name, value);
        }
      }

      return this;
    }

    classed(names: string): boolean;
    classed(names: string, value: boolean): this;
    classed(names: string, value?: boolean): boolean | this {
      if (value === undefined) return this._combinedSelection.classed(names);
      this._combinedSelection.classed(names, value);
      return this;
    }

    style(name: string): string;
    style(name: string, value: null): this;
    style(name: string, value: string | number | boolean, priority?: 'important' | null): this;
    style(
      name: string,
      value?: null | string | number | boolean,
      priority?: 'important' | null
    ): string | this {
      if (value === undefined) return this._combinedSelection.style(name);
      if (value === null) this._combinedSelection.style(name, null);
      else this._combinedSelection.style(name, value, priority);
      return this;
    }

    text(): string;
    text(value: null): this;
    text(value: string | number | boolean): this;
    text(value: string | number | boolean, transitionDuration: number): this;
    text(
      value: string | number | boolean,
      transitionDuration: number,
      transitionDelay: number
    ): this;
    text(
      value?: null | string | number | boolean,
      transitionDuration?: number,
      transitionDelay?: number
    ): string | this {
      if (value === undefined) return this._combinedSelection.text();
      if (value === null) this._combinedSelection.text(null);
      else {
        if (transitionDuration === undefined) this._combinedSelection.text(value);
        else {
          this.selection()
            .transition('text')
            .delay(transitionDelay || 0)
            .duration(transitionDuration)
            .text(value);
          this._staticCloneSelection.text(value);
        }
      }
      return this;
    }

    size(): ISize {
      select(this.node().parentElement).append(() => this._staticCloneSelection.node());
      const bounds = this._staticCloneSelection.node()!.getBoundingClientRect();
      this._staticCloneSelection.remove();
      return bounds;
    }

    staticCloneSelection(): Selection<SVGElement, any, any, any> {
      return this._staticCloneSelection;
    }
  };
}
