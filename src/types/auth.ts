export interface LoginType {
  email: string;
  password: string;
}

export interface AuthType {
  access_token?: string;
  refresh_token?: string;
}

export interface UserType {
  full_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  googleId?: string;
  role?: number;
}
