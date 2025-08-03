// React

// Components
import {
  //   AppBaseLayout,
  //   AppBaseLayoutContent,
  AppRouteWrapper,
} from "@/app/components";

const AppLayoutEmpty = () => {
  // Hook
  return (
    // <AppBaseLayout className='layout'>
    //   {/* Content */}
    //   <AppBaseLayoutContent style={{ padding: '0 50px', minHeight: '85vh' }}>
    //     {/* Content Here */}
    //     <div className='site-layout-content'>
    <AppRouteWrapper />
    //     </div>
    //   </AppBaseLayoutContent>
    // </AppBaseLayout>
  );
};

AppLayoutEmpty.displayName = "AppLayoutEmpty";

export { AppLayoutEmpty };
