export interface LoginType {
  email: string;
  password: string;
}

export interface AuthType {
  access_token?: string;
  refresh_token?: string;
}

export interface UserType {
  id?: number;
  full_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  googleId?: string;
  role?: number;
  staffs?: { position: string; photo?: string }[];
}
