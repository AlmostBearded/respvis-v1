export default function withHighlightSwatch(legend) {
  legend.highlightSwatch = function highlightSwatch(swatchIndex, highlight) {
    const c = legend.activeConfig().colors[swatchIndex];
    const swatch = legend.swatches[swatchIndex];
    swatch.rect.config({
      attributes: { fill: highlight ? respVis.chroma.hex(c).brighten(0.5).hex() : c },
    });
    swatch.label.config({ attributes: { 'text-decoration': highlight ? 'underline' : 'none' } });
  };

  return legend;
}
