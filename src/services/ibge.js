import { baseApi as api } from "../config/api";

const baseURL = "/regions";

export const listaEstados = async () => {
  return await api
    .get(baseURL)
    .then(response => response.data)
    .then(estados => estados.map(c => c.uf));
};

export const listaCidadesPorEstado = async uf => {
  return await api
    .get(`${baseURL}/${uf}`)
    .then(response => response.data)
    .then(municipios => municipios[0].municipios);
};
