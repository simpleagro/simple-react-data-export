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
