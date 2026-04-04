export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP']

export const CURRENCY_RATES = {
  USD: 1,
  INR: 83.12,
  EUR: 0.92,
  GBP: 0.79,
}

export const CURRENCY_LOCALES = {
  USD: 'en-US',
  INR: 'en-IN',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

export const normalizeCurrency = (currency) => {
  return SUPPORTED_CURRENCIES.includes(currency) ? currency : 'USD'
}

export const convertCurrency = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  const source = normalizeCurrency(fromCurrency)
  const target = normalizeCurrency(toCurrency)

  if (source === target) return Number(amount) || 0

  const amountNumber = Number(amount) || 0
  const amountInUsd = amountNumber / CURRENCY_RATES[source]
  return amountInUsd * CURRENCY_RATES[target]
}
