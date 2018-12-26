import { baseApi as api } from "../config/api";

const baseURL = "/ship-table/:shiptable_id/range-km";

export const list = shiptable_id => aqp =>
  api
    .get(`${baseURL.replace(":shiptable_id", shiptable_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = shiptable_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":shiptable_id", shiptable_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = shiptable_id => obj =>
  api
    .post(`${baseURL.replace(":shiptable_id", shiptable_id)}`, obj)
    .then(response => response.data);

export const update = shiptable_id => obj =>
  api
    .put(`${baseURL.replace(":shiptable_id", shiptable_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = shiptable_id => _id =>
  api
    .delete(`${baseURL.replace(":shiptable_id", shiptable_id)}/${_id}`)
    .then(response => response.data);

export const get = shiptable_id => _id =>
  api
    .get(`${baseURL.replace(":shiptable_id", shiptable_id)}/${_id}`)
    .then(response => response.data);

