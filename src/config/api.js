import axios from "axios";
import Cookies from "universal-cookie";
import parseErrors from "../lib/parseErrors";

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

const cookies = new Cookies();

const baseApi = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    Authorization: {
      toString() {
        return `${cookies.get("token")}`;
      }
    }
  }
});

baseApi.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error

    if (error && error.response && error.response.data) parseErrors(error);
    return {
      data: {}
    };
  }
);

export { baseApi, API_URL };
