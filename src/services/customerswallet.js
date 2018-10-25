import { baseApi as api } from "../config/api";

const baseURL = "/customers-wallets";

export const list = aqp => {
  return api
    .get(baseURL, {
      params: aqp
    })
    .then(response => response.data);
};

export const get = _id =>
  api.get(`${baseURL}/${_id}`).then(response => response.data);

export const create = obj =>
  api.post(baseURL, obj).then(response => response.data);

export const update = obj =>
  api.put(`${baseURL}/${obj._id}`, obj).then(response => response.data);

export const remove = _id =>
  api.delete(`${baseURL}/${_id}`).then(response => response.data);

export const changeStatus = (_id, status) => {
  api.put(`${baseURL}/${_id}`, { status }).then(response => response.data);
};

export const moreInfo = (walletID, status) => {
  return api
    .get(`${baseURL}/more-info/${walletID}`)
    .then(response => response.data);
};
