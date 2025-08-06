export const currencies = [
  { value: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "GBP", label: "British Pound", symbol: "£" }
];

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = currencies.find(c => c.value === currencyCode);
  return currency?.symbol || "₦";
};

export const formatCurrency = (amount: number, currencyCode: string = "NGN"): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
};

export const getCurrencyLabel = (currencyCode: string): string => {
  const currency = currencies.find(c => c.value === currencyCode);
  return currency?.label || "Nigerian Naira";
};