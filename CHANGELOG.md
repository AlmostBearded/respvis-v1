# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Set cubic out easing on all render transitions.
- Name all transitions so multiple transitions can be started concurrently.

### Removed

- Remove FaberJS-based layouter and its dependencies.
- Remove old brush components and example.
- Remove all transition events on series joins.

### Deprecated

- Deprecate IE support due to usage of modern Web APIs.

### Fixed

- Fix value parameter bug in rect and position functions that accept value or value function parameters.
