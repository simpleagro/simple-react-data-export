import { baseApi as api } from "../config/api";

const baseURL = "/field_registration/:pre_harvest_id/pre_harvest";

export const list = pre_harvest_id => aqp =>
  api
    .get(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = pre_harvest_id => (_id, status) => {
  api
    .put(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}/${_id}`, { status })
    .then(response => response.data);
};

export const create = pre_harvest_id => obj =>
  api
    .post(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}`, obj)
    .then(response => response.data);

export const update = pre_harvest_id => obj =>
  api
    .put(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = pre_harvest_id => _id =>
  api
    .delete(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}/${_id}`)
    .then(response => response.data);

export const get = pre_harvest_id => _id =>
  api
    .get(`${baseURL.replace(":pre_harvest_id", pre_harvest_id)}/${_id}`)
    .then(response => response.data);
