import type { ResponseValue } from "./types";

export const NOT_APPLICABLE_LABEL = "Not applicable";
export const SKIPPED_LABEL = "Skipped";

export function isResponseValue(value: unknown): value is ResponseValue {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}
