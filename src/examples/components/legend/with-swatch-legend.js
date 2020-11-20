import withGridLayout from '../with-grid-layout.js';
import withSwatch from './with-swatch.js';

export default function withSwatchLegend(group) {
  const legend = withGridLayout(group);
  legend.config((c) => ({
    labels: [],
    colors: [],
    parseConfig: (previousConfig, newConfig) => {
      legend.swatches = newConfig.labels.map((label, i) => {
        const swatch = legend.swatches?.[i] || withSwatch(respVis.group());
        swatch.rect.config({ attributes: { fill: newConfig.colors[i] } });
        swatch.label.config({ text: label });
        return swatch;
      });
      newConfig.children = legend.swatches;
      c.parseConfig(previousConfig, newConfig);
    },
  }));
  return legend;
}
