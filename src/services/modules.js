import { baseApi as api } from "../config";

api.defaults.baseURL = api.defaults.baseURL + "/modules";

export const list = async () => await api.get().then(response => response.data);

export const update = obj =>
  api.put(obj._id, obj).then(response => response.data);
