// adds a color config property to ease point color configuration
export default function withPointColor(points) {
  return points.config((c) => ({
    // initialize with default colors
    color: respVis.PointsComponent.defaultColor,
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(newConfig.attributes, { fill: newConfig.color });
      c.parseConfig(previousConfig, newConfig);
    },
  }));
}
