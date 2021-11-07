```ts
const data = [
  { category: 'a', value: 1 },
  { category: 'b', value: 2 },
  { category: 'c', value: 3 },
];
const categories = data.map((d) => d.category);
const values = data.map((d) => d.value);
const valueDomain = [0, Math.max(...values)];
const categoryScale = scaleBand().domain(categories).padding(0.1);
const valueScale = scaleLinear().domain(valueDomain).nice();
const root = select('#chart-container');
root
  .selectAll('.series-bar')
  .data([
    (selection) => {
      seriesBar(selection, { categories, values, categoryScale, valueScale });
    },
  ])
  .join('svg')
  .call(render);

export function serieesBar(selection: )
```

` *(.*?): *(.*?);` →

````
public get $1(): $2 {
  return this._data.$1;
}

public set $1($1: $2) {
  this._data.$1 = $1;
}```

```ts
const categories = ['A', 'B'];
const values = [1, 2];

const categoryScale = d3.scaleBand().domain(categories).padding(0.1);
const valueScale = d3.scaleLinear().domain([0, Math.max(...values)]).nice();

const chart = root
  .append('div')
  .datum(chartData)
  .call(respVis.chart)
````

Idea for a generic chart type.

There would be one generic chart type that is the equivalent of a generic chart window that takes various generic configurations and build a chart from that.
The user API could look similar to the following:

```ts
interface ScalesConfig {
  [key: string]: AxisScale<any>;
}

interface AxisConfig<Data, Scales> {
  config: (data: Data, scales: Scales) => Axis;
  render: (selection: Selection<SVGElement, Axis>) => void;
}

interface SeriesConfig<Data, Scales> {
  config: (data: Data, scales: Scales) => any;
  join: (selection: Selection, config: any[], joinDecorator: JoinDecorator<Element, any>) => void;
  joinDecorator: JoinDecorator<Element, any>;
}

interface ChartConfig<
  Data extends any[],
  Scales extends ScalesConfig,
  Axes extends Record<string, AxisConfig<Data, Scales>>,
  Series extends Record<string, SeriesConfig<Data, Scales>>
> {
  data: Data;
  scales: Scales;
  axes: Axes;
  series: Series;
  updateScales: (scales: Scales, data: Data, bounds: Size) => void;
}

function chartConfig<
  Data extends any[],
  Scales extends ScalesConfig,
  Axes extends Record<string, AxisConfig<Data, Scales>>,
  Series extends Record<string, SeriesConfig<Data, Scales>>
>(data: ChartConfig<Data, Scales, Axes, Series>) {
  return data;
}

const d = chartConfig({
  data: [
    { category: 'A', value: 1 },
    { category: 'B', value: 2 },
  ],
  scales: {
    category: scaleBand(),
    value: scaleLinear<number, number>(),
  } as const,
  axes: { left: { config: (data, scales) => {...}, render: axisBottomRender } },
  series: {
    bars: {
      config: (data, scales) =>
        seriesBarData({
          categories: data.map((d) => d.category),
          values: data.map((d) => d.value),
          categoryScale: scales.category,
          valueScale: scales.value,
        }),
      join: seriesBarJoin,
      joinDecorator: {},
    },
  },
  updateScales: function (scales, data, bounds) {
    scales.category
      .domain(data.map((d) => d.category))
      .range([0, bounds.width])
      .padding(0.1);
    scales.value
      .domain([0, Math.max(...data.map((d) => d.value))])
      .range([bounds.height, 0])
      .nice();
  },
});

```
