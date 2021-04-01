import { ChildrenMixin } from './children-mixin';
import { Constructor, Mixin } from './types';

export function GridMixin<TBaseComponent extends Constructor<Mixin<typeof ChildrenMixin>>>(
  BaseComponent: TBaseComponent
) {
  return class GridMixin extends BaseComponent {
    private _rowCount: number = 1;
    private _columnCount: number = 1;

    rowCount(): number;
    rowCount(count: number): this;
    rowCount(count?: number) {
      if (count === undefined) return this._rowCount;
      this._rowCount = count;
      return this;
    }

    columnCount(): number;
    columnCount(count: number): this;
    columnCount(count?: number) {
      if (count === undefined) return this._columnCount;
      this._columnCount = count;
      return this;
    }

    beforeLayout(): this {
      super.beforeLayout();

      const rows = Array(this._rowCount).fill('auto').join(' ');
      const columns = Array(this._columnCount).fill('auto').join(' ');

      this.layout('grid-template', `${rows} / ${columns}`);
      this.children().forEach((child, i) => {
        const row = Math.floor(i / this._columnCount) + 1;
        const column = (i % this._columnCount) + 1;
        child.layout('grid-area', `${row} / ${column} / ${row + 1} / ${column + 1}`);
      });

      return this;
    }
  };
}
