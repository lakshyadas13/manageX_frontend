# ManageX Frontend

Modern React and TypeScript workspace client for ManageX featuring multi-user collaboration, task discussions, activity timelines, calendar sync, productivity analytics, and live widgets.

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-MANAGEX-2F80B7?style=for-the-badge)](https://manage-x-frontend.vercel.app)
[![Frontend Preview](https://img.shields.io/badge/VITE-MANAGEX_FRONTEND-646CFF?style=for-the-badge&logo=vite&logoColor=white)](http://localhost:5173)

---

## Tech Stack

- **Framework:** React 18 (with TypeScript)
- **Bundler & Dev Server:** Vite
- **Styling:** Tailwind CSS (v3) + Vanilla CSS
- **Iconography:** Lucide React (pure SVG icon set, zero emojis)
- **Animations & Shaders:** Framer Motion, `@paper-design/shaders-react`
- **PDF Generation:** jsPDF
- **Routing:** React Router DOM (v6)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` root:

```bash
cp .env.example .env
```

Configure your backend URL:

```env
VITE_API_BASE_URL=http://localhost:5001
```

### 3. Run Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts local development server with HMR (`http://localhost:5173`) |
| `npm run build` | Bundles and minifies for production in `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Validates TypeScript types across the codebase |

---

## Core Features

### 1. Multi-User Collaboration
- **Searchable Multi-User Picker:** Search and select multiple team members with keyboard and mouse support.
- **Smart Viewport Positioning:** Dropdown automatically calculates available viewport space, opening *upward* (drop-up) when near the bottom of the screen to prevent clipping.
- **Compact Avatar Chips:** Task cards display clean overlapping initial chips (`👤 👤 +N`) with hover tooltips showing user names.

### 2. Task Details Modal
- Tabbed interface separating content into:
  - **Details:** Full metadata, descriptions, dates, and inline collaborator addition/removal for task creators.
  - **Comments:** Real-time chronological discussion stream with relative timestamps, author avatars, and inline edit/delete permissions.
  - **Activity:** Connected vertical timeline displaying task creation, status changes, priority shifts, member updates, and comments.

### 3. Quick Action Icon Toolbar
- Compact top-right icon buttons for clean card hierarchy:
  - `Info ("i")` → View Task Details & Comments count badge
  - `CalendarPlus` → Add directly to Google Calendar
  - `CheckCircle2` / `RotateCcw` → Toggle Complete / Pending
  - `Pencil` → Edit Task
  - `Trash2` → Delete Task (with subtle destructive hover)
- Descriptive native tooltips and accessible `aria-label` tags on every control.

### 4. Profile & Productivity Hub
- **GitHub-style Contribution Grid:** Visualizes completed tasks day by day.
- **Password Management:** Secure password update modal with validation.
- **Weekly PDF Reports:** One-click report download powered by jsPDF summarizing completed and pending tasks.

### 5. Smart Dashboard & Widgets
- **Geolocation Weather:** Automatically detects browser coordinates (`navigator.geolocation`) with fallback city weather.
- **Quotes Widget:** Daily motivational quotes with resilient fallbacks.
- **Smart Alerts Banner:** Live counts for high priority, due soon, and overdue tasks.
- **Compact Filter Popover:** Save vertical space with popover-based priority, tag, and sort filters.

---

## Project Structure

```
frontend/
├── src/
│   ├── api/             # API client services (tasks, users)
│   ├── components/
│   │   ├── features/    # MultiUserPicker, TaskDetailsModal, ReportButton, AlertBanner
│   │   ├── profile/     # ProfileHub, ContributionGrid, PasswordChangeModal
│   │   ├── ui/          # Background shaders & visual elements
│   │   ├── widgets/     # WeatherWidget, QuotesWidget
│   │   ├── TaskDashboard.tsx
│   │   ├── TaskFilters.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── types/           # TypeScript interfaces (Task, User, Comment, Activity)
│   ├── App.tsx          # Router and authentication wrapper
│   └── main.tsx         # Application entrypoint
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.js
```

---

## License

MIT
