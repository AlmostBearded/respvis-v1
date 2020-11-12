// TODO: This HOC is 100% equal to the stackedBars one and could also be applied to the normal bars component. Combine them?

// adds a color config property to ease bar color configuration
export default function withBarColors(groupedBars) {
  return groupedBars.config((c) => ({
    // initialize with default colors
    colors: respVis.GroupedBarsComponent.defaultColors,
    // set config parser
    configParser: (previousConfig, newConfig) => {
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
      c.configParser(previousConfig, newConfig);
    },
  }));
}
