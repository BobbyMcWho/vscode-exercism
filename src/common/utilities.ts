export function compare(a: number | string | boolean, b: number | string | boolean): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
