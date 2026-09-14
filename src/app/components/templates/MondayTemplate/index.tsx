import type { ReactNode } from "react";

interface MondayTemplateProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

const MondayTemplate = ({
  leftContent,
  rightContent,
  children,
  className = "",
}: MondayTemplateProps) => {
  return (
    <div className="m-6 rounded-xl border border-[#DBDBDB] bg-white p-4 overflow-x-hidden">
      {leftContent || rightContent ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">{leftContent}</div>
          <div className="ml-auto flex items-center gap-2">{rightContent}</div>
        </div>
      ) : null}

      <div className={`w-full ${className}`}>{children}</div>
    </div>
  );
};

export default MondayTemplate;
