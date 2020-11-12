// applies a grid layout to group components
export default function withGridLayout(group) {
  return group.config((c) => ({
    rowCount: 1,
    columnCount: 1,
    configParser: (previousConfig, newConfig) => {
      const rows = Array(newConfig.rowCount).fill('auto').join(' ');
      const columns = Array(newConfig.columnCount).fill('auto').join(' ');

      newConfig.attributes['grid-template'] = `${rows} / ${columns}`;

      newConfig.children.forEach((child, i) => {
        const row = Math.floor(i / newConfig.columnCount) + 1;
        const column = (i % newConfig.columnCount) + 1;
        child.config({
          attributes: { 'grid-area': `${row} / ${column} / ${row + 1} / ${column + 1}` },
        });
      });
      c.configParser(previousConfig, newConfig);
    },
  }));
}
