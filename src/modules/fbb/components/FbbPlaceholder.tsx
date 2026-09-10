interface FbbPlaceholderProps {
  title: string;
  description: string;
}

const FbbPlaceholder = ({ title, description }: FbbPlaceholderProps) => (
  <div className="mx-6 mt-6 rounded-xl border border-[#DBDBDB] bg-white p-6 min-h-[calc(100vh-120px)] flex items-center justify-center">
    <div className="max-w-xl text-center">
      <p className="text-2xl font-semibold text-[#0E2133]">{title}</p>
      <p className="mt-3 text-sm text-[#4B465C]">{description}</p>
    </div>
  </div>
);

export default FbbPlaceholder;
