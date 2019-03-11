import { baseApi as api } from "../config/api";

const baseURL = "/zones/:zones_id/cities/:cities_id/locations";

export const list = zones_id => cities_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = zones_id => cities_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = zones_id => cities_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}`,
      obj
    )
    .then(response => response.data);

export const update = zones_id => cities_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = zones_id => cities_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}/${_id}`
    )
    .then(response => response.data);

export const get = zones_id => cities_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":zones_id", zones_id)
        .replace(":cities_id", cities_id)}/${_id}`
    )
    .then(response => response.data);
