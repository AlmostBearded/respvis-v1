// TODO: This HOC is 99% equal to the stackedBars one and could potentially also be applied to the normal bars component. Combine?

import withColors from './with-bar-colors.js';

// adds highlighting functionality to grouped bars
// (includes the withColors HOC)
export default function withHighlightBar(groupedBars) {
  // wrap grouped bars into withColors HOC
  groupedBars = withColors(groupedBars);

  groupedBars.config((c) => ({
    // set config parser
    configParser: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(
        newConfig.attributes,
        ...newConfig.colors.map((c, i) => ({
          // set attributes of individual bars when highlighted
          [`.bar:nth-child(${i + 1})[highlighted=true]`]: {
            fill: respVis.chroma.hex(c).brighten(0.5).hex(),
            'stroke-width': 4,
          },
        }))
      );
      c.configParser(previousConfig, newConfig);
    },
  }));

  groupedBars.highlightBar = function highlightBar(categoryIndex, barIndex, highlight) {
    // set highlighted attribute on specific bar
    groupedBars
      .selection()
      .select(`.bar-group:nth-of-type(${categoryIndex + 1}) .bar:nth-of-type(${barIndex + 1})`)
      .attr('highlighted', highlight);

    // reapply configuration
    groupedBars.config({});

    return groupedBars;
  };

  return groupedBars;
}
