# theKabari — Next.js App

Pakistan ka pehla gamified scrap pickup platform.

## Pages
| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/auth` | Login & signup |
| `/dashboard` | User dashboard (XP, pickups, level) |
| `/leaderboard` | Public leaderboard |
| `/admin` | Admin panel (approve users, add XP) |

---

## Setup Guide (Step by Step)

### Step 1 — Supabase setup

1. Go to **supabase.com** → Create free account
2. Click **"New project"** → give it a name → set a password → Create
3. Wait ~2 minutes for project to be ready
4. Go to **SQL Editor** → click **"New query"**
5. Copy paste the entire contents of `supabase-schema.sql` → click **Run**
6. Go to **Settings → API** → copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Environment variables

Create a `.env.local` file in the root folder:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3 — Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Step 4 — Create admin account

1. Go to `/auth` → Sign up with your email
2. Go to Supabase → **Table Editor → profiles**
3. Find your row → change `role` to `admin` and `status` to `approved`
4. Now login at `/auth` → you'll be redirected to `/admin`

### Step 5 — Deploy to Vercel (free)

1. Push this folder to GitHub
2. Go to **vercel.com** → Import your GitHub repo
3. Add environment variables (same as `.env.local`)
4. Click Deploy → done! 🚀

---

## How it works

### For customers:
1. Sign up at `/auth`
2. Wait for admin approval
3. Once approved → login → see XP dashboard
4. Every pickup adds XP + cash to their profile
5. Compete on leaderboard at `/leaderboard`

### For admin (you):
1. Login at `/auth` (with admin account)
2. Go to **Pending** → approve new users
3. Go to **Add XP** → select user → enter pickup details → submit
4. XP automatically calculated from scrap type × kg

### XP Rates:
| Scrap | XP per kg |
|-------|-----------|
| Paper | 4 |
| Plastic | 5 |
| Metal | 8 |
| Electronics | 12 |
| Glass | 3 |
| Cardboard | 4 |

### Levels:
| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Starter | 0 |
| 2 | Collector | 100 |
| 3 | Recycler | 250 |
| 4 | Green Scout | 500 |
| 5 | Eco Warrior | 900 |
| 6 | City Hero | 1500 |
| 7 | Eco Legend | 2500 |
| 8 | Planet Guardian | 4000 |
| 9 | Supreme Recycler | 6000 |
| 10 | Kabari Master | 10000 |
