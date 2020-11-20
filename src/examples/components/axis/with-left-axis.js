export default function withLeftAxis(group) {
  let ticks, title;
  const axis = group.config((c) => ({
    attributes: { 'grid-template': 'auto / auto 5 auto' },
    children: [
      (ticks = respVis.leftTicks().config({
        attributes: { 'grid-area': '1 / 3 / 2 / 4' },
      })),
      (title = respVis.text().config({
        attributes: {
          'place-self': 'center',
          ...respVis.titleAttributes,
          ...respVis.verticalTextAttributes,
          'grid-area': '1 / 1 / 2 / 2',
        },
      })),
    ],
  }));
  axis.ticks = ticks;
  axis.title = title;
  return axis;
}
