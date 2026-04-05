# Zorvyn Finance Dashboard

A frontend-only finance SaaS dashboard built with React, Tailwind CSS, Framer Motion, and Recharts.

The app includes:
- Landing + authentication flow
- Protected dashboard + profile experience
- Interactive finance analytics
- Role-based UI simulation (Viewer/Admin)
- Mock API integration (no backend required)

## 1. Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install and run

```bash
npm install
npm run dev
```

### Lint and production build

```bash
npm run lint
npm run build
```

## 2. Environment Variables (Optional)

Create `.env` in project root if you want to tune mock API behavior:

```bash
# Mock API latency window (milliseconds)
VITE_MOCK_API_MIN_DELAY_MS=220
VITE_MOCK_API_MAX_DELAY_MS=520

# 0 to 1 (e.g. 0.1 = 10% simulated failures)
VITE_MOCK_API_ERROR_RATE=0

# Optional Google auth button support (frontend-only simulation)
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

## 3. Project Approach

### Frontend architecture
- **UI**: Reusable component-driven architecture with React functional components + hooks.
- **State management**: Context-based (`FinanceContext`, `AuthContext`) for app-wide state.
- **Data flow**:
  1. Pages consume context (`useFinance`, `useAuth`)
  2. Finance context composes hooks (`useTransactions`, `useFilters`, `useInsights`)
  3. `useTransactions` talks to the mock API service layer

### Mock API integration (no backend)
A dedicated mock API layer is implemented in:
- `src/api/mockApiClient.js`
- `src/api/transactionsApi.js`

The API layer provides:
- Async request simulation (latency)
- Optional failure simulation (`VITE_MOCK_API_ERROR_RATE`)
- Standardized API errors
- CRUD-style transaction operations
- localStorage-backed persistence as mock database

## 4. Mock API Contracts

Implemented contracts (simulated in frontend):
- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/import`
- `POST /api/transactions/reset`

## 5. Feature Overview

### Core dashboard features
- Summary cards (Balance, Income, Savings)
- Time-based visualization (balance trend)
- Categorical visualization (spending by category)
- Budget progress and spending health insights

### Transactions section
- Timeline-style transaction feed with:
  - Date
  - Amount
  - Category
  - Type (income/expense)
- Search, filtering, sorting
- Empty states and no-result states
- Export (`CSV`, `JSON`)

### Role-based UI simulation
- Role switcher in dashboard (`Viewer` / `Admin`)
- Viewer:
  - Read-only behavior
  - Disabled edit/add controls with tooltip hints
- Admin:
  - Add/edit/delete transaction actions

### Insights
- Highest spending category
- Monthly comparison and trend
- Savings trend and health score logic
- Conversational insight lines generated from current data

### Profile page
- Account info and joined date
- Editable name and saved preferences
- Currency/theme preferences
- Historical stats and recent activity summary

### Interactions and UX polish
- Responsive desktop/tablet/mobile behavior
- Expandable charts/cards in modal view
- Notification center with filtering and read state
- Smooth transitions and hover/press interactions
- Focus mode for reduced visual noise

## 6. State Management and Persistence

### Finance state (`FinanceContext`)
- Transactions
- Filters/search/sort
- Role
- Time range
- Theme/focus mode
- Section preferences
- API error/retry signals

### Auth state (`AuthContext`)
- User records
- Session state
- Login/signup/logout
- Demo login + optional Google-login simulation

### Persistence
Stored in `localStorage`:
- Transactions
- Session/user profile
- Theme and dashboard preferences
- Goals and notification read/dismissed states

## 7. Routes

- `/` Landing page
- `/login` Login page
- `/signup` Signup page
- `/dashboard` Protected dashboard
- `/profile` Protected profile page

Route protection:
- Unauthenticated users cannot access protected routes
- Authenticated users are redirected away from auth pages

## 8. Folder Highlights

- `src/pages` → Route-level pages
- `src/components` → Reusable UI and feature components
- `src/context` → App-level state providers
- `src/hooks` → Encapsulated logic (`useTransactions`, `useFilters`, `useInsights`)
- `src/api` → Mock API contracts + client simulation
- `src/utils` → Shared formatters/calculations

## 9. Notes

- This app intentionally has **no backend service**.
- Mock API integration is frontend-only and ideal for demos/interviews.
- For production backend migration, replace `src/api/*` implementations while preserving existing UI/state architecture.
