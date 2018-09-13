import axios from "axios";
import Cookies from "universal-cookie";
import { API_URL } from "../config";

const cookies = new Cookies();

const api = axios.create({
  baseURL: `${API_URL}/modules`,
  headers: {
    Authorization: {
      toString() {
        return `Bearer ${cookies.get("token")}`;
      }
    }
  }
});

export const list = async () => await api.get().then(response => response.data);

export const update = obj =>
  api.put(obj._id, obj).then(response => response.data);
