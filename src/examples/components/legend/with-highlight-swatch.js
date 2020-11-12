export default function withHighlightSwatch(legend) {
  legend.highlightSwatch = function highlightSwatch(swatchIndex, highlight) {
    const c = legend.activeConfig().colors[swatchIndex];
    legend.activeConfig().children[swatchIndex].config({
      rect: { attributes: { fill: highlight ? respVis.chroma.hex(c).brighten(0.5).hex() : c } },
      label: { attributes: { 'font-weight': highlight ? 'bold' : 'normal' } },
    });
  };

  return legend;
}
