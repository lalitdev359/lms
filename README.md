# Ridgeline — AI Learning Management System

A full-stack LMS built with Next.js (App Router), TypeScript, Tailwind CSS, and
PostgreSQL. Includes a public landing page and course catalog, email/password
auth, and three role-specific dashboards (Student, Instructor, Admin) with
courses → modules → lessons → enrollments → lesson-level progress tracking,
all wired end to end against a real database.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4** — custom dark design system (tokens in `src/app/globals.css`)
- **PostgreSQL** — accessed via the `pg` driver with a small hand-written
  repository layer (`src/lib/repos/*`) instead of an ORM
- **Auth** — bcrypt password hashing + signed JWT session cookie (httpOnly),
  no third-party auth provider required

There are two ways to run this: **Docker** (recommended — no local Node or
Postgres install needed) or **manually** on your machine.

## Option A: Docker

**Prerequisite:** Docker with Compose V2 (`docker compose version` should work;
if you only have the older standalone `docker-compose`, upgrade first — this
setup relies on `depends_on: condition: service_completed_successfully`,
which standalone `docker-compose` v1 doesn't support).

```bash
docker compose up --build
```

This starts three things in order:

1. **`db`** — Postgres 16, with a named volume so data survives restarts
2. **`migrate`** — a one-off container that applies `schema.sql`, then exits
   (safe to run repeatedly)
3. **`app`** — the Next.js production build, started once `migrate` finishes

Visit **http://localhost:3000**.

Load demo data (users, courses, enrollments, progress) — run this once after
the stack is up:

```bash
docker compose run --rm seed
```

Everyday commands:

```bash
docker compose up -d          # start in the background
docker compose logs -f app    # tail the app's logs
docker compose down           # stop everything (keeps the Postgres volume)
docker compose down -v        # stop and wipe the Postgres volume too
docker compose run --rm seed  # reset demo data back to its original state
```

**Custom ports / secrets:** copy `.env.example` to `.env` in the project root
— Compose reads it automatically — and adjust:

```
SESSION_SECRET=replace-with-a-long-random-string
APP_PORT=3000
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=lms
```

`SESSION_SECRET` is the one you actually want to change for anything beyond
local use — it signs the session cookie.

## Option B: Run it manually

**Prerequisites:** Node.js 20+ and a running PostgreSQL server.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# then edit .env — at minimum, point DATABASE_URL at your Postgres instance:
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lms
#   SESSION_SECRET=replace-with-a-long-random-string

# 3. Create the schema and load demo data
npm run db:migrate   # applies src/db/schema.sql
npm run db:seed      # wipes and re-seeds demo users, courses, and progress

# 4. Run it
npm run dev
```

Visit http://localhost:3000.

If you don't have Postgres installed locally, the quickest way to get one
running without the full Docker Compose setup above:

```bash
docker run --name lms-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker exec -it lms-postgres psql -U postgres -c "CREATE DATABASE lms;"
```

## Demo accounts

Every seeded account uses the password **`password123`**.

| Role       | Email              | Notes                                                 |
|------------|---------------------|--------------------------------------------------------|
| Admin      | admin@lms.dev       | Platform stats, user roles, oversight of all courses   |
| Instructor | marcus@lms.dev      | Owns "Prompt Engineering for Builders" + one draft      |
| Instructor | priya@lms.dev       | Owns "Modern Web Apps with Next.js", etc.               |
| Student    | jordan@lms.dev      | Partway through two courses                             |
| Student    | sam@lms.dev         | Finished one course, in progress on two others          |

The login page also has one-click buttons to fill these in.

## Project structure

```
src/
  app/
    page.tsx                          Landing page
    login/ register/                  Auth pages
    courses/                          Public catalog, course detail, lesson viewer
    dashboard/
      student/                        Student dashboard
      instructor/                     Instructor dashboard + course builder
      admin/                          Admin dashboard, users, course oversight
    api/                              Route handlers (auth, courses, modules,
                                       lessons, enrollments, progress, admin)
  components/
    ui/                               Button, Field, Card, Badge, ProgressBar, etc.
    landing/                          Marketing + public-course components
    dashboard/                        Sidebar, course manager, admin tables
  lib/
    db.ts                             pg Pool + query helpers
    auth.ts / session.ts              Password hashing, JWT session cookie
    repos/                            Data access per entity (users, courses,
                                       modules, lessons, enrollments, progress)
    validators.ts                     Zod schemas for input validation
  db/
    schema.sql                        Full DDL
    migrate.ts / seed.ts              Scripts run via npm run db:migrate/seed
  proxy.ts                            Route protection (Next 16's renamed middleware)
Dockerfile                            Multi-stage build: deps / builder / migrator / runner
docker-compose.yml                    db + migrate + seed + app services
```

## How auth & access control work

- Passwords are hashed with bcrypt; sessions are a signed JWT (HS256, via
  `jose`) stored in an httpOnly, sameSite=lax cookie.
- `src/proxy.ts` does an optimistic check on every `/dashboard/*` request:
  redirects to `/login` if there's no valid session cookie, and redirects to
  the correct role's dashboard if the role doesn't match the route.
- Every page and API route re-verifies the session server-side and, for
  mutations, checks real ownership (e.g. an instructor can only edit their
  own courses; only admins can change roles) — the proxy is a UX shortcut,
  not the source of truth.

## Notes on scope

- Course "video" lessons store a URL and link out rather than embedding a
  player, to keep the demo dependency-free.
- There's no file/image upload; course covers are generated gradients driven
  by a stored hue value per course.
- No transactional email — registration logs the user straight in.

## Scripts

| Command             | What it does                                  |
|----------------------|------------------------------------------------|
| `npm run dev`         | Start the dev server                          |
| `npm run build`       | Production build                              |
| `npm run start`       | Run the production build                      |
| `npm run lint`        | ESLint                                        |
| `npm run db:migrate`  | Apply `src/db/schema.sql`                     |
| `npm run db:seed`     | Wipe and re-seed demo data                    |

## Docker reference

| Command                       | What it does                                        |
|--------------------------------|------------------------------------------------------|
| `docker compose up --build`    | Build images and start `db`, `migrate`, then `app`   |
| `docker compose up -d`         | Same, detached                                       |
| `docker compose run --rm seed` | Wipe and re-seed demo data                           |
| `docker compose logs -f app`   | Tail the app container's logs                        |
| `docker compose down`          | Stop containers, keep the Postgres volume             |
| `docker compose down -v`       | Stop containers and delete the Postgres volume         |

Why a build-time DB connection isn't needed: every page that reads from the
database also reads the session cookie (`getSession()`), which makes Next
treat the whole route as dynamic (`export const dynamic = "force-dynamic"`
is set explicitly on each page as well, to be safe). So `next build` inside
the Docker image never has to reach a live Postgres instance — only the
`migrate` container and the running `app` container do, both over the
Compose network.
