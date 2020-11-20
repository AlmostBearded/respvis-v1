export default function withHighlightTick(axis) {
  axis.ticks.config({
    attributes: {
      '.tick': { 'text-decoration': 'none' },
      '.tick[highlighted=true]': { 'text-decoration': 'underline' },
    },
  });

  axis.highlightTick = function highlightTick(tickIndex, highlight) {
    axis.ticks
      .selection()
      .select(`.tick:nth-of-type(${tickIndex + 1})`)
      .attr('highlighted', highlight);
    axis.ticks.config({});
    return axis;
  };

  axis.clearHighlights = function clearHighlights() {
    axis.ticks.selection().selectAll('[highlighted]').attr('highlighted', null);
    axis.ticks.config({});
    return axis;
  };

  return axis;
}
