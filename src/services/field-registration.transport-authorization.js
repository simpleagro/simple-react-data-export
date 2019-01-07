import { baseApi as api } from "../config/api";

const baseURL = "/field-registration/:field_registration_id/pre-harvest/:pre_harvest_id/transport-authorization";

export const list = field_registration_id => pre_harvest_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = field_registration_id => pre_harvest_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = field_registration_id => pre_harvest_id => obj =>
  api
    .post(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}`,
      obj
    )
    .then(response => response.data);

export const update = field_registration_id => pre_harvest_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = field_registration_id => pre_harvest_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}/${_id}`
    )
    .then(response => response.data);

export const get = field_registration_id => pre_harvest_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":field_registration_id", field_registration_id)
        .replace(":pre_harvest_id", pre_harvest_id)}/${_id}`
    )
    .then(response => response.data);
