import withColor from './with-point-color.js';
import withRadius from './with-point-radius.js';

// adds highlighting functionality to points
// (includes the withPointColor and withPointRadius HOCs)
export default function withHighlightPoints(points) {
  // wrap points into required HOCs
  points = withRadius(withColor(points));

  points.config((c) => ({
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(newConfig.attributes, {
        '.point': {
          'stroke-width': null,
          fill: null,
        },
        '.point[highlighted=true]': {
          fill: respVis.chroma.hex(newConfig.color).brighten(0.5).hex(),
          r: newConfig.radius * 1.5,
          'stroke-width': 1.5,
        },
      });
      c.parseConfig(previousConfig, newConfig);
    },
  }));

  points.highlightPoint = function highlightPoint(pointIndex, highlight) {
    // set highlighted attribute on specific point
    points
      .selection()
      .select(`.point:nth-of-type(${pointIndex + 1})`)
      .attr('highlighted', highlight);

    // reapply configuration
    points.config({});

    return points;
  };

  points.clearHighlights = function clearHighlights() {
    // clear all point highlights
    points.selection().select(`.point[highlighted=true]`).attr('highlighted', null);

    // reapply configuration
    points.config({});

    return points;
  };

  return points;
}
