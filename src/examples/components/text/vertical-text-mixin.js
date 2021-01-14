export default function VerticalTextMixin(ComponentConstructor) {
  return class VerticalTextMixin extends ComponentConstructor {
    init() {
      return super
        .init()
        .attr('transform', 'rotate(-90)')
        .attr('dominant-baseline', 'hanging')
        .attr('text-anchor', 'end');
    }
  };
}
