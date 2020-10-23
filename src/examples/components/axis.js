function leftAxis() {
  const ticks = respVis.leftTicks().config({
    attributes: { 'grid-area': '1 / 3 / 2 / 4' },
  });

  const title = respVis.text().config({
    attributes: {
      'place-self': 'center',
      ...respVis.titleAttributes,
      ...respVis.verticalTextAttributes,
      'grid-area': '1 / 1 / 2 / 2',
    },
  });

  const axis = respVis.group().config({
    attributes: { 'grid-template': 'auto / auto 5 auto' },
    children: [ticks, title],
  });

  axis.ticks = ticks;
  axis.title = title;

  return axis;
}

function rightAxis() {
  const ticks = respVis.rightTicks().config({
    attributes: { 'grid-area': '1 / 1 / 2 / 2' },
  });

  const title = respVis.text().config({
    attributes: {
      'place-self': 'center',
      ...respVis.titleAttributes,
      ...respVis.verticalTextAttributes,
      'grid-area': '1 / 3 / 2 / 4',
    },
  });

  const axis = respVis.group().config({
    attributes: { 'grid-template': 'auto / auto 5 auto' },
    children: [ticks, title],
  });

  axis.ticks = ticks;
  axis.title = title;

  return axis;
}

function bottomAxis() {
  const ticks = respVis.bottomTicks().config({
    attributes: { 'grid-area': '1 / 1 / 2 / 2' },
  });

  const title = respVis.text().config({
    attributes: {
      'place-self': 'center',
      ...respVis.titleAttributes,
      'grid-area': '3 / 1 / 4 / 2',
    },
  });

  const axis = respVis.group().config({
    attributes: { 'grid-template': 'auto 5 auto / auto' },
    children: [ticks, title],
  });

  axis.ticks = ticks;
  axis.title = title;

  return axis;
}

function topAxis() {
  const ticks = respVis.topTicks().config({
    attributes: { 'grid-area': '3 / 1 / 4 / 2' },
  });

  const title = respVis.text().config({
    attributes: {
      'place-self': 'center',
      ...respVis.titleAttributes,
      'grid-area': '1 / 1 / 2 / 2',
    },
  });

  const axis = respVis.group().config({
    attributes: { 'grid-template': 'auto 5 auto / auto' },
    children: [ticks, title],
  });

  axis.ticks = ticks;
  axis.title = title;

  return axis;
}
