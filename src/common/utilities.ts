import { exec } from "child_process";
import { promisify } from "util";

export function compare<T>(a: T, b: T): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export const execute = promisify(exec);
