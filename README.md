# Webbie — Aesthetic Task & Focus Manager

> A beautiful, all-in-one productivity web app. Think Notion meets a lo-fi study room — tasks, focus mode, Spotify, an aesthetic clock, and AI-powered intelligence, all in one place. Nothing like it exists yet.

---

## Vision

Webbie is a personal productivity dashboard where you can:
- Manage tasks with energy levels, time estimates, and smart prioritization
- Enter **Focus Mode** with a built-in Pomodoro timer and ambient music
- Let **AI** handle task prioritization so you always know what to do next
- Track your productivity trends through a beautiful **Analytics Dashboard**
- Start each day with a **Daily Check-in** that sets your intention
- Listen to Spotify without ever leaving the app
- Watch an aesthetic ambient clock as time passes

The goal is a visually immersive, distraction-free workspace that feels personal — not corporate.

---

## Full Feature List

### 1. Task Management
- Create, update, delete tasks
- Rich task fields: title, description, tags, notes
- Subtasks / nested checklists
- Drag-and-drop reordering across lists
- Mark tasks complete with satisfying animations

### 2. Task Status Tracking
- Three states: **Pending → In Progress → Completed**
- Visual status indicators on each task card
- Filter and group tasks by status
- Status change history log

### 3. Energy Level Indicators
- Tag every task with required energy: `Low` / `Medium` / `High`
- Color-coded badges on task cards
- Filter tasks by energy level
- AI can suggest tasks based on your current energy (see AI section)

### 4. Time Estimation & Tracking
- Set estimated time per task (e.g., 30 min, 2 hrs)
- Track actual time spent via built-in timer
- Show estimated vs. actual comparison
- Weekly time-spent summary in Analytics

### 5. Task Prioritization
- Manual priority: Low / Medium / High / Critical
- **Deadline-based automatic sorting** — tasks due sooner bubble up
- Combined score: deadline + priority + energy level
- One-click "What should I do now?" view

### 6. Recurring Tasks
- Set tasks to repeat: daily, weekly, monthly, or custom interval
- Auto-generate next instance on completion
- Visual indicator for recurring tasks
- Skip or edit individual occurrences without affecting the series

### 7. Focus Sessions (Pomodoro Timer)
- Classic 25/5 Pomodoro, fully customizable
- Full-screen focus mode: current task front and center
- Ambient background (gradient or theme-based)
- Browser notification when session ends
- Keyboard shortcut `F` to enter / exit
- Session count tracker per task

### 8. Daily Check-ins
- Morning prompt when you open the app: "What are your top 3 goals today?"
- Evening reflection: "What did you complete? How do you feel?"
- Mood tracker (emoji-based, quick)
- Check-in history stored and visualized in Analytics
- Streak counter for consistent check-ins

### 9. AI-Powered Task Prioritization
- AI analyzes your task list and suggests an optimal order based on:
  - Deadlines
  - Energy levels and estimated effort
  - Time of day (high-energy tasks in the morning, low-energy later)
  - Your historical completion patterns
- "Plan my day" button — AI generates a ranked daily task queue
- Smart suggestions: "You have 20 mins free — here's a quick task"
- Powered by Claude API (Anthropic)

### 10. Analytics Dashboard
- Tasks completed per day / week / month (bar + line charts)
- Focus time tracked over time
- Energy level breakdown: which tasks you actually complete
- Estimated vs. actual time accuracy score
- Streak stats: longest focus streak, daily check-in streak
- Most productive hours heatmap
- Tag/category breakdown of your work

### 11. Spotify Integration
- OAuth login with Spotify (PKCE flow — no backend needed)
- Mini player docked to the app: play/pause, skip, volume
- Display currently playing song + album art
- Browse and start playlists from within the app
- Curated focus playlist suggestions (lo-fi, instrumental)
- Stays visible during Focus Mode

### 12. Aesthetic Clock
- Analog and digital display modes
- Smooth, animated hands / digits
- Theme-aware — matches your selected color scheme
- Shows date and day of week
- **Ambient Mode:** clock fills the screen with a soft gradient — perfect for focus breaks

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React + TypeScript                      |
| Styling      | Tailwind CSS + Framer Motion            |
| State        | Zustand                                 |
| Storage      | localStorage (MVP) → Supabase (v2)      |
| Auth         | Supabase Auth                           |
| Database     | Supabase (PostgreSQL)                   |
| AI           | Claude API (Anthropic)                  |
| Spotify      | Spotify Web API + Playback SDK          |
| Charts       | Recharts                                |
| Hosting      | Vercel                                  |

---

## Project Structure

