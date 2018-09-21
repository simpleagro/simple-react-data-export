import axios from "axios";

const ESTADOS_ENDPOINT =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const CIDADES_ENDPOINT =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados/:estado_id/municipios";

export const listaEstados = async () => {
  return await axios
    .get(ESTADOS_ENDPOINT)
    .then(response => response.data)
    .then(estados => estados.map(c => ({ codigo: c.id, nome: c.nome })));
};

export const listaCidadesPorEstado = async estado_id => {
  return await axios
    .get(CIDADES_ENDPOINT.replace(":estado_id", estado_id))
    .then(response => response.data)
    .then(cidades => cidades.map(c => ({ codigo: c.id, nome: c.nome })));
};
