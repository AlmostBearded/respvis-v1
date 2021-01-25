export function verticalTextAttributes<T extends { attr(name: string, value: string): T }>(
  arg: T
): T {
  return arg
    .attr('transform', 'rotate(-90)')
    .attr('dominant-baseline', 'hanging')
    .attr('text-anchor', 'end');
}
