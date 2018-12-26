import { baseApi as api } from "../config/api";

const baseURL = "/targets/:target_id/saleman/:saleman_id/productgroup/:productgroup_id/products";

export const list = target_id => saleman_id => productgroup_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = target_id => saleman_id => productgroup_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = target_id => saleman_id => productgroup_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}`,
      obj
    )
    .then(response => response.data);

export const update = target_id => saleman_id => productgroup_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}/${obj.id}`,
      obj
    )
    .then(response => response.data);

export const remove = target_id => saleman_id => productgroup_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}/${_id}`
    )
    .then(response => response.data);

export const get = target_id => saleman_id => productgroup_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":target_id", target_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)}/${_id}`
    )
    .then(response => response.data);