```
webbie/
├── public/
│   └── assets/              # fonts, icons, static images
├── src/
│   ├── components/
│   │   ├── Clock/           # Aesthetic clock (analog + digital + ambient)
│   │   ├── Tasks/           # Task list, task card, checklist, status
│   │   ├── Focus/           # Pomodoro timer, focus mode overlay
│   │   ├── Spotify/         # Mini player, OAuth flow, playlist browser
│   │   ├── Analytics/       # Charts, heatmap, stats cards
│   │   ├── CheckIn/         # Daily morning/evening check-in flow
│   │   ├── AI/              # AI prioritization panel, day planner
│   │   └── UI/              # Buttons, modals, badges, shared pieces
│   ├── hooks/               # useTimer, useSpotify, useTasks, useAI, etc.
│   ├── store/               # Zustand stores (tasks, sessions, checkins)
│   ├── pages/               # Dashboard, Focus, Analytics, Settings
│   ├── lib/
│   │   ├── spotify.ts       # Spotify API helpers
│   │   ├── supabase.ts      # Supabase client
│   │   ├── claude.ts        # Claude API helpers for AI features
│   │   └── analytics.ts     # Data aggregation helpers
│   ├── types/               # TypeScript interfaces for all models
│   └── styles/              # Global CSS + Tailwind config
├── .env.example             # All required env vars documented
└── README.md                # This file
```

---

## Data Models

```ts
// Core task shape
interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  energyLevel: 'low' | 'medium' | 'high'
  estimatedMinutes?: number
  actualMinutes?: number
  dueDate?: Date
  tags: string[]
  subtasks: Subtask[]
  recurring?: RecurringConfig
  focusSessions: number       // pomodoro count
  createdAt: Date
  completedAt?: Date
}

interface RecurringConfig {
  interval: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number
  nextOccurrence: Date
}

interface FocusSession {
  id: string
  taskId?: string
  startedAt: Date
  endedAt: Date
  durationMinutes: number
  completed: boolean          // did the full session finish?
}

interface DailyCheckIn {
  id: string
  date: string                // YYYY-MM-DD
  morningGoals: string[]      // top 3 tasks for today
  eveningReflection?: string
  mood?: 1 | 2 | 3 | 4 | 5
  completedAt?: Date
}
```

---

## Development Phases

### Phase 1 — Task Core (Week 1)
**Goal:** Solid, working task manager with all task fields.

- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tailwind CSS + design tokens (colors, fonts, spacing)
- [ ] Implement Task model with all fields (status, energy, time, priority)
- [ ] Task list + task card components
- [ ] Create / edit / delete tasks
- [ ] Status transitions (Pending → In Progress → Completed) with animation
- [ ] Energy level badges + priority indicators
- [ ] Deadline-based auto-sort
- [ ] localStorage persistence
- [ ] Drag-and-drop reorder (`@dnd-kit/core`)
- [ ] Responsive sidebar + main layout

**Deliverable:** Full-featured task manager in the browser.

---

### Phase 2 — Recurring Tasks + Time Tracking (Week 2)
**Goal:** Power-user task features.

- [ ] Recurring task config UI (daily / weekly / monthly / custom)
- [ ] Auto-generate next task instance on completion
- [ ] Built-in time tracker per task (start/stop timer)
- [ ] Display estimated vs. actual time on task card
- [ ] Subtask checklist with progress bar

**Deliverable:** Tasks feel complete and professional.

---

### Phase 3 — Clock & Aesthetic (Week 3)
**Goal:** Make it visually stunning.

- [ ] Analog clock with smooth SVG animation
- [ ] Digital clock with elegant typography
- [ ] Theme system — at least 4 themes: Dark, Lo-fi, Forest, Ocean
- [ ] Ambient clock mode (fullscreen + gradient)
- [ ] Smooth page/component transitions (Framer Motion)
- [ ] Task completion animation (burst + strikethrough)
- [ ] Theme switcher in settings

**Deliverable:** A dashboard you actually want to look at.

---

### Phase 4 — Focus Mode + Pomodoro (Week 4)
**Goal:** Distraction-free deep work.

- [ ] Pomodoro timer (configurable durations)
- [ ] Focus Mode fullscreen overlay
- [ ] FocusSession model + storage
- [ ] Keyboard shortcut `F` to toggle
- [ ] Session counter per task
- [ ] Browser notifications on session end
- [ ] Focus history view

**Deliverable:** Complete focus experience.

---

### Phase 5 — Daily Check-ins (Week 5)
**Goal:** Build the daily ritual layer.

- [ ] Morning check-in modal (top 3 goals for today)
- [ ] Evening reflection prompt
- [ ] Mood tracker (1–5 emoji scale)
- [ ] Check-in streak counter
- [ ] Store check-in history locally
- [ ] Show today's goals on the dashboard sidebar

**Deliverable:** App becomes a daily habit, not just a tool.

---

### Phase 6 — Spotify Integration (Week 6)
**Goal:** Music without context switching.

