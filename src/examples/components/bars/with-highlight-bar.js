import withColor from './with-bar-color.js';

// adds highlighting functionality to grouped bars
// (includes the withBarColor HOC)
export default function withHighlightBar(bars) {
  // wrap bars into withColors HOC
  bars = withColor(bars);

  bars.config((c) => ({
    // set config parser
    parseConfig: (previousConfig, newConfig) => {
      // using deepExtend to only override specified attributes
      respVis.utils.deepExtend(newConfig.attributes, {
        '.bar[highlighted=true]': {
          fill: respVis.chroma.hex(newConfig.color).brighten(0.5).hex(),
          'stroke-width': 4,
        },
      });
      c.parseConfig(previousConfig, newConfig);
    },
  }));

  bars.highlightBar = function highlightBar(barIndex, highlight) {
    // set highlighted attribute on specific bar
    bars
      .selection()
      .select(`.bar:nth-of-type(${barIndex + 1})`)
      .attr('highlighted', highlight);

    // reapply configuration
    bars.config({});

    return bars;
  };

  return bars;
}
