# Zorvyn Finance Dashboard (Complete SaaS Frontend)

A full frontend-only SaaS experience built with React + Tailwind:

- Landing page
- Authentication (login/signup) with localStorage
- Protected app routes
- Personalized dashboard and profile
- Interactive financial tools (What-if simulator, goal tracker, alerts)

## Setup

```bash
npm install
npm run dev
```

Validate and build:

```bash
npm run lint
npm run build
```

Google OAuth setup (optional but recommended):

```bash
# .env
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
```

Without this env var, the Google auth button is shown disabled with guidance text.

## Navigation Flow

- `/` Landing page
- `/login` Login page
- `/signup` Signup page
- `/dashboard` Protected dashboard
- `/profile` Protected profile page

## Auth and Route Protection

### Frontend auth (localStorage)
- Stores users and session in localStorage
- Signup creates user profile and logs in immediately
- Login validates credentials against local users
- Google login/signup supported (frontend-only; upserts by email in localStorage)
- Demo login available
- Logout clears active session

### Route behavior
- `/dashboard` and `/profile` require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected away from `/login` and `/signup`

## Auth-Aware UI

### Navbar
- Logged out:
  - `Login`
  - `Get Started`
- Logged in:
  - Avatar menu with animated dropdown
  - Menu items: `Profile`, `Dashboard`, `Logout`

## Profile Page (`/profile`)

### Sections
1. User info
- Name, email, joined date
- Avatar placeholder using initials

2. Edit profile
- Update display name
- Persists to localStorage

3. Account stats
- Total transactions
- Total income
- Total expenses
- Savings

4. Preferences
- Theme toggle
- Default currency selection
- Persists to localStorage

5. Logout control

## Dashboard Personalization and Product Features

### Personalized experience
- Dashboard greeting: `Welcome back, {name} 👋`
- Insights can be personalized with the logged-in user name

### Advanced product features implemented
1. Goal Tracker
- Set monthly savings goal
- Progress bar with current savings vs target
- Goal persisted per user in localStorage

2. Spending Alerts
- Alert banner when spending exceeds threshold
- Example: spent 80%+ of budget for selected range

3. Date Range Filter
- `This Week / Month / Year`
- Updates scoped metrics and charts

4. Export + Import Data
- Export CSV/JSON
- Import JSON to restore transaction data (validated)

5. Dashboard Customization
- Toggle charts visibility
- Toggle insights visibility
- Preferences persisted in localStorage

6. Story Mode + Behavioral Insights
- Weekly narrative recap of savings/spending behavior
- Actionable nudges based on spending pressure and category concentration
- Lightweight achievements (streaks, budget discipline, consistency)

7. Scenario Comparison Timeline
- Save up to 3 what-if scenarios
- Compare baseline vs scenario savings for recent months
- Helps evaluate which category cut has stronger long-term effect

8. Smart Transaction Auto-Tagging
- Add optional transaction description
- Category suggestions are generated from keywords
- One-click apply suggestion during transaction entry

## Existing Interactive Analytics

- Summary cards
- Balance trend chart
- Spending category chart
- What-if Analysis simulator
- Transactions filtering/search/sort
- Role-based transaction actions

## Motion and UI Polish

- Smooth page transitions (Framer Motion)
- Dropdown animation (fade + slide)
- Card hover lift
- Button press scale
- Input focus glow
- Table row hover highlight + action reveal on hover

## Data Persistence

Stored in localStorage:
- Auth users
- Auth session
- User profile fields
- User preferences
- Transactions
- Dashboard preferences (focus mode, time range, section visibility)
- Goal tracker target

## Notes

- Backend is intentionally not implemented.
- Build warning about chunk size is expected due charting + animation libraries.
