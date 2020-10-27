function leftAxis() {
  let ticks, title;
  return respVis.group().config(function (c) {
    return {
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
      customConfigParser: function parseAxisConfig(previousConfig, newConfig) {
        ticks.config(newConfig.ticks);
        title.config(newConfig.title);
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}

function rightAxis() {
  let ticks, title;
  return respVis.group().config(function (c) {
    return {
      attributes: { 'grid-template': 'auto / auto 5 auto' },
      children: [
        (ticks = respVis.rightTicks().config({
          attributes: { 'grid-area': '1 / 1 / 2 / 2' },
        })),
        (title = respVis.text().config({
          attributes: {
            'place-self': 'center',
            ...respVis.titleAttributes,
            ...respVis.verticalTextAttributes,
            'grid-area': '1 / 3 / 2 / 4',
          },
        })),
      ],
      customConfigParser: function parseAxisConfig(previousConfig, newConfig) {
        ticks.config(newConfig.ticks);
        title.config(newConfig.title);
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}

function bottomAxis() {
  let ticks, title;
  return respVis.group().config(function (c) {
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
      customConfigParser: function parseAxisConfig(previousConfig, newConfig) {
        ticks.config(newConfig.ticks);
        title.config(newConfig.title);
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}

function topAxis() {
  let ticks, title;
  return respVis.group().config(function (c) {
    return {
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
      customConfigParser: function parseAxisConfig(previousConfig, newConfig) {
        ticks.config(newConfig.ticks);
        title.config(newConfig.title);
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}
