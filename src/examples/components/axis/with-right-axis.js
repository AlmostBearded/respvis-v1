export default function withRightAxis(group) {
  return group.config((c) => ({
    attributes: { 'grid-template': 'auto / auto 5 auto' },
    children: [
      respVis.rightTicks().config({
        attributes: { 'grid-area': '1 / 1 / 2 / 2' },
      }),
      respVis.text().config({
        attributes: {
          'place-self': 'center',
          ...respVis.titleAttributes,
          ...respVis.verticalTextAttributes,
          'grid-area': '1 / 3 / 2 / 4',
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
