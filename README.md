<<<<<<< HEAD
# ManageX Frontend 🚀

A modern task management frontend built with React and Tailwind CSS.

## 🔥 Features
- Clean and modern UI (Notion-inspired)
- Add, edit, delete tasks
- Priority, tags, notes support
- JWT-based authentication (login/register)
- Protected routes
- Responsive design
- 21st.dev inspired UI components

## 🛠 Tech Stack
- React (Vite)
- Tailwind CSS
- JavaScript / TypeScript

## ⚙️ Setup Instructions

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/managex-frontend.git
cd managex-frontend        

2. Install dependencies:
npm install

=======
# ManageX Frontend

React + Vite frontend for ManageX task management.

## Stack

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

2. Create env file:

```bash
cp .env.example .env
```

3. Configure API URL:

```env
VITE_API_BASE_URL=http://localhost:5001
```

## Run

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

Type checks:

```bash
npm run typecheck
```

Default frontend URL:

- http://localhost:5173

## Authentication Flow

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
>>>>>>> d42a9e9 (frontend ready)
