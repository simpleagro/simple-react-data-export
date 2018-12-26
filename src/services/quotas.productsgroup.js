import { baseApi as api } from "../config/api";

const baseURL = "/quotas/:quota_id/saleman/:saleman_id/productgroup";

export const list = quota_id => saleman_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = quota_id => saleman_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = quota_id => saleman_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}`,
      obj
    )
    .then(response => response.data);

export const update = quota_id => saleman_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}/${obj.id}`,
      obj
    )
    .then(response => response.data);

export const remove = quota_id => saleman_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}/${_id}`
    )
    .then(response => response.data);

export const get = quota_id => saleman_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)}/${_id}`
    )
    .then(response => response.data);
