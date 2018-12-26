import { baseApi as api } from "../config/api";

const baseURL = "/price-table/:price_table_id/productgroup";

export const list = price_table_id => aqp =>
  api
    .get(`${baseURL.replace(":price_table_id", price_table_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = price_table_id => (_id, status) => 
  api
    .put(`${baseURL.replace(":price_table_id", price_table_id)}/${_id}`, { status })
    .then(response => response.data);

export const create = price_table_id => obj =>
  api
    .post(`${baseURL.replace(":price_table_id", price_table_id)}`, obj)
    .then(response => response.data);

export const update = price_table_id => obj =>
  api
    .put(`${baseURL.replace(":price_table_id", price_table_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = price_table_id => _id =>
  api
    .delete(`${baseURL.replace(":price_table_id", price_table_id)}/${_id}`)
    .then(response => response.data);

export const get = price_table_id => _id =>
  api
    .get(`${baseURL.replace(":price_table_id", price_table_id)}/${_id}`)
    .then(response => response.data);
