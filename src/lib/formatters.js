export const moneyFormat = (currency, locale = "BR") => {
  if (locale === "BR")
    return `R$ ${parseFloat(currency)
      .toFixed(2)
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+\,)/g, "$1.")}`;

  return "should be implemented new locale, default BR";
};
