import type { ReactNode } from "react";

/** Ukuran asli notch.svg. */
const NOTCH_BASE_WIDTH = 622;
const NOTCH_BASE_HEIGHT = 74;
/**
 * SVG-nya `preserveAspectRatio`, jadi tingginya selalu ikut lebar — kalau
 * dipaksa lebih tinggi, yang muncul hanya ruang kosong di bawah gambar.
 */
const NOTCH_ASPECT = NOTCH_BASE_HEIGHT / NOTCH_BASE_WIDTH;
/** Kedalaman lekukan pada gambar aslinya (path notch turun sampai y=50). */
const NOTCH_DIP_RATIO = 50 / NOTCH_BASE_HEIGHT;

type NotchedCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Lebar notch; kecilkan kalau kartunya lebar agar sisi kiri/kanan lega. */
  notchWidth?: number;
  /** Kontrol di kiri notch, mis. filter periode. */
  headerLeft?: ReactNode;
  /** Kontrol di kanan notch, mis. legend. */
  headerRight?: ReactNode;
};

export function NotchedCard({
  title,
  children,
  className = "",
  notchWidth = NOTCH_BASE_WIDTH,
  headerLeft,
  headerRight,
}: NotchedCardProps) {
  const hasHeaderContent = Boolean(headerLeft || headerRight);
  const notchHeight = notchWidth * NOTCH_ASPECT;

  return (
    <section
      className={`relative flex h-full flex-col rounded-4xl border border-slate-200 bg-[#F1F5F9] pb-3 pt-2.5 px-3 shadow-sm ${className}`.trim()}
    >
      {/* The Notch SVG Background */}
      <img
        src="/icons/notch.svg"
        alt=""
        aria-hidden
        style={{ width: notchWidth, height: notchHeight }}
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-10 object-top"
      />

      {/* Judul dipusatkan di dalam lekukan notch, bukan di tepi atas kartu. */}
      <div
        style={{ width: notchWidth, height: notchHeight * NOTCH_DIP_RATIO }}
        className="absolute top-0 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center px-10 select-none"
      >
        <span className="truncate text-sm font-extrabold text-navy">
          {title}
        </span>
      </div>

      {/* Kontrol sejajar notch: kiri dan kanan, tengahnya dibiarkan kosong
          supaya tidak menimpa lekukan notch. */}
      {hasHeaderContent ? (
        <div className="relative z-20 flex min-h-8 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {headerLeft}
          </div>
          <div style={{ width: notchWidth + 16 }} className="shrink-0" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {headerRight}
          </div>
        </div>
      ) : (
        <div
          style={{ height: notchHeight * NOTCH_DIP_RATIO }}
          className="shrink-0"
          aria-hidden
        />
      )}

      {children}
    </section>
  );
}
