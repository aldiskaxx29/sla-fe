// React
import { Suspense } from "react";

// Router
import { useRouter } from "@/plugins";

// Antd
import { ConfigProvider as AntdConfigProvider } from "antd";

// Custom Hooks
// import { useApp } from '@/features/app/hooks/app.hook'

// Constant
// import { APP_LANGUAGE_LIST } from '@/features/app/constant/app.constant'
// import { validateMessages } from '@/features/app/constant/validation'

// Loading
// import LoadingAnimation from "@/assets/animation/Loading.gif";

const AppEntryPoint = () => {
  // Hook
  const routes = useRouter();
  //   const { app_locale } = useApp()

  return (
    <AntdConfigProvider
      //   locale={APP_LANGUAGE_LIST[app_locale]}
      //   form={{ validateMessages: validateMessages[app_locale] }}
      theme={{
        token: { fontFamily: "Poppins" },
        components: {
          Layout: { headerHeight: 80 },
          Table: { borderColor: "#DBDBDB" },
        },
      }}
    >
      <Suspense
        fallback={
          <div className="grid justify-items-center items-center h-screen bg-white">
            {/* <img src={LoadingAnimation} width={"100px"} height={"100px"} /> */}
            Loading
          </div>
        }
      >
        {routes}
      </Suspense>
    </AntdConfigProvider>
  );
};

export default AppEntryPoint;
