import { baseApi as api } from "../../config/api";

const baseURL = "/ms/price-table-variations";

export const get = params =>
  api.get(`${baseURL}`, { params }).then(response => response.data);
