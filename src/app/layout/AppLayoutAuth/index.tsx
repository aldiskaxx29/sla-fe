import { AppRouteWrapper } from "@/app/components";

import AuthTemplate from "@/app/components/templates/AuthTemplate";

const AppLayoutAuth = () => (
  <AuthTemplate>
    <AppRouteWrapper />
  </AuthTemplate>
);

AppLayoutAuth.displayName = "AppLayoutAuth";

export { AppLayoutAuth };
