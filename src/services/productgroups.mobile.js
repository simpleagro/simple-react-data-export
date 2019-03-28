import { baseApi as api } from "../config/api";

const baseURL = "/productgroups.mobile";

export const list = aqp => {
  return api
    .get(baseURL, {
      params: aqp
    })
    .then(response => response.data)
};
