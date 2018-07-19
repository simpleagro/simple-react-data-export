import axios from "axios";
import { API_URL } from "../config";

const base_url = API_URL + "/entidades";

export const list = () => {
  return axios.get(base_url)
    .then(response => response.data);
};

export const update = (entidade) => {
  return axios.put(`${base_url}/${entidade._id}`, entidade)
    .then(response => response.data);
};