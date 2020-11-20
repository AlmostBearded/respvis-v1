export default function withSwatch(group) {
  let rect, label;
  const swatch = group.config((c) => ({
    attributes: { 'grid-template': 'auto / 5 auto 5 auto 5' },
    children: [
      (rect = respVis.rect().config({
        attributes: { 'grid-area': '1 / 2 / 2 / 3', 'place-self': 'center end' },
        size: { width: 15, height: 15 },
      })),
      (label = respVis.text().config({
        attributes: { 'grid-area': '1 / 4 / 2 / 5', 'place-self': 'center start' },
      })),
    ],
  }));
  swatch.rect = rect;
  swatch.label = label;
  return swatch;
}
