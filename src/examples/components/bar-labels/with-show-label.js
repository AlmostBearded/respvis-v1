export default function withShowLabel(barLabels) {
  barLabels.config({
    attributes: { '.label': { opacity: 0 }, '.label[visible=true]': { opacity: 1 } },
  });

  barLabels.showLabel = function showLabel(labelIndex, visible) {
    barLabels
      .selection()
      .select(`.label:nth-of-type(${labelIndex + 1})`)
      .attr('visible', visible);
    barLabels.config({});
    return barLabels;
  };

  return barLabels;
}
