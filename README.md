# Glowison ERP

This project is a single Next.js application that serves both:

- the frontend pages
- the backend API through `src/pages/api/*`

That structure is compatible with Vercel, so you do not need a separate Express server deployment.

## Local development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

Set these in your local `.env` file and in the Vercel project settings:

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- `DATABASE_URL` should be the pooled connection string for runtime usage.
- `DIRECT_URL` should be the direct database connection for Prisma migrations if you use them.
- `JWT_SECRET` is required for login and authenticated API routes.

## Prisma

Generate the Prisma client:

```bash
npm run db:generate
```

Seed the first admin user:

```bash
npm run db:seed
```

## Vercel deployment

This repo now includes Vercel-safe Prisma setup:

- `postinstall` runs `prisma generate`
- `vercel.json` runs `prisma generate && next build`
- API routes use the built-in Next.js serverless runtime

Deploy steps:

1. Import this repository into Vercel.
2. Add the required environment variables in the Vercel dashboard.
3. Deploy.

If the login API fails on Vercel, the first things to verify are:

1. `DATABASE_URL` is present.
2. `JWT_SECRET` is present.
3. The deployed database already contains the `User` table and at least one admin user.
