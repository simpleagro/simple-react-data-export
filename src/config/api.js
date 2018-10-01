import axios from "axios";
import Cookies from "universal-cookie";

let API_URL;

if (process.env.REACT_APP_API_SECURE === "true") {
  API_URL = `https://${process.env.REACT_APP_API_IP}:${
    process.env.REACT_APP_API_PORT
  }/api`;
} else {
  API_URL = `http://${process.env.REACT_APP_API_IP}:${
    process.env.REACT_APP_API_PORT
  }/api`;
}

export { API_URL };

const cookies = new Cookies();

export const baseApi = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    Authorization: {
      toString() {
        return `${cookies.get("token")}`;
      }
    }
  }
});
