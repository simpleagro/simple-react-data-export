import { baseApi as api } from "../config";

const baseURL = "/entities";

export const list = async () => {
  return await api.get(baseURL).then(response => response.data);
};

export const update = entidade => {
  return api
    .put(`${baseURL}/${entidade._id}`, entidade)
    .then(response => response.data);
};
