function swatch() {
  return respVis.group().config(function (c) {
    return {
      attributes: {
        'grid-template': 'auto / 5 auto 5 auto 5',
      },
      children: [
        respVis.rect().config({
          attributes: {
            'grid-area': '1 / 2 / 2 / 3',
            'place-self': 'center end',
          },
          size: { width: 15, height: 15 },
        }),
        respVis.text().config({
          attributes: {
            'grid-area': '1 / 4 / 2 / 5',
            'place-self': 'center start',
          },
        }),
      ],
      customConfigParser: function parseSwatchConfig(previousConfig, newConfig) {
        newConfig.children[0].config(newConfig.rect);
        newConfig.children[1].config(newConfig.label);
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}

function swatchLegend() {
  return matrix().config(function (c) {
    return {
      labels: [],
      colors: [],
      customConfigParser: function parseSwatchLegendConfig(previousConfig, newConfig) {
        var swatches = newConfig.labels.map((label, i) => {
          return (previousConfig.children[i] || swatch()).config({
            rect: { attributes: { fill: newConfig.colors[i] } },
            label: { text: label },
          });
        });
        newConfig.children = swatches;
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}
