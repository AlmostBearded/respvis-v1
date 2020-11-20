// TODO: This HOC is 100% equal to the groupedBars one and could also be applied to the normal bars component. Combine them?

// adds a color config property to ease bar color configuration
export default function withBarColors(stackedBars) {
  return stackedBars.config((c) => ({
    // initialize with default colors
    colors: respVis.StackedBarsComponent.defaultColors,
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(
        newConfig.attributes,
        ...newConfig.colors.map((c, i) => ({
          // set fill attribute of individual bars
          [`.bar:nth-child(${i + 1})`]: {
            fill: c,
          },
        }))
      );
      c.parseConfig(previousConfig, newConfig);
    },
  }));
}