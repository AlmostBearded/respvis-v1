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
import { BarOrientation, StackedBarData, StackedBars, StackedBarsComponent } from '../bars';
import { CartesianChartComponent } from '../cartesian-chart';

export class StackedBarChartComponent extends CartesianChartComponent implements StackedBars {
  private _bars: StackedBarsComponent;
  private _xAxisPosition: XAxisPosition;
  private _yAxisPosition: YAxisPosition;

  constructor() {
    super();

    this.drawArea().child('bars', (this._bars = new StackedBarsComponent()));

    this._xAxisPosition = XAxisPosition.Bottom;
    this._yAxisPosition = YAxisPosition.Left;
    this.bottomAxis(new BottomAxisComponent()).leftAxis(new LeftAxisComponent());
  }

  bars(): StackedBarsComponent {
    return this._bars;
  }

  xAxisPosition(): XAxisPosition;
  xAxisPosition(position: XAxisPosition): this;
  xAxisPosition(position?: XAxisPosition): XAxisPosition | this {
    if (position === undefined) return this._xAxisPosition;

    const title = this.xAxis().title().text(),
      scale = this.xAxis().ticks().scale();

    if (this._xAxisPosition === XAxisPosition.Bottom) this.bottomAxis(null);
    if (this._xAxisPosition === XAxisPosition.Top) this.topAxis(null);

    if (position === XAxisPosition.Bottom) this.bottomAxis(new BottomAxisComponent());
    if (position === XAxisPosition.Top) this.topAxis(new TopAxisComponent());

    this._xAxisPosition = position;

    this.xAxis()
      .call((a) => a.ticks().scale(scale))
      .call((a) => a.title().text(title));

    return this;
  }

  yAxisPosition(): YAxisPosition;
  yAxisPosition(position: YAxisPosition): this;
  yAxisPosition(position?: YAxisPosition): YAxisPosition | this {
    if (position === undefined) return this._yAxisPosition;

    const title = this.yAxis().title().text(),
      scale = this.yAxis().ticks().scale();

    if (this._yAxisPosition === YAxisPosition.Left) this.leftAxis(null);
    if (this._yAxisPosition === YAxisPosition.Right) this.rightAxis(null);

    if (position === YAxisPosition.Left) this.leftAxis(new LeftAxisComponent());
    if (position === YAxisPosition.Right) this.rightAxis(new RightAxisComponent());

    this._yAxisPosition = position;

    this.yAxis()
      .call((a) => a.ticks().scale(scale))
      .call((a) => a.title().text(title));

    return this;
  }

  mainAxis(): AxisComponent {
    if (this.orientation() === BarOrientation.Vertical) return this.xAxis();
    else return this.yAxis();
  }

  crossAxis(): AxisComponent {
    if (this.orientation() === BarOrientation.Vertical) return this.yAxis();
    else return this.xAxis();
  }

  xAxis(): AxisComponent {
    if (this._xAxisPosition === XAxisPosition.Bottom) return this.bottomAxis()!;
    else return this.topAxis()!;
  }

  yAxis(): AxisComponent {
    if (this._yAxisPosition === YAxisPosition.Left) return this.leftAxis()!;
    else return this.rightAxis()!;
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

  barData(): StackedBarData[][] {
    return this._bars.barData();
  }
}

export function stackedBarChart(): StackedBarChartComponent {
  return new StackedBarChartComponent();
}
