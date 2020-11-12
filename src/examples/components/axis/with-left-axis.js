export default function withLeftAxis(group) {
  return group.config((c) => ({
    attributes: { 'grid-template': 'auto / auto 5 auto' },
    children: [
      respVis.leftTicks().config({
        attributes: { 'grid-area': '1 / 3 / 2 / 4' },
      }),
      respVis.text().config({
        attributes: {
          'place-self': 'center',
          ...respVis.titleAttributes,
          ...respVis.verticalTextAttributes,
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
