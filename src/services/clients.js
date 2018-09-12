import { baseApi as api } from "../config";

api.defaults.baseURL = api.defaults.baseURL + "/clients";

export const list = async () => await api.get().then(response => response.data);

export const update = obj =>
  api.put(obj._id, obj).then(response => response.data);

export const create = obj =>
  api.post("", obj).then(response => response.data);

export const changeStatus = (_id, status) => {
  api.put(_id, { status }).then(response => response.data);
};
