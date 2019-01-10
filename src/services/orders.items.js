import { baseApi as api } from "../config/api";

const baseURL = "/orders/:order_id/items";

export const list = order_id => aqp =>
  api
    .get(`${baseURL.replace(":order_id", order_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = order_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":order_id", order_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = order_id => obj =>
  api
    .post(`${baseURL.replace(":order_id", order_id)}`, obj)
    .then(response => response.data);

export const update = order_id => obj =>
  api
    .put(`${baseURL.replace(":order_id", order_id)}/${obj.id}`, obj)
    .then(response => response.data);

export const remove = order_id => _id =>
  api
    .delete(`${baseURL.replace(":order_id", order_id)}/${_id}`)
    .then(response => response.data);

export const get = order_id => _id =>
  api
    .get(`${baseURL.replace(":order_id", order_id)}/${_id}`)
    .then(response => response.data);

