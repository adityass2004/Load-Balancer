# TrackIt Load Balancer

Production-grade load balancer monitoring dashboard built with Next.js 15.

## Stack

| Tool | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| TailwindCSS + shadcn/ui | UI |
| Prisma + PostgreSQL | Database |
| Server Actions | Mutations |
| Axios | HTTP client |
| React Query | Server state |
| Zod | Validation |

## Project Structure

```
trackit-load-balancer/
├── app/                  # App Router pages & API routes
│   ├── (dashboard)/      # Dashboard route group
│   ├── api/health/       # Health check endpoint
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/           # Navbar, Sidebar, etc.
│   ├── shared/           # Providers, wrappers
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── db.ts             # Prisma singleton
│   ├── axios.ts          # Axios instance
│   ├── query-client.ts   # React Query config
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # cn() utility
├── actions/              # Server Actions
├── services/             # Axios API service layer
├── hooks/                # React Query hooks
├── types/                # TypeScript types
├── middleware.ts          # Next.js middleware
└── prisma/
    └── schema.prisma
```

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push schema to DB
npm run db:push

# Start dev server
npm run dev
```

## Add shadcn/ui components

```bash
npx shadcn@latest add button card badge
```
