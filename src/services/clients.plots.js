import { baseApi as api } from "../config/api";

const baseURL = "/clients/:client_id/properties/:property_id/plots";

export const list = client_id => property_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = client_id => property_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = client_id => property_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}`,
      obj
    )
    .then(response => response.data);

export const update = client_id => property_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = client_id => property_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}/${_id}`
    )
    .then(response => response.data);

export const get = client_id => property_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":client_id", client_id)
        .replace(":property_id", property_id)}/${_id}`
    )
    .then(response => response.data);
