'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.computeLayout = void 0;
var _utils = require('./utils');
var _constants = require('./utils/constants');
var _grid = require('./grid');
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
var LayoutEngine = (function () {
  function LayoutEngine() {
    _classCallCheck(this, LayoutEngine);
    this.gridLayoutEngine = _grid.computeGridLayout;
  }
  _createClass(LayoutEngine, [
    {
      key: 'compute',
      value: function compute(domTree) {
        switch ((0, _utils.getDisplayProperty)(domTree)) {
          case _constants.DISPLAY_GRID:
            return this.gridLayoutEngine(domTree);
          case _constants.DISPLAY_FLEX:
            return this.gridLayoutEngine(domTree);
          default:
            return this.gridLayoutEngine(domTree);
        }
      },
    },
  ]);
  return LayoutEngine;
})();
var computeLayout = function computeLayout(domTree) {
  var faber = new LayoutEngine();
  var clonedDomTree = (0, _utils.cloneObject)(domTree),
    calculatedTree;
  clonedDomTree.root = true;
  calculatedTree = faber.compute(clonedDomTree);
  (0, _utils.attachLayoutInformation)(domTree, calculatedTree);
  return domTree;
};
exports.computeLayout = computeLayout;
