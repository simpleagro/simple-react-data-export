export const addMaskNumber = number => {
  try {
    number = number.replace(/[^\d]+/g, "");
  } catch (e) {
    return number;
  }
  return number;
};

export const addMaskReais = number => {
  try {
    number = number.replace(/[^\d]+/g, "");
    let tmp = number + "";

    if (tmp.length > 2) {
      tmp = tmp.replace(/^0+/, "");
    }

    if (tmp.length == 2) {
      tmp = "0" + tmp;
    }

    if (tmp.length == 1) {
      tmp = "00" + tmp;
    }

    tmp = tmp.replace(/([0-9]{2})$/g, ",$1");

    if (tmp.length > 6) tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

    if (tmp.length > 10)
      tmp = tmp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, ".$1.$2,$3");

    number = tmp;
  } catch (e) {
    return number;
  }
  return number;
};

export const formatDate = data => {
  const novaData = new Date(data);
  return `${zeroEsquerda(novaData.getDate())}/${zeroEsquerda(
    novaData.getMonth() + 1
  )}/${novaData.getFullYear()}`;
};

const zeroEsquerda = data => {
  return (data < 10 ? "0" : "") + data;
};

// Calcular fator de conversão de unidade de medidas recursivamente ********************************
// by: Jéssika *************************************************************************************
export const fatorConversaoUM = (um_array, um_pai, um_primaria) => {
  let flag = true;
  let um_verificar_obj = um_array.find(item => item.sigla.toLowerCase() == um_pai.toLowerCase());
  let um_verificar = um_verificar_obj ? um_verificar_obj._id : "";
  let um_primaria_obj = um_array.find(item => item.sigla.toLowerCase() == um_primaria.toLowerCase());
  let resultado = {};
  let aux_fc = 1;

  if (um_primaria_obj) {
    while (flag) {
      resultado = auxFatorConversaoUM(
        um_array,
        um_primaria_obj._id,
        um_verificar
      );
      if (!resultado) {
        flag = false;
        return "erro";
      } else if (resultado.um_base) {
        um_verificar = resultado.um_base;
        aux_fc = resultado.fc * aux_fc;
      } else if (resultado.fc) {
        flag = false;
        return resultado.fc * aux_fc;
      }
    }
  } else {
    return "erro";
  }
};

const auxFatorConversaoUM = (um_array, um_primaria_id, um_verificar) => {
  let resultado = undefined;
  um_array.forEach(um_item => {
    if (um_item._id == um_verificar) {
      if (um_item.unidade_basica_id == um_primaria_id) {
        resultado = { fc: um_item.fator_conversao };
        return;
      } else {
        resultado = {
          um_base: um_item.unidade_basica_id,
          fc: um_item.fator_conversao
        };
        return;
      }
    }
  });
  return resultado;
};
// ************************************************************************************************

export const valorFinalJurosCompostos = (
  capital,
  taxa = 0.0,
  periodo,
  precision = 1
) => {
  capital = getNumber(capital);
  return currency()(Number(capital * Math.pow(1 + parseFloat(taxa) / 100, periodo)));
};

// usando https://hacks.mozilla.org/2014/12/introducing-the-javascript-internationalization-api/
export const currency = (locale = "pt-BR") => (
  value,
  options = {
    style: "decimal",
    currency: "BRL",
    minimumFractionDigits: 2
  }
) => {
  const formatter = new Intl.NumberFormat(locale, options);

  return formatter.format(getNumber(value));
};

export const getNumber = n => {
  if (!n) return n;
  return isNaN(n)
    ? Number(
        n
          .toString()
          .replace(/\./g, "")
          .replace(",", ".")
      ).toFixed(2)*1
    : parseFloat(n).toFixed(2)*1;
};

export const normalizeString = str => {
  if (!str) return;
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export const addMaskNumeroPonto = number => {
  try {
    number = number.replace(/[^\d]+/g, "");
    let tmp = number + "";

    if (tmp.length > 3) {
      tmp = tmp.replace(/([0-9]{3})$/g, ".$1");
    }
    if (tmp.length > 7) tmp = tmp.replace(/([0-9]{3}).([0-9]{3}$)/g, ".$1.$2");
    if (tmp.length > 11)
      tmp = tmp.replace(/([0-9]{3}).([0-9]{3}).([0-9]{3}$)/g, ".$1.$2.$3");

    number = tmp;
  } catch (e) {
    return number;
  }
  return number;
};
