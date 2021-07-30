# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add chartCartesian.
  - Handles flipping of axes.
- Add legend.
- Add dataLegendItemSquareGenerator
  - To create legend with square symbols.
- Add legend to chartBarGrouped.
- Add legend to chartBarStacked.
- Add menuDropdown.
- Add menuTools (menuDropdown).
- Add toolbar.
- Add chartWindow (= chart + toolbar).
- Add toolDownloadSVG.
  - To download the chart inside a chartWindow as an SVG file.
- Add seriesCheckbox.
- Add toolFilterNominal.
- Add chartWindowBar (= chartBar + toolbar with category filter)
- Add chartWindowBarGrouped (= chartBarGrouped + toolbar with category & subcategory filters)
- Add chartWindowBarStacked (= chartBarStacked + toolbar with category & subcategory filters)
- Add barHighlight function.
- Add barGroupedHighlight function.
- Add barStackedHighlight function.
- Add labelHighlight function.
- Add legendItemHighlight function.
- Add axisTickHighlight function.
- Add findByFilter utility function.
- Add findByDataProperty utility function.
- Add findByKey utility function.
- Add findByIndex utility function.
- Add siblingIndex utility function.
  - Get sibling index of a node with optional selector that siblings need to match.
- Add siblingIndexSameClasses function.
- Add barFind function to find bars by key.
- Add barFindByCategory function.
- Add barGroupedFindBySubcategory function.
- Add barStackedFindBySubcategory function.
- Add labelFind function find labels by key.
- Add labelFindByIndex function.
- Add labelFindByFilter function.
- Add axisTickFindByIndex function.
- Add legendItemFindByLabel function.
- Add legendItemFindByIndex function.
- Add arrayIs function.
- Add arrayIs2D function.
- Add arrayFlat function.
- Add arrayPartition function.
- Add ValueOrArray type.
- Add NestedArray type.
- Add automatic highlighting of bars on hover to seriesBar.
- Add automatic highlighting of bars on hover to seriesBarGrouped.
- Add automatic highlighting of legend items on hover to legend.
- Add automatic highlighting of bars, labels and main axis ticks to chartBar.
- Add automatic highlighting of bars, labels, main axis ticks and legend items to chartBarGrouped.
- Add automatic highlighting of bars, labels, main axis ticks and legend items to chartBarStacked.
- Add Selection.properties function.
  - Get an array of a property from all elements in a selection.
- Add Selection.closest function.
  - Select the closest ancestors that match a selector (equivalent to Element.closest).
- Add subcategories to dataChartBarGrouped.
  - Used as default legend labels.
- Add subtitle to dataAxis & axisX.
- Add seriesLabelBarRightConfig.
  - Configures seriesLabelBar labels to appear to the right of bars.
- Add filterBrightness.
- Add colors property to seriesBar, seriesBarGrouped & seriesBarStacked.
- Add stokeWidths property to seriesBar, seriesBarGrouped & seriesBarStacked.
- Add stoke property to seriesBar, seriesBarGrouped & seriesBarStacked.
- Add category, subcategory and value properties to DataBar & DataBarGrouped
- Add labels property to chartBar, chartBarGrouped & chartBarStacked.

### Changed

- Set custom colors in grouped bar chart example.
- Show horizontal bar labels on the right in bar chart example.
- Show horizontal bar labels on the right in grouped bar chart example.
- Use chartWindowBar in bar chart example.
- Use chartWindowBarGrouped in grouped bar chart example.
- Configure components only once in configure function of examples.
- Move highlighting code from examples into series & chart components.
- Set sans-serif font family on chart.
- Decrease font-size of axis title.
- Make chartBar a subcomponent of chartCartesian.
- Make chartBarGrouped a subcomponent of chartCartesian.
- Make chartBarStacked a subcomponent of chartCartesian.
- Make chartPoint a subcomponent of chartCartesian.
- Highlight points in scatterplot example with a brightness filter.
- Rename dataSeriesXCreation to just dataSeriesX.
- Make partial inputs of dataX functions non-optional.
- Rename dataSeriesLabelBar positionFromRect property to rectPositioner.
- Allow passing ((DataBar) => string) function to labels property of DataLabelSeriesBar.
- Require layouter data to be set before initializing layouter.
- Rename dataSeriesBar properties:
  - mainValues → categories
  - mainScale → categoryScale
  - crossValues → values
  - crossScale → valueScale
- Rename dataSeriesBarGrouped property innerPadding → subcategoryPadding.
- Rename dataSeriesPoint properties:
  - mainValues → xValues
  - mainScale → xScale
  - crossValues → yValues
  - crossScale → yScale
- Set viewBox attribute on chart root.
- Remove width and height attributes from chart root.
- Set namespace attribute on chart.

### Removed

- Remove BarOrientation enum.
- Remove orientation property from dataSeriesBar & dataChartBar.
- Remove dataSeriesBarCustom.
- Remove dataSeriesPointCustom.
- Remove creation property from dataSeriesBar.
- Remove creation property from dataSeriesBarGrouped.
- Remove creation property from dataSeriesBarStacked.
- Remove creation property from dataSeriesPoint.
- Remove chroma.js dependency and the corresponding color functions.
- Remove DataSeries interface and dataSeries creation function.
- Remove unused Selection.transformData.
- Remove unused Selection.transformAttr.
- Remove unused Selection.transformCall.
- Remove index and groupIndex properties from DataBar & DataBarGrouped.
- Remove DataBarStacked.

### Fixed

- Fix dataAxis function ignoring passed in title and subtitle properties.
- Fix bar label jittering in Firefox.
- Fix bar labels for exiting bars.
- Fix stacked bar keys in stacked bar chart example.
- Fix keys not being passed into series data from partial parameter.
- Fix keys property type in DataSeriesBarGrouped & DataSeriesBarStacked.
- Fix dataChartCartesian not setting passed in data.flipped property.

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
- Remove IE support due to usage of modern Web APIs.

### Fixed

- Fix value parameter bug in rect and position functions that accept value or value function parameters.
