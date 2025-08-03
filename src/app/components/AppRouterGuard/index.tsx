// React
import { useMemo } from "react";

// React Router DOM
import { useLocation, Navigate } from "react-router-dom";

// Interfaces
import { IAppRouteGuardProps } from "./interfaces";

// Interfaces
// import {
//   IPermissionList,
//   IPermission,
// } from "@/modules/role/interfaces/role.interface";

// Custom Hooks
// import { useAuth } from "@/modules/auth/hooks/auth.hook";

const AppRouteGuard = ({ children, permissible }: IAppRouteGuardProps) => {
  // Hook
  //   const { auth_authenticatedUser } = useAuth();
  const auth_authenticatedUser = { id: "1" };
  const location = useLocation();
  const isAuthRoute = useMemo(() => {
    return location.pathname.includes("auth");
  }, [location.pathname]);

  const readPermissions = ["sla"];
  // auth_authenticatedUser?.roles?.permissionGroupResponses
  //   ?.filter(({ permissions }: IPermissionList) =>
  //     permissions.some(({ granted }) => granted)
  //   )
  //   .map(({ name }: IPermission) => {
  //     let routeName = "";

  //     switch (name) {
  //       case "Dashboard":
  //         routeName = "dashboard";
  //         break;
  //       case "Transaksi":
  //         routeName = "transaction";
  //         break;
  //       case "Manajemen User":
  //         routeName = "users";
  //         break;
  //       case "Manajemen Role":
  //         routeName = "role";
  //         break;
  //       case "Manajemen Pelanggan":
  //         routeName = "customer";
  //         break;
  //       case "Manajemen Outlet":
  //         routeName = "outlet";
  //         break;
  //       case "Manajemen Kategori Outlet":
  //         routeName = "outlet-category";
  //         break;
  //       case "Manajemen Produk":
  //         routeName = "product";
  //         break;
  //       case "Manajemen Laporan":
  //         routeName = "report";
  //         break;
  //       default:
  //         routeName = "404";
  //         break;
  //     }
  //     return routeName;
  //   });

  if (
    auth_authenticatedUser?.id &&
    (isAuthRoute || location.pathname === "/")
  ) {
    return <Navigate to={`/back-office/${readPermissions[0]}/msa`} replace />;
  }

  if (!permissible && permissible !== undefined) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!isAuthRoute && !auth_authenticatedUser?.id) {
    // return <Navigate to="/auth/login?isLoggedOut=true" replace />;
    return <Navigate to="/auth/login" replace />;
  }

  if (isAuthRoute && !auth_authenticatedUser?.id) {
    return children;
  }

  if (!isAuthRoute && auth_authenticatedUser?.id) {
    return children;
  }

  return children;
};

AppRouteGuard.displayName = "AppRouteGuard";

export { AppRouteGuard };
