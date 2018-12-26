import { baseApi as api } from "../config/api";

const baseURL = "/productgroups/:group_id/features";

export const list = group_id => aqp =>
  api
    .get(`${baseURL.replace(":group_id", group_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = group_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":group_id", group_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = group_id => obj =>
  api
    .post(`${baseURL.replace(":group_id", group_id)}`, obj)
    .then(response => response.data);

export const update = group_id => obj =>
  api
    .put(`${baseURL.replace(":group_id", group_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = group_id => _id =>
  api
    .delete(`${baseURL.replace(":group_id", group_id)}/${_id}`)
    .then(response => response.data);

export const get = group_id => _id =>
  api
    .get(`${baseURL.replace(":group_id", group_id)}/${_id}`)
    .then(response => response.data);
