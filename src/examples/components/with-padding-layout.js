// adds padding config properties to group components
export default function withPaddingLayout(group) {
  return group.config((c) => ({
    all: 0,
    horizontal: undefined,
    vertical: undefined,
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
    parseConfig: (previousConfig, newConfig) => {
      const top = newConfig.top || newConfig.vertical || newConfig.all;
      const bottom = newConfig.bottom || newConfig.vertical || newConfig.all;
      const left = newConfig.left || newConfig.horizontal || newConfig.all;
      const right = newConfig.right || newConfig.horizontal || newConfig.all;

      newConfig.attributes['grid-template'] = `${top} 1fr ${bottom} / ${left} 1fr ${right}`;

      newConfig.children.forEach((child) => {
        child.config({ attributes: { 'grid-area': `2 / 2 / 3 / 3` } });
      });

      c.parseConfig(previousConfig, newConfig);
    },
  }));
}
