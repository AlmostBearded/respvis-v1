// source: https://stackoverflow.com/a/16436975
export function arraysEqual(a: any[] | null, b: any[] | null): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] instanceof Array && !arraysEqual(a[i], b[i])) return false;
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function arrayIs(array: any): array is any[] {
  return Array.isArray(array);
}

export function arrayIs2D(array: any): array is any[][] {
  return arrayIs(array) && array.every((e) => Array.isArray(e));
}
