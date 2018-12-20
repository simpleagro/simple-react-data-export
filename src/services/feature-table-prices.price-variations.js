import { baseApi as api } from "../config/api";

const baseURL = "/feature-table-prices/:tabela_id/price-variations";

export const list = tabela_id => aqp =>
  api
    .get(`${baseURL.replace(":tabela_id", tabela_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = tabela_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":tabela_id", tabela_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = tabela_id => obj =>
  api
    .post(`${baseURL.replace(":tabela_id", tabela_id)}`, obj)
    .then(response => response.data);

export const update = tabela_id => obj =>
  api
    .put(`${baseURL.replace(":tabela_id", tabela_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = tabela_id => _id =>
  api
    .delete(`${baseURL.replace(":tabela_id", tabela_id)}/${_id}`)
    .then(response => response.data);

export const get = tabela_id => _id =>
  api
    .get(`${baseURL.replace(":tabela_id", tabela_id)}/${_id}`)
    .then(response => response.data);