- [ ] Spotify OAuth 2.0 PKCE flow
- [ ] Mini player: now playing, album art, controls
- [ ] Playlist browser + start playback
- [ ] Focus playlist suggestions
- [ ] Player visible during Focus Mode
- [ ] Graceful fallback for non-Premium users

**Deliverable:** Spotify embedded seamlessly.

---

### Phase 7 — AI Prioritization (Week 7)
**Goal:** Let AI handle the "what should I do next?" problem.

- [ ] Integrate Claude API
- [ ] "Plan my day" button → AI ranks today's tasks
- [ ] AI prompt includes: deadlines, energy levels, time estimates, time of day
- [ ] Smart suggestion: "You have 20 mins — try this task"
- [ ] AI reasoning shown transparently (so user understands the suggestion)
- [ ] AI learns from check-in mood + completion patterns over time

**Deliverable:** The app feels like a smart productivity partner.

---

### Phase 8 — Analytics Dashboard (Week 8)
**Goal:** Show users their own productivity story.

- [ ] Tasks completed per day / week (bar chart — Recharts)
- [ ] Focus time over time (line chart)
- [ ] Energy level completion breakdown (pie chart)
- [ ] Estimated vs. actual time accuracy
- [ ] Most productive hours heatmap
- [ ] Check-in mood trend line
- [ ] Streak stats display

**Deliverable:** Users can see their patterns and improve.

---

### Phase 9 — Backend & Auth (Week 9)
**Goal:** Sync everything to the cloud.

- [ ] Set up Supabase project + tables (tasks, sessions, checkins)
- [ ] Row Level Security (RLS) on all tables
- [ ] Email/password auth (Supabase Auth)
- [ ] Migrate from localStorage to Supabase
- [ ] Link Spotify token to user session
- [ ] Real-time sync (tasks update live across tabs)

**Deliverable:** Data persists across devices and sessions.

---

### Phase 10 — Launch Polish (Week 10)
**Goal:** Ship it.

- [ ] SEO meta tags + Open Graph image
- [ ] PWA support (installable on desktop/mobile)
- [ ] Keyboard shortcuts modal
- [ ] Onboarding walkthrough for new users
- [ ] Lighthouse score > 90
- [ ] Deploy to Vercel with custom domain
- [ ] Final README + changelog

**Deliverable:** Public launch.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm
- Spotify account (Premium needed for playback control)
- Supabase account (free tier)
- Anthropic API key (for AI features)

### Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/webbie.git
cd webbie

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in .env.local (see table below)

# 5. Start the dev server
npm run dev
```

App runs at `http://localhost:5173`.

---

## Environment Variables

| Variable                   | Where to get it                                      |
|----------------------------|------------------------------------------------------|
| `VITE_SPOTIFY_CLIENT_ID`   | Spotify Developer Dashboard → Create App             |
| `VITE_SUPABASE_URL`        | Supabase → Project Settings → API                   |
| `VITE_SUPABASE_ANON_KEY`   | Supabase → Project Settings → API                   |
| `VITE_ANTHROPIC_API_KEY`   | console.anthropic.com → API Keys                    |

> **Never commit `.env.local` to git.**

---

## Spotify Setup

1. Create an app at the Spotify Developer Dashboard
2. Add Redirect URI: `http://localhost:5173/callback` (dev) + your production URL
3. Copy the **Client ID** — no Client Secret needed for PKCE
4. Playback SDK requires **Spotify Premium**; free users see now-playing info only

---

## Design Guidelines

- **Fonts:** Geist or Inter for UI; Playfair Display for decorative headings
- **Colors:** Deep dark backgrounds (`#0d0d0d`, `#111827`), muted jewel-tone accents, soft glow effects
- **Motion:** Subtle, intentional — entrance animations, not constant movement
- **Spacing:** Generous — the app should breathe, not feel cramped
- **Icons:** Lucide React throughout

---

## Key Decisions

| Decision | Reasoning |
|---|---|
| Vite over CRA | Faster builds, modern defaults |
| Zustand over Redux | Less boilerplate, fits this scale perfectly |
| localStorage first | Ship fast, add backend later |
| PKCE for Spotify OAuth | No backend server required for auth |
| Claude API for AI | Best reasoning for task prioritization |
| Recharts for analytics | Lightweight, composable, React-native |
| Supabase over Firebase | PostgreSQL, open source, excellent DX |

---

## Post-Launch Ideas

- Ambient sounds without Spotify (rain, cafe noise, white noise)
- Habit tracker module alongside tasks
- Markdown notes (lightweight Notion-style pages)
- Chrome extension to capture tasks from any webpage
- Public focus stats page (like a GitHub contribution graph)
- Mobile app via React Native (shared logic)
- Team mode — shared task boards with friends or colleagues

---

*Built with love, caffeine, and lo-fi beats.*
