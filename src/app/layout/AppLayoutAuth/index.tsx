import { AppRouteWrapper } from "@/app/components";
import loginBg from "@/assets/login-bg.jpg";

const AppLayoutAuth = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 relative z-10">
        <AppRouteWrapper />
      </div>
    </div>
  );
};

AppLayoutAuth.displayName = "AppLayoutAuth";

export { AppLayoutAuth };
