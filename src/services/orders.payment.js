import { baseApi as api } from "../config/api";

const baseURL = "/orders/:order_id/payment";

export const update = order_id => obj =>
  api
    .put(`${baseURL.replace(":order_id", order_id)}`, obj)
    .then(response => response.data);

export const get = order_id => _id =>
  api
    .get(`${baseURL.replace(":order_id", order_id)}`)
    .then(response => response.data);
