import { baseApi as api } from "../config/api";

const baseURL = "/zones/:zones_id/cities";

export const list = zone_id => aqp =>
  api
    .get(`${baseURL.replace(":zones_id", zone_id)}`, {
      params: aqp
    })
    .then(response => response.data);

export const changeStatus = zone_id => (_id, status) =>
  api
    .put(`${baseURL.replace(":zones_id", zone_id)}/${_id}`, { status })
    .then(response => response.data);

export const create = zone_id => obj =>
  api
    .post(`${baseURL.replace(":zones_id", zone_id)}`, obj)
    .then(response => response.data);

export const update = zone_id => obj =>
  api
    .put(`${baseURL.replace(":zones_id", zone_id)}/${obj._id}`, obj)
    .then(response => response.data);

export const remove = zone_id => _id =>
  api
    .delete(`${baseURL.replace(":zones_id", zone_id)}/${_id}`)
    .then(response => response.data);

export const get = zone_id => _id =>
  api
    .get(`${baseURL.replace(":zones_id", zone_id)}/${_id}`)
    .then(response => response.data);
