import { baseApi as api } from "../config/api";

const baseURL = "/companies/:company_id/branchs";

export const list = client_id => aqp =>
  api
    .get(`${baseURL.replace(":company_id", client_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = client_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":company_id", client_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = client_id => obj =>
  api
    .post(`${baseURL.replace(":company_id", client_id)}`, obj)
    .then(response => response.data);

export const update = client_id => obj =>
  api
    .put(`${baseURL.replace(":company_id", client_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = client_id => _id =>
  api
    .delete(`${baseURL.replace(":company_id", client_id)}/${_id}`)
    .then(response => response.data);

export const get = client_id => _id =>
  api
    .get(`${baseURL.replace(":company_id", client_id)}/${_id}`)
    .then(response => response.data);
