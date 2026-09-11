interface SparklineProps {
  /** Deret nilai, urut dari paling lama ke paling baru. */
  values: number[];
  width?: number;
  height?: number;
  /** Warna dipaksa; default hijau kalau titik akhir naik, merah kalau turun. */
  color?: string;
  className?: string;
}

/**
 * Grafik garis mini tanpa sumbu, untuk kolom "Trend" di dalam tabel. Sengaja
 * SVG polos, bukan echarts, supaya ratusan baris tetap ringan.
 */
const Sparkline = ({
  values,
  width = 64,
  height = 22,
  color,
  className = "",
}: SparklineProps) => {
  const points = values.filter((value) => Number.isFinite(value));

  if (points.length < 2) {
    return <span className="text-slate-300">-</span>;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);

  const path = points
    .map((value, index) => {
      const x = index * step;
      // SVG menggambar dari atas, jadi nilainya dibalik.
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke =
    color ??
    (points[points.length - 1] >= points[0] ? "#10B981" : "#EF4444");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`.trim()}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
