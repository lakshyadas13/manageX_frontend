# ManageX Frontend

React + Vite frontend for ManageX task management.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an env file:

```bash
cp .env.example .env
```

3. Configure API URL:

```env
VITE_API_BASE_URL=http://localhost:5001
```

## Run Scripts

Development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Type checking:

```bash
npm run typecheck
```

Default frontend URL:

- http://localhost:5173

## Authentication

- Register and login pages are available in the app.
- JWT token is saved in localStorage after successful login/register.
- Token is sent as Authorization header for all task requests.
- Unauthenticated users are redirected to login.
- Logout clears local auth storage and redirects to authentication flow.

## Features

- Task create, edit, delete, complete
- Filtering by priority, status, tags
- Sorting by due date, priority, created time
- Progress heatmap popup
- User-scoped task data with protected routes
