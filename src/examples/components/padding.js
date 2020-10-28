function padding() {
  return respVis.group().config(function (c) {
    return {
      all: 0,
      horizontal: undefined,
      vertical: undefined,
      top: undefined,
      right: undefined,
      bottom: undefined,
      left: undefined,
      customConfigParser: function parseMatrixConfig(previousConfig, newConfig) {
        const top = newConfig.top || newConfig.vertical || newConfig.all;
        const bottom = newConfig.bottom || newConfig.vertical || newConfig.all;
        const left = newConfig.left || newConfig.horizontal || newConfig.all;
        const right = newConfig.right || newConfig.horizontal || newConfig.all;
        respVis.utils.deepExtend(newConfig, {
          attributes: { 'grid-template': `${top} 1fr ${bottom} / ${left} 1fr ${right}` },
        });

        newConfig.children.forEach((child) => {
          child.config({ attributes: { 'grid-area': `2 / 2 / 3 / 3` } });
        });
        c.customConfigParser(previousConfig, newConfig);
      },
    };
  });
}
