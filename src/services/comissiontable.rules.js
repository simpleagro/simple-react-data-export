import { baseApi as api } from "../config/api";

const baseURL = "/comissions/:comissiontable_id/rules";

export const list = comissiontable_id => aqp =>
  api
    .get(`${baseURL.replace(":comissiontable_id", comissiontable_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = comissiontable_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":comissiontable_id", comissiontable_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = comissiontable_id => obj =>
  api
    .post(`${baseURL.replace(":comissiontable_id", comissiontable_id)}`, obj)
    .then(response => response.data);

export const update = comissiontable_id => obj =>
  api
    .put(`${baseURL.replace(":comissiontable_id", comissiontable_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = comissiontable_id => _id =>
  api
    .delete(`${baseURL.replace(":comissiontable_id", comissiontable_id)}/${_id}`)
    .then(response => response.data);

export const get = comissiontable_id => _id =>
  api
    .get(`${baseURL.replace(":comissiontable_id", comissiontable_id)}/${_id}`)
    .then(response => response.data);

