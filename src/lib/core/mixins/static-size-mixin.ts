import { create, select, selectAll, Selection } from 'd3-selection';
import { BaseChartComponent } from '../chart-component';
import { Constructor } from './types';

export function StaticSizeMixin<TBaseComponent extends Constructor<BaseChartComponent>>(
  BaseComponent: TBaseComponent
) {
  return class StaticSizeMixin extends BaseComponent {
    private _staticCloneSelection: Selection<Element, any, any, any>;
    private _combinedSelection: Selection<Element, any, any, any>;

    constructor(...args: any[]) {
      super(...args);
      this._staticCloneSelection = create(`svg:${this.node().tagName}`);
      this._combinedSelection = selectAll([
        this.selection().node()!,
        this._staticCloneSelection.node()!,
      ]);

      // can't access 'this' within the bounds calculator callback
      const that = this;
      this.selection().layoutBoundsCalculator(() => {
        select(that.node().parentElement).append(() => that._staticCloneSelection.node());
        const bounds = that._staticCloneSelection.node()!.getBoundingClientRect();
        that._staticCloneSelection.remove();
        return bounds;
      });
    }

    protected _removeAttr(name: string): void {
      super._removeAttr(name);
      this._staticCloneSelection.attr(name, null);
    }

    protected _setAttr(name: string, value: string | number | boolean): void {
      super._setAttr(name, value);
      this._staticCloneSelection.attr(name, value);
    }

    protected _transitionAttr(
      name: string,
      value: string | number | boolean,
      transitionDuration: number,
      transitionDelay: number
    ): void {
      // transition attribute
      super._transitionAttr(name, value, transitionDuration, transitionDelay);

      // set attribute without transition on clone
      this._staticCloneSelection.attr(name, value);
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

    staticCloneSelection(): Selection<Element, any, any, any> {
      return this._staticCloneSelection;
    }
  };
}
