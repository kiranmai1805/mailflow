import axios from "axios";

const API_URL = "http://localhost:8000";

const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const signup = async (
  name,
  email,
  password
) => {
  const response = await authApi.post(
    "/auth/signup",
    {
      name,
      email,
      password,
    }
  );

  return response.data;
};


export const login = async (
  email,
  password
) => {
  const response = await authApi.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};


export const getCurrentUser = async () => {
  const response = await authApi.get(
    "/auth/me"
  );

  return response.data;
};


export const updateProfile = async (name) => {
  const response = await authApi.put(
    "/auth/profile",
    {
      name,
    }
  );

  return response.data;
};


export const logout = async () => {
  const response = await authApi.post(
    "/auth/logout"
  );

  return response.data;
};

export const changePassword = async (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  const response = await authApi.put(
    "/auth/password",
    {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }
  );

  return response.data;
};