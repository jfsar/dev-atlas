# DevAtlas

DevAtlas is an open learning platform for developers. It combines interactive
roadmaps, business-domain explainers, and hands-on project briefs. The platform
is original work; it uses a different brand, content, and implementation from
roadmap.sh.

V1 is public-first. Visitors browse published content anonymously; no learner
accounts, progress tracking, community features, or monetization exist. Admin
editors sign in to manage content.

## Features

- **Public catalog** — roadmaps, topics, business domains, projects, and
  resources, all database-driven and admin-managed.
- **Interactive roadmap graph** — node/edge exploration with
  `@xyflow/react`, plus a non-graph topic outline for mobile and assistive
  technology.
- **PostgreSQL search** — trigram-backed search across all public content. No
  external search engine.
- **SEO** — per-route title, description, canonical URL, Open Graph tags,
  structured data, `sitemap.xml`, and `robots.txt`.
- **Admin CMS** — content CRUD, taxonomy, publishing, and SEO fields.
- **Visual roadmap editor** — node/edge CRUD, layout persistence, relationship
  editing, draft, preview, and publish.
- **Admin security** — Better Auth email/password sessions, server-enforced
  authorization, rate limiting, and TOTP 2FA.

## Tech stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Framework  | React Router 7.18 (framework mode, SSR), React 19, TypeScript |
| Build      | Vite 8                                                        |
| Styling    | Tailwind CSS v4, shadcn/ui (radix), `@xyflow/react`           |
| Server     | React Router loaders/actions/resource routes                  |
| Database   | PostgreSQL 17, Prisma 7.10, `@prisma/adapter-pg`              |
| Auth       | Better Auth 1.7, `@better-auth/prisma-adapter`                |
| Validation | Zod 4                                                         |
| Testing    | Vitest, jsdom, Testing Library                                |
| Tooling    | ESLint 9 (flat config), Prettier, Docker Compose              |

**Version gotcha:** npm `latest` resolves to React Router 8 and Prisma 8 (RC).
This project pins React Router 7 and Prisma 7. Do not upgrade without reason or
use `@latest` for these packages.

## Prerequisites

- Node.js 20 or newer.
- Docker, for the local PostgreSQL container.
- npm.

## Quick start

```bash
npm install
copy .env.example .env      # Windows; use `cp` on Unix
docker compose up -d        # start PostgreSQL
npm run db:migrate          # apply migrations
npm run db:seed             # seed content and bootstrap the admin user
npm run dev                 # http://localhost:5173
```

`npm run db:seed` creates the admin account from `ADMIN_EMAIL` and
`ADMIN_PASSWORD`. Sign in at `/admin/login`. No public registration exists.

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable               | Required | Purpose                                                |
| ---------------------- | -------- | ------------------------------------------------------ |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string (matches `compose.yaml`). |
| `NEON_DB_POOLED_URL`   | No       | Pooled URL for app traffic when using Neon.            |
| `NEON_DB_UNPOOLED_URL` | No       | Direct URL for migrations and seeding when using Neon. |
| `BETTER_AUTH_SECRET`   | Yes      | Session signing secret, at least 16 characters.        |
| `BETTER_AUTH_URL`      | Yes      | Auth base URL; `http://localhost:5173` in development. |
| `VITE_SITE_URL`        | No       | Public canonical origin for SEO tags.                  |
| `ADMIN_EMAIL`          | Seed     | Admin login used by `npm run db:seed`.                 |
| `ADMIN_PASSWORD`       | Seed     | Admin password used by `npm run db:seed`.              |
| `ADMIN_NAME`           | No       | Admin display name; defaults to "Admin".               |

Server code validates these on startup through `app/lib/env.server.ts`. A
missing or malformed value fails fast with an actionable error.

## Scripts

| Command                 | Action                                           |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Start the development server on port 5173.       |
| `npm run build`         | Create a production build.                       |
| `npm run start`         | Serve the production build.                      |
| `npm run typecheck`     | Run React Router typegen and `tsc`.              |
| `npm run lint`          | Run ESLint (`lint:fix` to autofix).              |
| `npm run format`        | Format with Prettier (`format:check` to verify). |
| `npm test`              | Run Vitest once (`test:watch`, `test:coverage`). |
| `npm run db:generate`   | Generate the Prisma client after schema changes. |
| `npm run db:migrate`    | Create and apply a development migration.        |
| `npm run db:deploy`     | Apply pending migrations.                        |
| `npm run db:studio`     | Open Prisma Studio.                              |
| `npm run db:seed`       | Seed content and bootstrap the admin user.       |
| `npm run docker:up`     | Start PostgreSQL (`docker:down`, `docker:logs`). |
| `npm run docker:app:up` | Build and run the full stack for a smoke test.   |

Never run bare `tsc`; use `npm run typecheck`, which runs typegen first.

## Routes

**Public**

