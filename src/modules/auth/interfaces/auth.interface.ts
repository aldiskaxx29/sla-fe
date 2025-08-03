import { IPermissionList } from "@/modules/role/interfaces/role.interface";

export interface IAuthToken {
  error?: object;
  data?: object;
}

export interface IAuthLogout {
  results?: string | null;
}

export interface IAuthForgotPassword {
  results?: string | null;
}

export interface IAuthAlertModal {
  isOpen: boolean;
  id?: number;
}

export interface IPermissionResults {
  permissionGroupResponses: IPermissionList[];
}

export interface IPermissionResponse {
  permissionGroupResponses: any;
  id: string;
  name: string;
  description: string;
  createdDate: string;
  results: IPermissionResults;
}

export interface IOutletResponse {
  id: string;
  name: string;
  location: string;
  email: string;
  phoneNumber: string;
  categoryName?: any;
  status: boolean;
}

export interface IAuthAuthenticatedUser {
  [x: string]: any;
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  telephone: number | null;
  status: string | null;
  role: string;
}

export interface IAuthLoginForm {
  email: string;
  password: string;
}

export interface IAuthAttrsResetPassword {
  password: string;
  confirmPassword: string;
}

export interface IAuthAttrsForgotPassword {
  email: string;
}

export interface IAuthAttrsResetPassword {
  newPassword: string;
}
