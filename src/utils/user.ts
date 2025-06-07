import { UserType } from "../types/auth";

interface UserResponseData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const convertToUserType = (userData: UserResponseData): UserType => {
  return {
    email: userData.email,
    full_name: userData.username, // Fallback to username if full_name not available
    role: parseInt(userData.role), // Convert role string to number
    password: "", // Password should not be stored in state
  };
};