- `/` — home.
- `/roadmaps`, `/roadmaps/:slug` — catalog and interactive roadmap.
- `/topics/:slug` — learning content.
- `/business-domains`, `/business-domains/:slug` — business-domain explainers.
- `/projects`, `/projects/:slug` — project briefs.
- `/search` — database search.
- `/sitemap.xml`, `/robots.txt` — SEO routes.

**Admin** (server-protected)

- `/admin/login`, `/admin/logout`.
- `/admin` — dashboard.
- `/admin/security` — 2FA and account security.
- `/admin/roadmaps` (+ `new`, `:id`, `:id/editor`, `:id/preview`).
- `/admin/topics` (+ `new`, `:id`).
- `/admin/business-domains` (+ `new`, `:id`).
- `/admin/projects` (+ `new`, `:id`).
- `/admin/resources` (+ `new`, `:id`).
- `/admin/categories` (+ `:id`).

Only published content is public. Public queries filter to `PUBLISHED` status.

## Project structure

```
app/
  routes.ts               Route definitions (public + admin)
  root.tsx                HTML shell and root error boundary
  app.css                 Tailwind v4 theme and design tokens
  routes/                 Route modules (loaders, actions, UI)
  components/             Shared UI, cards, graph, content renderers
    admin/                Admin-only components
    ui/                   shadcn/ui primitives
  lib/
    auth.server.ts        Better Auth instance (admin)
    session.server.ts     Session and `requireAdmin` guards
    prisma.ts             PrismaClient singleton with `PrismaPg` adapter
    env.server.ts         Server environment validation
    publishing.ts         Publish gating rules
    roadmap-graph*.ts     Graph model, rules, and layout
    search.ts             Search helpers
    seo.ts, sitemap.ts    SEO metadata and sitemap
    validation/           Zod schemas
    services/             Domain services and server queries
    audit.server.ts       Admin mutation audit log
    rate-limit.server.ts  Request rate limiting
prisma/
  schema.prisma           Data model
  migrations/             SQL migrations
  seed.ts                 Seed entrypoint
  seed/data/              Seeded roadmaps, topics, domains, projects, resources
test/
  setup.ts                Vitest setup
```

The import alias `~/*` maps to `app/*`.

## Data model

The schema lives in `prisma/schema.prisma`.

- **Roadmap graph** — `Roadmap`, `RoadmapSection`, `RoadmapNode`, and
  `RoadmapEdge`. Graph semantics (nodes, directed edges, relationship types
  `PREREQUISITE`/`RECOMMENDED`/`OPTIONAL`/`RELATED`) persist separately from
  node layout (`x`/`y`).
- **Learning content** — `Topic` with ordered `TopicContentBlock` records
  (markdown, code, callout, checklist, table, resource list, FAQ).
- **Business domains** — `BusinessDomain` with `BusinessDomainPoint` records
  (objectives, actors, entities, process steps, states, rules, controls, KPIs,
  software implications).
- **Projects** — `Project` with `ProjectMilestone` records and guidance fields
  for architecture, database, API, and testing.
- **Resources and taxonomy** — `Resource` joined to topics/projects/domains
  through explicit join tables; `Category` applies to every content type.
- **Auth** — Better Auth tables (`User`, `Session`, `Account`, `Verification`,
  `TwoFactor`).
- **Lifecycle** — every publishable model carries `PublicationStatus`
  (`DRAFT` → `PUBLISHED` → `ARCHIVED`) plus SEO fields.

## Auth, validation, and publishing

Every mutation follows one flow:

```
input → Zod → Better Auth authn/authz → business rules → Prisma → PostgreSQL
```

- **Validation** — Zod schemas live in `app/lib/validation/`. Server validation
  is authoritative; client validation is UX only. PostgreSQL constraints are the
  final integrity boundary.
- **Authorization** — `app/lib/session.server.ts` exposes `requireAdmin`. Every
  admin loader, action, and mutation enforces it server-side. Client role state
  is never trusted.
- **Publishing** — `app/lib/publishing.ts` gates the transition to `PUBLISHED`.
  A roadmap needs at least one node, a topic at least one block, a domain at
  least three points, and a project a scenario and a milestone.
- **Graph integrity** — `app/lib/roadmap-graph-rules.ts` rejects invalid node
  references, cross-roadmap edges, unsupported relationships, duplicates, and
  disallowed self/cyclic links.

Security baseline: secure `HttpOnly` session cookies, trusted-origin checks,
rate-limited auth, sanitized Markdown, an audit log for admin mutations, and no
secrets or raw database errors exposed to clients.

## Testing

```bash
npm test
```

Vitest runs with jsdom and Testing Library. Setup lives in `test/setup.ts`.
Co-locate tests as `*.test.ts(x)` or place them under `test/`. Coverage spans
validation schemas, auth guards, publishing rules, graph integrity, services,
and search. Run `npm run typecheck`, `npm run lint`, and `npm run build` before
opening a pull request.

## Docker

`docker compose up -d` starts PostgreSQL 17 only; run the app on the host with
`npm run dev`. `npm run docker:app:up` builds a production image, applies
migrations, and serves the app on port 3000 for a full-stack smoke test.
