export default function withTopAxis(group) {
  return group.config((c) => ({
    attributes: { 'grid-template': 'auto 5 auto / auto' },
    children: [
      respVis.topTicks().config({
        attributes: { 'grid-area': '3 / 1 / 4 / 2' },
      }),
      respVis.text().config({
        attributes: {
          'place-self': 'center',
          ...respVis.titleAttributes,
          'grid-area': '1 / 1 / 2 / 2',
        },
      }),
    ],
    configParser: (previousConfig, newConfig) => {
      newConfig.children[0].config(newConfig.ticks);
      newConfig.children[1].config(newConfig.title);
      c.configParser(previousConfig, newConfig);
    },
  }));
}