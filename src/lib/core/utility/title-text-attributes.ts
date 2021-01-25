export function titleTextAttributes<T extends { attr(name: string, value: string): T }>(arg: T): T {
  return arg.attr('letter-spacing', '0.5em').attr('font-weight', 'bold');
}
