// adds a color config property to ease point radius configuration
export default function withPointRadius(points) {
  return points.config((c) => ({
    // initialize with default radius
    radius: 4,
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(newConfig.attributes, { '.point': { r: newConfig.radius } });
      c.parseConfig(previousConfig, newConfig);
    },
  }));
}
