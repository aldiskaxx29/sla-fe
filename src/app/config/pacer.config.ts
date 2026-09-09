/**
 * Timing standar (ms) untuk seluruh penggunaan TanStack Pacer di aplikasi.
 *
 * Atur nilai debounce/throttle HANYA di sini supaya konsisten & mudah di-tune
 * dari satu tempat. Konsumsi lewat hooks di `~/hooks/custom/pacer`.
 */
export const PACER_WAIT = {
  /** Input teks pencarian / filter (ketikan pengguna). */
  search: 300,
  /** Filter lain yang memicu kalkulasi/fetch berat. */
  filter: 300,
  /** Event beruntun: window/element resize. */
  resize: 100,
  /** Event beruntun: scroll. */
  scroll: 100,
} as const;

export type PacerWaitKey = keyof typeof PACER_WAIT;
