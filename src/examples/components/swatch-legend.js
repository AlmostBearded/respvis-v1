function swatchLegend(labels, colors, rowCount, columnCount) {
  const swatches = labels.map((l, i) => {
    const rect = respVis.rect().config({
      attributes: {
        'grid-area': '1 / 2 / 2 / 3',
        'place-self': 'center end',
        fill: colors[i],
      },
      size: { width: 15, height: 15 },
    });

    const text = respVis.text().config({
      attributes: {
        'grid-area': '1 / 4 / 2 / 5',
        'place-self': 'center start',
      },
      text: l,
    });

    const row = Math.floor(i / columnCount) + 1;
    const column = (i % columnCount) + 1;

    const group = respVis.group().config({
      attributes: {
        'grid-area': `${row} / ${column} / ${row + 1} / ${column + 1}`,
        'grid-template': 'auto / 5 auto 5 auto 5',
      },
      children: [rect, text],
    });

    group.rect = rect;
    group.text = text;

    return group;
  });

  const rows = Array(rowCount).fill('auto').join(' ');
  const columns = Array(columnCount).fill('auto').join(' ');

  const legend = respVis.group().config({
    attributes: {
      'grid-template': `${rows} / ${columns}`,
    },
    children: swatches,
  });

  legend.swatches = swatches;

  return legend;
}
