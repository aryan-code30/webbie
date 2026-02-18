# Webbie — Aesthetic Task & Focus Manager

> A beautiful, all-in-one productivity web app. Think Notion meets a lo-fi study room — tasks, focus mode, Spotify, and an aesthetic clock, all in one place.

---

## Vision

Webbie is a personal productivity dashboard where you can:
- Manage tasks and checklists with a clean, card-based UI
- Enter **Focus Mode** to block distractions and stay on task
- Listen to Spotify without leaving the app
- Watch a beautiful ambient clock as time passes

The goal is a visually immersive, distraction-free workspace that feels personal and aesthetic — not corporate.

---

## Feature Breakdown

### 1. Task & Checklist Management
- Create, edit, delete tasks
- Organize tasks into boards or lists (similar to Notion pages)
- Mark tasks complete with satisfying animations
- Due dates, priorities, and tags
- Drag-and-drop reordering
- Subtasks / nested checklists

### 2. Focus Mode
- Full-screen distraction-free view
- Pomodoro timer (25 min work / 5 min break, customizable)
- Current task displayed front and center
- Ambient background (gradient or user-selected theme)
- Session stats (tasks completed, time focused)

### 3. Spotify Integration
- OAuth login with Spotify
- Play/pause, skip, volume control without leaving the app
- Display currently playing song + album art
- Curated playlist suggestions for focus (lo-fi, instrumental, etc.)
- Mini player that stays visible while working

### 4. Aesthetic Clock
- Analog and digital modes
- Live time display with smooth animations
- Theme-aware (matches current color scheme)
- Optional date + day-of-week display
- Ambient mode: clock fills screen with soft gradient background

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React + TypeScript                |
| Styling     | Tailwind CSS + Framer Motion      |
| State       | Zustand (lightweight state mgmt)  |
| Storage     | localStorage (MVP) → Supabase     |
| Auth        | Supabase Auth (for Spotify OAuth) |
| Spotify API | Spotify Web API + Playback SDK    |
| Hosting     | Vercel                            |

---

## Project Structure

```
webbie/
├── public/
│   └── assets/          # fonts, icons, static images
├── src/
│   ├── components/
│   │   ├── Clock/       # Aesthetic clock component
│   │   ├── Tasks/       # Task list, task card, checklist
│   │   ├── Focus/       # Focus mode overlay + Pomodoro timer
│   │   ├── Spotify/     # Spotify player + OAuth flow
│   │   └── UI/          # Buttons, modals, shared UI pieces
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state stores
│   ├── pages/           # Route pages (Dashboard, Focus, Settings)
│   ├── lib/             # Spotify API helpers, Supabase client
│   ├── types/           # TypeScript interfaces
│   └── styles/          # Global CSS + Tailwind config
├── .env.example         # Required env vars (documented, no secrets)
└── README.md            # This file
```

---

## Development Phases

### Phase 1 — Foundation (Week 1)
**Goal:** Scaffold the project, get tasks working locally.

- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Tailwind CSS and base design tokens (colors, fonts, spacing)
- [ ] Build core Task model (id, title, description, status, priority, dueDate)
- [ ] Create Task list + Task card components
- [ ] Add/edit/delete tasks with localStorage persistence
- [ ] Basic drag-and-drop reordering (via `@dnd-kit/core`)
- [ ] Responsive layout: sidebar + main content area

**Deliverable:** A working task manager that saves to localStorage.

---

### Phase 2 — Clock & Aesthetic Polish (Week 2)
**Goal:** Make it beautiful.

- [ ] Build analog clock with smooth CSS/SVG animation
- [ ] Build digital clock variant with elegant typography
- [ ] Add theme system (Dark, Light, Lo-fi, Forest, Ocean — at least 3)
- [ ] Animate task completions (checkmark burst, strikethrough)
- [ ] Add smooth page transitions with Framer Motion
- [ ] Ambient mode: clock + gradient fullscreen

**Deliverable:** Beautiful, themed dashboard with a live clock.

---

### Phase 3 — Focus Mode (Week 3)
**Goal:** A distraction-free work experience.

- [ ] Build Pomodoro timer (configurable work/break durations)
- [ ] Focus Mode overlay (fades out distractions, shows current task)
- [ ] Keyboard shortcut to enter/exit focus mode (`F` key)
- [ ] Session stats: tasks done today, total focus time
- [ ] Browser notifications when timer ends (with permission)
- [ ] Focus history log

