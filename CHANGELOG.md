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
- Highlight bars using a brightness filter.

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

### Fixed

- Fix dataAxis function ignoring passed in title and subtitle properties.
- Fix bar label jittering in Firefox

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
