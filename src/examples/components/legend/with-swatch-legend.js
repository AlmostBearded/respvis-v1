import withGridLayout from '../with-grid-layout.js';
import withSwatch from './with-swatch.js';

export default function withSwatchLegend(group) {
  return withGridLayout(group).config((c) => ({
    labels: [],
    colors: [],
    configParser: (previousConfig, newConfig) => {
      var swatches = newConfig.labels.map((label, i) => {
        const swatch = previousConfig.children[i] || withSwatch(respVis.group());
        return swatch.config({
          rect: { attributes: { fill: newConfig.colors[i] } },
          label: { text: label },
        });
      });
      newConfig.children = swatches;
      c.configParser(previousConfig, newConfig);
    },
  }));
}
