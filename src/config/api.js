import axios from "axios";
import Cookies from "universal-cookie";
import parseErrors from "../lib/parseErrors";

let API_URL;

API_URL = `${process.env.REACT_APP_API_IP.replace(
  /\s/g,
  ""
)}:${process.env.REACT_APP_API_PORT.replace(/\s/g, "")}/api`;

API_URL = `https://homologacao.simpleagro.com.br/api`

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

// baseApi.interceptors.response.use(
//   function(response) {
//     // Do something with response data
//     return response;
//   },
//   function(error) {
//     if (error && error.response && error.response.data) parseErrors(error);
//     return error;
//   }
// );

export { baseApi, API_URL };
