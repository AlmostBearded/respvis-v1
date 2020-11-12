export default function withHighlightTick(axis) {
  axis.config({
    ticks: {
      attributes: {
        '.tick': { 'font-weight': 'normal' },
        '.tick[highlighted=true]': { 'font-weight': 'bold' },
      },
    },
  });

  axis.highlightTick = function highlightTick(tickIndex, highlight) {
    axis
      .selection()
      .select(`.tick:nth-of-type(${tickIndex + 1})`)
      .attr('highlighted', highlight);
    axis.config({});
    return axis;
  };

  axis.clearHighlights = function clearHighlights() {
    axis.selection().selectAll('[highlighted]').attr('highlighted', null);
    axis.config({});
    return axis;
  };

  return axis;
}