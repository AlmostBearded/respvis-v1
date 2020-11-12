export default function withBottomAxis(group) {
  return group.config((c) => {
    return {
      attributes: { 'grid-template': 'auto 5 auto / auto' },
      children: [
        respVis.bottomTicks().config({
          attributes: { 'grid-area': '1 / 1 / 2 / 2' },
        }),
        respVis.text().config({
          attributes: {
            'place-self': 'center',
            ...respVis.titleAttributes,
            'grid-area': '3 / 1 / 4 / 2',
          },
        }),
      ],
      configParser: (previousConfig, newConfig) => {
        newConfig.children[0].config(newConfig.ticks);
        newConfig.children[1].config(newConfig.title);
        c.configParser(previousConfig, newConfig);
      },
    };
  });
}
