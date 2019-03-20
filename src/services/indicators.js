import { baseApi as api } from "../config/api";

const baseURL = "/indicators";

export const vendas = aqp => {
  return api
    .get(`${baseURL}/vendas`, {
      params: aqp
    })
    .then(response => response.data);
};
