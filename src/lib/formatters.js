export const moneyFormat = (currency, locale = "BR") => {
  if (locale === "BR")
    return `R$ ${parseFloat(
      currency
        .toString()
        .replace(/[a-zA-Z|$|\s]+/, "")
        .replace(".", "")
        .replace(",", ".")
        .replace(/(\d)(?=(\d{3})+,)/g, "$1.")
    ).toFixed(2)}`;

  return "should be implemented new locale, default BR";
};

export const numberFormat = (number) => {
  return number.replace(/[0-9]*(\.[0-9]{3})*,([0-9]{2})?/g)
};
