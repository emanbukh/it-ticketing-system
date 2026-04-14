# IT Ticketing Information System

A complete starter web application for an internal IT Ticketing Information System built with:

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Custom JWT cookie session authentication

It includes two protected portals:

- `USER` portal for staff users
- `ADMIN` portal for IT administrators

## Screenshots

### Staff (user) portal

| Login | Dashboard |
| :---: | :---: |
| ![User login](docs/screenshots/login-user.png) | ![User dashboard](docs/screenshots/user-dashboard.png) |

| Create ticket (rich text + attachments) | My tickets |
| :---: | :---: |
| ![Create ticket](docs/screenshots/user-ticket-new.png) | ![User tickets](docs/screenshots/user-tickets.png) |

| Ticket detail |
| :---: |
| ![User ticket detail](docs/screenshots/user-ticket-detail.png) |

### Admin portal

| Login | Dashboard |
| :---: | :---: |
| ![Admin login](docs/screenshots/login-admin.png) | ![Admin dashboard](docs/screenshots/admin-dashboard.png) |

| Tickets list | Ticket detail |
| :---: | :---: |
| ![Admin tickets](docs/screenshots/admin-tickets.png) | ![Admin ticket detail](docs/screenshots/admin-ticket-detail.png) |

| History (audit trail) | User management |
| :---: | :---: |
| ![Admin history](docs/screenshots/admin-history.png) | ![Admin users](docs/screenshots/admin-users.png) |

## Features

- Staff login with `name + staff ID`
- Admin login with `username + password`
- Role-based route protection for `/user/*` and `/admin/*`
- User dashboard with summary cards and recent tickets
- Ticket creation with category, subject, description, validation, and auto-number generation
- User ticket tracking and threaded conversation view
- User profile update page
- Admin dashboard with totals, response rate, solve rate, pending rate, recent tickets, and category breakdown
- Admin ticket management with search, filter, sort, reply, and status updates
- Admin history page with ticket audit trail
- Admin user management with add/edit/reset password flow
- Admin settings page for profile and password changes
- Prisma seed data with demo-ready users, admins, tickets, replies, and history logs

## Folder Structure

```text
.
├── app
│   ├── admin
│   ├── login
│   ├── user
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components
│   ├── forms
│   ├── layouts
│   ├── shared
│   └── ui
├── lib
│   ├── actions
│   ├── auth.ts
│   ├── prisma.ts
│   ├── session.ts
│   ├── tickets.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── types
│   └── index.ts
├── .env.example
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Setup

Copy `.env.example` to `.env` and update the values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_ticketing"
SESSION_SECRET="change-this-to-a-long-random-secret"
```

## Installation

```bash
npm install
```

## Prisma Setup

1. Create the PostgreSQL database:

```sql
CREATE DATABASE it_ticketing;
```

2. Generate Prisma client:

```bash
npm run db:generate
```

3. Run migration:

```bash
npm run db:migrate -- --name init
```

4. Seed demo data:

```bash
npm run db:seed
```

## Run The App

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm run start
```

## Docker Desktop Deployment

This project includes:

- [`/Users/user/Documents/Website Moodle/Ticket/Dockerfile`](/Users/user/Documents/Website Moodle/Ticket/Dockerfile)
- [`/Users/user/Documents/Website Moodle/Ticket/compose.yaml`](/Users/user/Documents/Website Moodle/Ticket/compose.yaml)
- [`/Users/user/Documents/Website Moodle/Ticket/docker-entrypoint.sh`](/Users/user/Documents/Website Moodle/Ticket/docker-entrypoint.sh)

Run with Docker Desktop:

```bash
docker compose up --build
```

Then open:

- App: [http://localhost:3000](http://localhost:3000)
- Postgres: `localhost:5432`

What happens on startup:

- Postgres starts in its own container
- The Next.js app container builds and starts
- Prisma client is generated
- Prisma schema is pushed to Postgres
- Demo seed data is inserted automatically

To stop the stack:

```bash
docker compose down
```

To remove the database volume and reset demo data completely:

```bash
docker compose down -v
```

## Render Deployment

This repo now includes a Render Blueprint file:

- [`/Users/user/Documents/Website Moodle/Ticket/render.yaml`](/Users/user/Documents/Website Moodle/Ticket/render.yaml)

It provisions:

- A public Render web service for the Next.js app
- A private Render Postgres service using the official `mysql:8.4` image
- A persistent disk mounted at `/var/lib/mysql`

### Important Render Notes

- Render supports Docker-based web services officially.
- Render also supports Postgres by running it as a private service with a persistent disk.
- The web app builds `DATABASE_URL` at startup from linked `MYSQL_*` variables because Render Blueprints do not support variable interpolation directly.

### Render Publish Steps

1. Push this project to GitHub or GitLab.
2. In Render, choose **New +** > **Blueprint**.
3. Connect your repository and select this project.
4. Render will detect [`render.yaml`](/Users/user/Documents/Website Moodle/Ticket/render.yaml).
5. During first setup, provide values for:
   - `MYSQL_PASSWORD`
   - `MYSQL_ROOT_PASSWORD`
6. Click **Apply** to create both services.

### After First Deploy

- Open the generated `it-ticketing-web.onrender.com` URL.
- In the web service environment, temporarily set `SEED_ON_START=true` only if you want demo data inserted on the next deploy.
- After the seed deploy finishes, set `SEED_ON_START=false` again to avoid resetting production data on later deploys.

### Recommended First-Deploy Seed Flow

1. Deploy the Blueprint with `SEED_ON_START=false`.
2. Open the web service settings in Render.
3. Change `SEED_ON_START` to `true`.
4. Trigger a manual deploy once.
5. Log in and confirm demo data appears.
6. Change `SEED_ON_START` back to `false`.

## Demo Credentials

### User Logins

- `Nurul Huda / STF1001`
- `Jason Lim / STF1002`
- `Siti Balqis / STF1003`

### Admin Logins

- `itadmin / admin123`
- `helpdesk / support123`

## Ticket Number Format

New tickets are generated in the format:

```text
IT-2026-0001
IT-2026-0002
```

The sequence resets per year.

## Notes

- User login is intentionally lightweight for internal/staff usage and validates an existing staff record by `name + staffId`.
- Admin authentication uses hashed passwords with `bcryptjs`.
- Session handling uses signed JWT cookies stored server-side through Next.js request cookies.
- Ticket replies and status changes automatically create `TicketHistory` records.
- The design is fully responsive and optimized for internal dashboard-style usage.

## Important Project Files

- Prisma schema: [`/Users/user/Documents/Website Moodle/Ticket/prisma/schema.prisma`](/Users/user/Documents/Website Moodle/Ticket/prisma/schema.prisma)
- Seed script: [`/Users/user/Documents/Website Moodle/Ticket/prisma/seed.ts`](/Users/user/Documents/Website Moodle/Ticket/prisma/seed.ts)
- Middleware route protection: [`/Users/user/Documents/Website Moodle/Ticket/middleware.ts`](/Users/user/Documents/Website Moodle/Ticket/middleware.ts)
- User auth action: [`/Users/user/Documents/Website Moodle/Ticket/lib/actions/auth.ts`](/Users/user/Documents/Website Moodle/Ticket/lib/actions/auth.ts)
- Ticket data/query helpers: [`/Users/user/Documents/Website Moodle/Ticket/lib/tickets.ts`](/Users/user/Documents/Website Moodle/Ticket/lib/tickets.ts)
