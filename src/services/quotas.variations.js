import { baseApi as api } from "../config/api";

const baseURL = "/quotas/:quota_id/saleman/:saleman_id/productgroup/:productgroup_id/products/:product_id/variations";

export const list = quota_id => saleman_id => productgroup_id => product_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = quota_id => saleman_id => productgroup_id => product_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = quota_id => saleman_id => productgroup_id => product_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}`,
      obj
    )
    .then(response => response.data);

export const update = quota_id => saleman_id => productgroup_id => product_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = quota_id => saleman_id => productgroup_id => product_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`
    )
    .then(response => response.data);

export const get = quota_id => saleman_id => productgroup_id => product_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":quota_id", quota_id)
        .replace(":saleman_id", saleman_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`
    )
    .then(response => response.data);
