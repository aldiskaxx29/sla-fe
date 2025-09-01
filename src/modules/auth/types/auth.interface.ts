export interface IAuthLoginRequest {
  email: string;
  password: string;
}

export interface IAuthLoginResponse {
  status: boolean;
  data: {
    id: number;
    name: string;
    nik: string;
    email: string;
    region: string | null;
    witel: string | null;
    role: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export interface IAuthAuthenticatedUser {
  id: number;
  name: string;
  nik: string;
  email: string;
  region: string | null;
  witel: string | null;
  role: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  access_token: string;
}
