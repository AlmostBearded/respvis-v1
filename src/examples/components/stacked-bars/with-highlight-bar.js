// TODO: This HOC is 99% equal to the groupedBars one and could potentially also be applied to the normal bars component. Combine?

import withColors from './with-bar-colors.js';

// adds highlighting functionality to stacked bars
// (includes the withBarColors HOC)
export default function withHighlightBar(stackedBars) {
  // wrap grouped bars into withBarColors HOC
  stackedBars = withColors(stackedBars);

  stackedBars.config((c) => ({
    // set config parser
    configParser: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(
        newConfig.attributes,
        ...newConfig.colors.map((c, i) => ({
          // set attributes of individual bars when highlighted
          [`.bar:nth-child(${i + 1})[highlighted=true]`]: {
            fill: respVis.chroma.hex(c).brighten(0.5).hex(),
            'stroke-width': 6,
          },
        }))
      );
      c.configParser(previousConfig, newConfig);
    },
  }));

  stackedBars.highlightBar = function highlightBar(categoryIndex, barIndex, highlight) {
    // set highlighted attribute on specific bar
    stackedBars
      .selection()
      .select(`.bar-stack:nth-of-type(${categoryIndex + 1}) .bar:nth-of-type(${barIndex + 1})`)
      .attr('highlighted', highlight);

    // reapply configuration
    stackedBars.config({});

    return stackedBars;
  };

  return stackedBars;
}
