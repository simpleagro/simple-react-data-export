import { baseApi as api } from "../config";

api.defaults.baseURL = api.defaults.baseURL + "/entities";

export const list = async () => {
  return await api.get().then(response => response.data);
};

export const update = entidade => {
  return api.put(entidade._id, entidade).then(response => response.data);
};
