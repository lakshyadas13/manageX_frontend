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

3. Configure API URL (ensure this matches your backend port):

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
- Logout clears local auth storage and redirects to the authentication flow.

## Features

- **Task Management:** Create, edit, delete, and complete tasks.
- **Advanced Filtering/Sorting:** Filter by priority, status, and tags. Sort by due date, priority, or created time.
- **Progress Tracking:** Interactive progress heatmap popup visualizing completed tasks over time.
- **Widgets Integration:** 
  - **Weather Widget:** Displays live weather data (powered by WeatherAPI).
  - **Motivational Quotes:** Displays daily quotes (powered by ZenQuotes API with fallback handling).
- **Google Calendar Sync:** One-click "Add to Calendar" button generates pre-filled links for tasks.
- **Dynamic Avatars:** Automatically generates unique user avatars using the DiceBear API based on the user's name.
- **Modern UI:** Built with custom Tailwind CSS rules and premium Google typography (Instrument Serif and Instrument Sans).
