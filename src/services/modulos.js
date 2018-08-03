import axios from 'axios';
import Cookies from "universal-cookie";
import { API_URL } from "../config";

const cookies = new Cookies();
const token = cookies.get('token');

const api = axios.create({
  baseURL: `${API_URL}/modules`,
  headers: {
    common: {
      "Authorization": `Bearer ${token}`,
    },
  },
});

export const list = async () => await api.get()
  .then(response => response.data);

export const update = (obj) => api.put(obj._id, obj)
  .then(response => response.data);
