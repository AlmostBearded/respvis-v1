# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add [d3 legend](https://d3-legend.susielu.com/) library for usage in examples.
- Add subtitles to axes.
- Add cartesian chart component to handle flipping of axes.
- Add legend component.
- Add square symbol legend data function.
- Add square legend to grouped bar charts.
- Add square legend to stacked bar charts.
- Add seriesLabelBarRightConfig function to configure right bar labels.
- Add chroma.js library as external library for examples.
- Add brightness filter.
- Grouped bar chart example:
  - Highlight grouped bars on hover.
  - Highlight all grouped bars in category on hover over main axis tick.
  - Highlight all grouped bars with subcategory on hover over legend item.
- Add generic DataSeriesGenerator interface for series data.
- Add dataGenerator property to series data interfaces.
- Add properties function to selections to get an array of a property from all elements in a selection.
- Add HTML checkbox series.
- Add chart windows that encapsulate charts.
- Add toolbar to chart windows.
- Add dropdown menus.
- Add tool dropdown menu.
- Add nominal filter tool.
- Add subcategory filter to grouped bar chart example.
- Add category filter to grouped bar chart example.
- Add barHighlight function.
- Add barFind function to find bars by key.
- Add barFindByIndex function.
- Add barGroupedFindByGroupIndex function.
- Add automatic highlighting of bars on hover to bar series.
- Add labelHighlight function.
- Add labelFind function find labels by key.
- Add labelFindByIndex function.
- Add labelFindByFilter function.
- Add axisTickHighlight function.
- Add axisTickFindByIndex function.
- Add chartBarHoverBar function to apply hover over bar effects to bar chart.
- Add automatic highlighting of bars, labels and main axis ticks to bar chart.
- Add findByFilter utility function.
- Add findByDataProperty utility function.
- Add findByKey utility function.
- Add findByIndex utility function.
- Add legendItemHighlight function.
- Add automatic highlighting of legend items on hover to legend.
- Add legendItemFindByLabel function.
- Add legendItemFindByIndex function.
- Add closest method to selections (D3 equivalent to Element.closest).
- Add automatic highlighting of bars to grouped bar series.
- Add automatic highlighting of bars, labels, main axis ticks and legend items to grouped bar chart.
- Add chartBarGroupedHoverBar function to apply hover over bar effects to grouped bar chart.
- Add siblingIndex utility function to get sibling index of a node with an optional selector that siblings need to match.
- Add subcategories property to grouped bar chart data.

### Changed

- Set custom colors in grouped bar example.
- Set sans-serif font family on whole chart.
- Decrease font-size of axis titles.
- Make bar chart a subcomponent of cartesian chart.
- Make grouped bar chart a subcomponent of cartesian chart.
- Make stacked bar chart a subcomponent of cartesian chart.
- Make point chart a subcomponent of cartesian chart.
- Use flipped property of cartesian charts to flip bar charts.
- Rename DataBarsCreation interface to DataSeriesBarCreation.
- Rename DataBarsGroupedCreation interface to DataSeriesBarGroupedCreation.
- Rename DataBarsStackedCreation interface to DataSeriesBarStackedCreation.
- Rename DataPointsCreation interface to DataSeriesPointCreation.
- Wrap contents of cartesian charts into a chart container wrapper.
- Show horizontal bar labels on the right in bar chart example.
- Show horizontal bar labels on the right in grouped bar chart example.
- Configure components only once in the configure function.
- Highlight points in scatterplot example with a brightness filter.
- Refactor & unify series data.
  - Rename DataSeriesXCreation classes to just DataSeriesX.
  - Set series data directly on data instead of on data.creation properties.
  - Rename data creation functions (dataBars, dataGroupedBars, ..., dataPoints) to generator functions (dataBarGenerator, ..., dataPointGenerator).
  - Uniformly pass series selection into data generator functions.
  - Change all data creation inputs to be non-optional.
- Rename bar label series data positionFromRect property to rectPositioner.
- Wrap grouped bar chart example into chart window with toolbar.
- Move highlighting code from examples into framework components.
- Require layouter data to be set before initializing layouter nodes.
- Rename bar series data properties:
  - mainValues → categories
  - mainScale → categoryScale
  - crossValues → values
  - crossScale → valueScale
- Rename grouped bar series data property innerPadding → subcategoryPadding.
- Rename cartesian chart data axes properties:
  - mainAxis → xAxis
  - crossAxis → yAxis
- Rename point series data properties:
  - mainValues → xValues
  - mainScale → xScale
  - crossValues → yValues
  - crossScale → yScale

### Removed

- Remove bar orientation enum.
- Remove orientation property from bar series and bar charts data.
- Remove DataSeriesBarCustom interface & dataSeriesBarCustom function.
- Remove DataSeriesPointCustom interface & dataSeriesPointCustom function.
- Remove creation property from bar series data.
- Remove creation property from grouped bar series data.
- Remove creation property from stacked bar series data.
- Remove creation property from point series data.
- Remove chroma.js dependency and the corresponding color functions.
- Remove DataSeries interface and dataSeries creation function.
- Remove unused transformData, transformAttr and transformCall selection methods.

### Fixed

- Fix dataAxis function ignoring passed in title and subtitle properties.
- Fix bar label jittering in Firefox.
- Fix bar labels for exiting bars.
- Fix stacked bar keys in stacked bar chart example.
- Fix keys not being passed into series data from partial parameter.

## [0.1.0] - 2021-06-02

### Added

- Add browser-based layouter.
- Add layouter node that wraps a chart and lays out its contents.
- Add dependency on ResizeObserver Web API.
- Add dependency on MutationObserver Web API.
- Add toggleable debug logging.
- Dispatch 'datachange' event when node data changes.
- Add this change log.
- Add rectEquals function to compare rects.

### Changed

- Layout is now configured via selection.layout(...) method.
- Node bounds calculated by layouter can be accessed via selection.bounds() method.
- Only dispatch 'render' event on nodes whose bounds have changed
- Dispatch 'render' event when 'datachange' event occurs on specific nodes.
  - No need to manually rerender charts anymore.
- Set cubic out (instead of cubic in out) easing on all render transitions.
- Name all transitions so multiple transitions can be started concurrently.
- Use chroma.js in bar chart example to brighten bar colors on hover.

### Removed

- Remove FaberJS-based layouter and its dependencies.
- Remove old brush components and example.
- Remove all transition events on series joins.

### Deprecated

- Deprecate IE support due to usage of modern Web APIs.

### Fixed

- Fix value parameter bug in rect and position functions that accept value or value function parameters.
