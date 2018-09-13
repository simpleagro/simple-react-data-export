import { baseApi as api } from "../config";

const baseURL = "/clients";

export const list = () => api.get(baseURL).then(response => response.data);

export const create = obj =>
  api.post(baseURL, obj).then(response => response.data);

export const update = obj =>
  api.put(`${baseURL}/${obj._id}`, obj).then(response => response.data);

export const remove = _id =>
  api.delete(`${baseURL}/${_id}`).then(response => response.data);

export const changeStatus = (_id, status) => {
  api.put(`${baseURL}/${_id}`, { status }).then(response => response.data);
};