**Deliverable:** Fully functional focus mode with Pomodoro.

---

### Phase 4 — Spotify Integration (Week 4)
**Goal:** Music without leaving the app.

- [ ] Register app on Spotify Developer Dashboard
- [ ] Implement Spotify OAuth 2.0 PKCE flow (no backend needed)
- [ ] Fetch currently playing track + display album art
- [ ] Playback controls: play/pause, next, previous, volume
- [ ] Mini player component (docked to bottom or sidebar)
- [ ] Browse/search playlists and start playback
- [ ] Graceful fallback if user has no Spotify Premium

**Deliverable:** Spotify mini-player embedded in the dashboard.

---

### Phase 5 — Backend & Auth (Week 5)
**Goal:** Data persistence across devices.

- [ ] Set up Supabase project
- [ ] Create tasks table with Row Level Security (RLS)
- [ ] Migrate from localStorage to Supabase
- [ ] Add email/password auth (Supabase Auth)
- [ ] Link Spotify token to user session
- [ ] Real-time task sync

**Deliverable:** Cloud-synced tasks with user accounts.

---

### Phase 6 — Launch Polish (Week 6)
**Goal:** Ship it.

- [ ] SEO meta tags + Open Graph image
- [ ] PWA support (installable on desktop/mobile)
- [ ] Keyboard shortcuts reference modal
- [ ] Onboarding walkthrough for new users
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Deploy to Vercel with custom domain

**Deliverable:** Public launch-ready app.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Spotify account (free works for OAuth; Premium needed for playback control)
- A Supabase account (free tier is fine)

### Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/webbie.git
cd webbie

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your .env.local:
#   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
#   VITE_SUPABASE_URL=your_supabase_project_url
#   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. Start the dev server
npm run dev
```

App will be running at `http://localhost:5173`.

---

## Environment Variables

| Variable                  | Where to get it                                     |
|---------------------------|-----------------------------------------------------|
| `VITE_SPOTIFY_CLIENT_ID`  | Spotify Developer Dashboard → Create App            |
| `VITE_SUPABASE_URL`       | Supabase → Project Settings → API                  |
| `VITE_SUPABASE_ANON_KEY`  | Supabase → Project Settings → API (anon public key)|

> **Never commit `.env.local` or any file containing real secrets.**

---

## Spotify Setup Notes

1. Go to the Spotify Developer Dashboard and create a new app
2. Set **Redirect URI** to `http://localhost:5173/callback` for local dev
3. Add your production domain redirect URI before deploying
4. Copy the **Client ID** (you do NOT need the Client Secret for PKCE flow)
5. Spotify playback SDK requires the user to have **Spotify Premium**
6. Users without Premium can still authenticate and see now-playing info

---

## Design Guidelines

- **Font:** Inter or Geist for UI, a serif like Lora or Playfair for headings
- **Colors:** Deep backgrounds (`#0d0d0d` or `#1a1a2e`), muted accents, soft glows
- **Motion:** Subtle and intentional — no jarring transitions
- **Spacing:** Generous whitespace — breathable, not cramped
- **Icons:** Lucide React (consistent, minimal icon set)

---

## Key Decisions & Trade-offs

| Decision | Reasoning |
|---|---|
| Vite over CRA | Faster builds, modern tooling |
| Zustand over Redux | Simpler API, less boilerplate for this scale |
| localStorage first | Lets us build fast before adding backend complexity |
| PKCE OAuth for Spotify | No backend server needed, safer for SPAs |
| Supabase over Firebase | Postgres-based, open source, great DX |
| Tailwind over CSS-in-JS | Faster styling iteration, consistent design tokens |

---

## Stretch Goals (Post-Launch)

- [ ] AI-powered task suggestions (Claude API)
- [ ] Habit tracker module
- [ ] Markdown notes (like Notion pages, but minimal)
- [ ] Background ambient sounds (rain, cafe noise) without Spotify
- [ ] Chrome extension to add tasks from any page
- [ ] Mobile app via React Native (shared logic with web)
- [ ] Share your focus stats publicly (like GitHub contribution graph)

---

*Built with love, caffeine, and lo-fi beats.*
