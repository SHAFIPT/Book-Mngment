import type { LoginPayload, RegisterPayload } from "../types/auth";
import axiosInstance from "./api";

export const loginUser = async (payload: LoginPayload) => {
  const res = await axiosInstance.post("/api/auth/login", payload);
  console.log("This is the axios response :", res);
  return res.data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post("/api/auth/register", payload);
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosInstance.post('/api/auth/logout');
  return res.data;
};
