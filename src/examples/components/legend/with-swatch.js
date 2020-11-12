export default function withSwatch(group) {
  return group.config((c) => ({
    attributes: { 'grid-template': 'auto / 5 auto 5 auto 5' },
    children: [
      respVis.rect().config({
        attributes: { 'grid-area': '1 / 2 / 2 / 3', 'place-self': 'center end' },
        size: { width: 15, height: 15 },
      }),
      respVis.text().config({
        attributes: { 'grid-area': '1 / 4 / 2 / 5', 'place-self': 'center start' },
      }),
    ],
    configParser: (previousConfig, newConfig) => {
      newConfig.children[0].config(newConfig.rect);
      newConfig.children[1].config(newConfig.label);
      c.configParser(previousConfig, newConfig);
    },
  }));
}
