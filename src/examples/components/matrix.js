function matrix() {
  return respVis.group().config(function (c) {
    return {
      rowCount: 1,
      columnCount: 1,
      configParser: function parseMatrixConfig(previousConfig, newConfig) {
        const rows = Array(newConfig.rowCount).fill('auto').join(' ');
        const columns = Array(newConfig.columnCount).fill('auto').join(' ');
        respVis.utils.deepExtend(newConfig, {
          attributes: { 'grid-template': `${rows} / ${columns}` },
        });

        newConfig.children.forEach((child, i) => {
          const row = Math.floor(i / newConfig.columnCount) + 1;
          const column = (i % newConfig.columnCount) + 1;
          child.config({
            attributes: { 'grid-area': `${row} / ${column} / ${row + 1} / ${column + 1}` },
          });
        });
        c.configParser(previousConfig, newConfig);
      },
    };
  });
}
