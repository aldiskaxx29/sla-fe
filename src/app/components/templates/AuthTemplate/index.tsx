import type { ReactNode } from "react";

import loginBg from "@/assets/login-bg.jpg";

interface AuthTemplateProps {
  children: ReactNode;
}

const AuthTemplate = ({ children }: AuthTemplateProps) => (
  <div
    className="relative flex min-h-screen items-center justify-center p-4"
    style={{
      backgroundImage: `url(${loginBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
      {children}
    </div>
  </div>
);

export default AuthTemplate;
