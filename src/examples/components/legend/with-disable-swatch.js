export default function withDisableSwatch(legend) {
  legend.disableSwatch = function (swatchIndex, disable) {
    const c = legend.activeConfig().colors[swatchIndex];
    legend.activeConfig().children[swatchIndex].config({
      rect: {
        attributes: {
          fill: disable ? respVis.chroma.hex(c).desaturate(4).hex() : c,
          'stroke-width': disable ? 1 : 4,
        },
      },
      label: { attributes: { fill: disable ? '#ababab' : '#000000' } },
    });
  };
  return legend;
}
