import { baseApi as api } from "../config";

const baseURL = "/modules";

export const list = async () =>
  await api.get(baseURL).then(response => response.data);

export const update = obj =>
  api.put(`${baseURL}/${obj._id}`, obj).then(response => response.data);
