import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
  return res.data;
};

export const register = async (name, email, password) => {
  const res = await axios.post(`${API_URL}/register`, { name, email, password });
  return res.data;
};

export const googleLogin = async (token) => {
  const res = await axios.post(`${API_URL}/google`, { token }, { withCredentials: true });
  return res.data;
};
