const CATEGORY_COLOR_MAP = {
  Salary: 'info',
  Freelance: 'info',
  Rent: 'warning',
  Groceries: 'warning',
  Dining: 'danger',
  Utilities: 'neutral',
  Transport: 'neutral',
  Insurance: 'neutral',
  Shopping: 'danger',
  Healthcare: 'danger',
}

export const getCategoryTone = (category) => {
  return CATEGORY_COLOR_MAP[category] || 'neutral'
}

export const getSavingsTone = (savingsTrend) => {
  if (savingsTrend === 'up') return 'success'
  if (savingsTrend === 'down') return 'danger'
  return 'neutral'
}
