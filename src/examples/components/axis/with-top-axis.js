export default function withTopAxis(group) {
  let ticks, title;
  const axis = group.config((c) => ({
    attributes: { 'grid-template': 'auto 5 auto / auto' },
    children: [
      (ticks = respVis.topTicks().config({
        attributes: { 'grid-area': '3 / 1 / 4 / 2' },
      })),
      (title = respVis.text().config({
        attributes: {
          'place-self': 'center',
          ...respVis.titleAttributes,
          'grid-area': '1 / 1 / 2 / 2',
        },
      })),
    ],
    parseConfig: (previousConfig, newConfig) => {
      newConfig.children[0].config(newConfig.ticks);
      newConfig.children[1].config(newConfig.title);
      c.parseConfig(previousConfig, newConfig);
    },
  }));
  axis.ticks = ticks;
  axis.title = title;
  return axis;
}
