export function compare<T>(a: T, b: T): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
