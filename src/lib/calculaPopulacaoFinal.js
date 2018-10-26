export const calculaPopulacaoFinal = (espacamento, plantasPorCm) => {
  const k45 = 22222.222;
  const k50 = 20000;

  return espacamento == 45 ? plantasPorCm * k45 : plantasPorCm * k50;
};
