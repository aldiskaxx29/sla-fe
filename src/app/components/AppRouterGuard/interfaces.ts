import { JSX } from "react";

export interface IAppRouteGuardProps {
  children: JSX.Element;
  permissible?: boolean;
}
