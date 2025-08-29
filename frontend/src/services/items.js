import axios from "axios";

const API_URL = "http://localhost:5000/api/items";

export const getItems = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};

export const createItem = async (itemData) => {
  const res = await axios.post(API_URL, itemData, { withCredentials: true });
  return res.data;
};

export const updateItem = async (id, itemData) => {
  const res = await axios.put(`${API_URL}/${id}`, itemData, { withCredentials: true });
  return res.data;
};

export const deleteItem = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};
