import { Button } from '../ui/Button'

export const TransactionFilters = ({
  filters,
  categories,
  onChange,
  onClear,
  onExportCsv,
  onExportJson,
  isSearching,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="text"
          placeholder="Search category, description or amount"
          value={filters.searchTerm}
          onChange={(event) => onChange('searchTerm', event.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-sky-400/60"
        />

        <select
          value={filters.selectedType}
          onChange={(event) => onChange('selectedType', event.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.selectedCategory}
          onChange={(event) => onChange('selectedCategory', event.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(event) => onChange('sortBy', event.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{isSearching ? 'Searching…' : 'Filters update instantly.'}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" variant="secondary" onClick={onExportCsv}>
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={onExportJson}>
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  )
}
