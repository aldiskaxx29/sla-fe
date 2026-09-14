interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  lowerIsBetter?: boolean;
  className?: string;
}

const Sparkline = ({
  values,
  width = 64,
  height = 22,
  color,
  lowerIsBetter = false,
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
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const improving = lowerIsBetter ? last <= first : last >= first;
  const stroke = color ?? (improving ? "#10B981" : "#EF4444");

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
