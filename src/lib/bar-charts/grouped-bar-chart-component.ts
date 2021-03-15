import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import {
  AxisComponent,
  BottomAxisComponent,
  LeftAxisComponent,
  RightAxisComponent,
  TopAxisComponent,
  XAxisPosition,
  YAxisPosition,
} from '../axis';
import {
  GroupedBars,
  GroupedBarsComponent,
  BarOrientation,
  BarData,
  GroupedBarData,
} from '../bars';
import { CartesianChartComponent } from '../cartesian-chart';

export class GroupedBarChartComponent extends CartesianChartComponent implements GroupedBars {
  private _bars: GroupedBarsComponent;

  constructor() {
    super();

    this.drawArea().child('bars', (this._bars = new GroupedBarsComponent()));
  }

  bars(): GroupedBarsComponent {
    return this._bars;
  }

  mainAxis(): AxisComponent {
    if (this.orientation() === BarOrientation.Vertical) return this.xAxis();
    else return this.yAxis();
  }

  crossAxis(): AxisComponent {
    if (this.orientation() === BarOrientation.Vertical) return this.yAxis();
    else return this.xAxis();
  }

  mainValues(): any[];
  mainValues(values: any[]): this;
  mainValues(values?: any[]): any[] | this {
    if (values === undefined) return this._bars.mainValues();
    this._bars.mainValues(values);
    return this;
  }

  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  mainScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._bars.mainScale();
    this._bars.mainScale(scale);
    this.mainAxis().ticks().scale(scale);
    return this;
  }

  mainTitle(): string;
  mainTitle(title: string): this;
  mainTitle(title?: string): string | this {
    if (title === undefined) return this.mainAxis().title().text();
    this.mainAxis().title().text(title);
    return this;
  }

  crossValues(): any[][];
  crossValues(values: any[][]): this;
  crossValues(values?: any[][]): any[][] | this {
    if (values === undefined) return this._bars.crossValues();
    this._bars.crossValues(values);
    return this;
  }

  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  crossScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._bars.crossScale();
    this._bars.crossScale(scale);
    this.crossAxis().ticks().scale(scale);
    return this;
  }

  crossTitle(): string;
  crossTitle(title: string): this;
  crossTitle(title?: string): string | this {
    if (title === undefined) return this.crossAxis().title().text();
    this.crossAxis().title().text(title);
    return this;
  }

  mainInnerScale(): ScaleBand<any>;
  mainInnerScale(scale: ScaleBand<any>): this;
  mainInnerScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._bars.mainInnerScale();
    this._bars.mainInnerScale(scale);
    return this;
  }

  keys(): string[][];
  keys(keys: null): this;
  keys(keys: string[][]): this;
  keys(keys?: string[][] | null) {
    if (keys === undefined) return this._bars.keys();
    if (keys === null) this._bars.keys(null);
    else this._bars.keys(keys);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._bars.orientation();

    if (this._bars.orientation() !== orientation) {
      const mainTitle = this.mainAxis().title().text(),
        crossTitle = this.crossAxis().title().text();

      this._bars.orientation(orientation);

      this.mainAxis()
        .call((a) => a.ticks().scale(this.mainScale()))
        .call((a) => a.title().text(mainTitle));
      this.crossAxis()
        .call((a) => a.ticks().scale(this.crossScale()))
        .call((a) => a.title().text(crossTitle));
    }

    return this;
  }

  barData(): GroupedBarData[][] {
    return this._bars.barData();
  }
}

export function groupedBarChart(): GroupedBarChartComponent {
  return new GroupedBarChartComponent();
}
