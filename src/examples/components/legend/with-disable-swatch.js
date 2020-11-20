export default function withDisableSwatch(legend) {
  legend.disableSwatch = function (swatchIndex, disable) {
    const c = legend.activeConfig().colors[swatchIndex];
    const swatch = legend.swatches[swatchIndex];
    swatch.rect.config({
      attributes: {
        fill: disable ? respVis.chroma.hex(c).desaturate(4).hex() : c,
        'stroke-width': disable ? 1 : 4,
      },
    });

    swatch.label.config({ attributes: { fill: disable ? '#ababab' : '#000000' } });
  };
  return legend;
}
