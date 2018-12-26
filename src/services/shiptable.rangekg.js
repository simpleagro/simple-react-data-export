import { baseApi as api } from "../config/api";

const baseURL = "/ship-table/:shiptable_id/range-km/:rangekm_id/range-volume";

export const list = shiptable_id => rangekm_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = shiptable_id => rangekm_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = shiptable_id => rangekm_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}`,
      obj
    )
    .then(response => response.data);

export const update = shiptable_id => rangekm_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = shiptable_id => rangekm_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}/${_id}`
    )
    .then(response => response.data);

export const get = shiptable_id => rangekm_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":shiptable_id", shiptable_id)
        .replace(":rangekm_id", rangekm_id)}/${_id}`
    )
    .then(response => response.data);
