import { useCallback, useMemo, useState } from 'react'
import { sortTransactions } from '../utils/finance'
import { useDebouncedValue } from './useDebouncedValue'

export const FILTER_DEFAULTS = {
  searchTerm: '',
  selectedType: 'all',
  selectedCategory: 'all',
  sortBy: 'date-desc',
}

export const useFilters = ({ transactions }) => {
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const debouncedSearchTerm = useDebouncedValue(filters.searchTerm, 250)

  const filteredTransactions = useMemo(() => {
    const searchValue = debouncedSearchTerm.trim().toLowerCase()

    const filtered = transactions.filter((transaction) => {
      const matchesType =
        filters.selectedType === 'all' || transaction.type === filters.selectedType
      const matchesCategory =
        filters.selectedCategory === 'all' ||
        transaction.category === filters.selectedCategory
      const matchesSearch =
        searchValue.length === 0 ||
        transaction.category.toLowerCase().includes(searchValue) ||
        String(transaction.description || '').toLowerCase().includes(searchValue) ||
        String(transaction.amount).includes(searchValue)

      return matchesType && matchesCategory && matchesSearch
    })

    return sortTransactions(filtered, filters.sortBy)
  }, [debouncedSearchTerm, filters.selectedCategory, filters.selectedType, filters.sortBy, transactions])

  const updateFilter = useCallback((key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS)
  }, [])

  return {
    filters,
    debouncedSearchTerm,
    filteredTransactions,
    updateFilter,
    clearFilters,
    setFilters,
  }
}
