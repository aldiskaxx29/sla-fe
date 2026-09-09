/**
 * Pola global TanStack Pacer.
 *
 * Semua kebutuhan debounce/throttle di aplikasi masuk lewat file ini supaya
 * pola-nya seragam dan jelas. Jangan import langsung dari `@tanstack/react-pacer`
 * di komponen — pakai hooks di bawah, atau (untuk kasus lanjutan) re-export raw
 * di bagian bawah file.
 *
 * Pilih hook sesuai bentuk data:
 * - `useDebouncedSearch`  → nilai teks pencarian/filter (menunda VALUE).
 * - `useThrottledEvent`   → handler event beruntun resize/scroll (membatasi CALL).
 */
import {
  useDebouncedValue,
  useThrottledCallback,
} from "@tanstack/react-pacer";
import type { AnyFunction } from "@tanstack/pacer/types";

import { PACER_WAIT } from "@/app/config/pacer.config";

/**
 * Debounce sebuah nilai (biasanya string pencarian). Nilai balikan hanya
 * berubah setelah `wait` ms tidak ada perubahan — cocok untuk memicu
 * filter/`useMemo`/fetch tanpa jalan tiap keystroke.
 *
 * @example
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebouncedSearch(search);
 * const rows = useMemo(() => filter(debouncedSearch), [debouncedSearch]);
 */
export function useDebouncedSearch<TValue>(
  value: TValue,
  wait: number = PACER_WAIT.search,
): TValue {
  const [debounced] = useDebouncedValue(value, { wait });
  return debounced;
}

/**
 * Throttle sebuah handler event beruntun (resize, scroll, mousemove). Handler
 * dieksekusi paling banyak sekali per `wait` ms. Referensi fungsi stabil,
 * jadi aman dipasang di `addEventListener`.
 *
 * @example
 * const onResize = useThrottledEvent(() => map.resize());
 * useEffect(() => {
 *   window.addEventListener("resize", onResize);
 *   return () => window.removeEventListener("resize", onResize);
 * }, [onResize]);
 */
export function useThrottledEvent<TFn extends AnyFunction>(
  fn: TFn,
  wait: number = PACER_WAIT.resize,
): (...args: Parameters<TFn>) => void {
  return useThrottledCallback(fn, { wait });
}

/**
 * Escape hatch untuk kebutuhan lanjutan (rate limit, queue, async debounce,
 * akses instance debouncer, dsb). Tetap import lewat file ini agar seluruh
 * penggunaan Pacer terlacak dari satu tempat.
 */
export {
  useDebouncedValue,
  useDebouncedCallback,
  useThrottledCallback,
  useThrottledValue,
  useRateLimitedCallback,
  useQueuer,
} from "@tanstack/react-pacer";
