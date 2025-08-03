// React

// Components
import {
  //   AppBaseLayout,
  //   AppBaseLayoutContent,
  AppRouteWrapper,
} from "@/app/components";

const AppLayoutAuth = () => {
  // Hook
  return (
    <div className="flex h-[100vh]">
      <div className="bg-red-500 w-full h-full">&nbsp;</div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-2/3">
          <p className="text-3xl text-center my-4 font-semibold">Login Page</p>
          <AppRouteWrapper />
        </div>
      </div>
    </div>
  );
};

AppLayoutAuth.displayName = "AppLayoutAuth";

export { AppLayoutAuth };
