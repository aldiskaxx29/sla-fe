interface SkeletonProps {
  width?: number | string;
  height?: number;
  className?: string;
}

const Skeleton = ({ width = "100%", height = 16, className = "" }: SkeletonProps) => (
  <span
    className={`block animate-pulse rounded bg-gray-200 ${className}`}
    style={{ width, height }}
  />
);

export default Skeleton;
