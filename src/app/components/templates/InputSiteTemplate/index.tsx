// React
import type { ReactNode } from "react";

interface InputSiteTemplateProps {
  toolbar: ReactNode;
  children: ReactNode;
}

/** Kerangka halaman rekonsiliasi: kartu putih berisi toolbar dan area tabel. */
const InputSiteTemplate = ({ toolbar, children }: InputSiteTemplateProps) => {
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6 overflow-x-hidden">
      {toolbar}
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  );
};

export default InputSiteTemplate;
