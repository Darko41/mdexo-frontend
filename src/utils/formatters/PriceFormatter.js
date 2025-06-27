export function formatPriceExtended(price, options = {}) {
  const defaults = {
    locale: 'de-DE',
    currency: 'EUR',
    showCurrency: true,
    decimalPlaces: 2
  };
  
  const config = { ...defaults, ...options };
  
  return new Intl.NumberFormat(config.locale, {
    style: config.showCurrency ? 'currency' : 'decimal',
    currency: config.currency,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces
  }).format(price);
}