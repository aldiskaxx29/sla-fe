type StatusTone = "win" | "lose" | "neutral";

interface StatusPillProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  win: "bg-emerald-50 text-emerald-600",
  lose: "bg-red-50 text-red-500",
  neutral: "bg-slate-100 text-slate-500",
};

const StatusPill = ({ label, tone = "neutral", className = "" }: StatusPillProps) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TONE_CLASS[tone]} ${className}`.trim()}
  >
    {label}
  </span>
);

export default StatusPill;
