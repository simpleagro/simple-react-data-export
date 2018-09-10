import axios from "axios";
import { API_URL } from "../config";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const api = axios.create({
  baseURL: API_URL + '/entities',
  headers: {
    'Authorization': 'Bearer ' + cookies.get("token")
  }
})

export const list = async () => {
  return await api.get()
    .then(response => response.data);
};

export const update = (entidade) => {
  return api.put(entidade._id, entidade)
    .then(response => response.data);
};