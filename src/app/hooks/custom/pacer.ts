import {
  useDebouncedValue,
  useThrottledCallback,
} from "@tanstack/react-pacer";
import type { AnyFunction } from "@tanstack/pacer/types";

import { PACER_WAIT } from "@/app/config/pacer.config";

export function useDebouncedSearch<TValue>(
  value: TValue,
  wait: number = PACER_WAIT.search,
): TValue {
  const [debounced] = useDebouncedValue(value, { wait });
  return debounced;
}

export function useThrottledEvent<TFn extends AnyFunction>(
  fn: TFn,
  wait: number = PACER_WAIT.resize,
): (...args: Parameters<TFn>) => void {
  return useThrottledCallback(fn, { wait });
}

export {
  useDebouncedValue,
  useDebouncedCallback,
  useThrottledCallback,
  useThrottledValue,
  useRateLimitedCallback,
  useQueuer,
} from "@tanstack/react-pacer";
