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

## 1. Prerequisites

- Node.js 20+
- A running PostgreSQL server (local install, Docker, or a hosted instance)

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lms
SESSION_SECRET=replace-with-a-long-random-string
```

If you don't have Postgres running yet, the quickest path is Docker:

```bash
docker run --name lms-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker exec -it lms-postgres psql -U postgres -c "CREATE DATABASE lms;"
```

## 4. Create the schema and seed demo data

```bash
npm run db:migrate   # applies src/db/schema.sql
npm run db:seed      # wipes and re-seeds demo users, courses, and progress
```

## 5. Run it

```bash
npm run dev
```

Visit http://localhost:3000.

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
