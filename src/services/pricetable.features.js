import { baseApi as api } from "../config/api";

const baseURL = "/price-table/:pricetable_id/productgroup/:productgroup_id/products/:product_id/features";

export const list = pricetable_id => productgroup_id => product_id => aqp =>
  api
    .get(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}`,
      {
        params: aqp
      }
    )
    .then(response => response.data);

export const changeStatus = pricetable_id => productgroup_id => product_id => (_id, status) => {
  api
    .put(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`,
      { status }
    )
    .then(response => response.data);
};

export const create = pricetable_id => productgroup_id => product_id=> obj =>
  api
    .post(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}`,
      obj
    )
    .then(response => response.data);

export const update = pricetable_id => productgroup_id => product_id => obj =>
  api
    .put(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${obj._id}`,
      obj
    )
    .then(response => response.data);

export const remove = pricetable_id => productgroup_id => product_id => _id =>
  api
    .delete(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`
    )
    .then(response => response.data);

export const get = pricetable_id => productgroup_id => product_id => _id =>
  api
    .get(
      `${baseURL
        .replace(":pricetable_id", pricetable_id)
        .replace(":productgroup_id", productgroup_id)
        .replace(":product_id", product_id)}/${_id}`
    )
    .then(response => response.data);
