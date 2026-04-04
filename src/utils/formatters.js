import { CURRENCY_LOCALES, convertCurrency, normalizeCurrency } from './currency'

export const formatCurrency = (value, currency = 'USD') => {
  const normalizedCurrency = normalizeCurrency(currency)
  const convertedValue = convertCurrency(value, 'USD', normalizedCurrency)

  return new Intl.NumberFormat(CURRENCY_LOCALES[normalizedCurrency], {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: 0,
  }).format(convertedValue)
}

export const formatCompactCurrency = (value, currency = 'USD') => {
  const normalizedCurrency = normalizeCurrency(currency)
  const convertedValue = convertCurrency(value, 'USD', normalizedCurrency)

  return new Intl.NumberFormat(CURRENCY_LOCALES[normalizedCurrency], {
    style: 'currency',
    currency: normalizedCurrency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(convertedValue)
}

export const formatDate = (value) => {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatMonthLabel = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}
