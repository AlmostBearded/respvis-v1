import withGridLayout from '../with-grid-layout.js';
import withSwatch from './with-swatch.js';

export default function withSwatchLegend(group) {
  const legend = withGridLayout(group);
  legend.config((c) => ({
    labels: [],
    colors: [],
    parseConfig: (previousConfig, newConfig) => {
      legend.swatches = newConfig.labels.map((label, i) => {
        let swatch = legend.swatches?.[i];
        if (!swatch) {
          swatch = withSwatch(respVis.group());
          swatch.rect.config({ attributes: { fill: newConfig.colors[i] } });
          swatch.label.config({ text: label });
        } else {
          if (previousConfig.colors[i] !== newConfig.colors[i])
            swatch.rect.config({ attributes: { fill: newConfig.colors[i] } });
          if (previousConfig.labels[i] !== newConfig.labels[i])
            swatch.label.config({ text: label });
        }
        return swatch;
      });
      newConfig.children = legend.swatches;
      c.parseConfig(previousConfig, newConfig);
    },
  }));
  return legend;
}
