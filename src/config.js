import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export const API_URL = "http://192.168.1.6:3333/api";

export const baseApi = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    Authorization: {
      toString() {
        return `Bearer ${cookies.get("token")}`;
      }
    }
  }
});
