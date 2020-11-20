// adds a color config property to ease bar color configuration
export default function withBarColor(bars) {
  return bars.config((c) => ({
    // initialize with default colors
    color: respVis.BarsComponent.defaultColor,
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(newConfig.attributes, { '.bar': { fill: newConfig.color } });
      c.parseConfig(previousConfig, newConfig);
    },
  }));
}
