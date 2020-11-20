export default function withBottomAxis(group) {
  let ticks, title;
  const axis = group.config((c) => {
    return {
      attributes: { 'grid-template': 'auto 5 auto / auto' },
      children: [
        (ticks = respVis.bottomTicks().config({
          attributes: { 'grid-area': '1 / 1 / 2 / 2' },
        })),
        (title = respVis.text().config({
          attributes: {
            'place-self': 'center',
            ...respVis.titleAttributes,
            'grid-area': '3 / 1 / 4 / 2',
          },
        })),
      ],
    };
  });
  axis.ticks = ticks;
  axis.title = title;
  return axis;
}
