# 🐘 Prisma + Postgres Guide (Production)

This project uses **Prisma** for the database layer.

- **Local dev default**: SQLite (simple, zero setup)
- **Production recommendation**: Postgres (reliable, persistent)

> SQLite files can be ephemeral on many hosting platforms. If you want persistent production data, use Postgres.

---

## 1) Create a Postgres database

You can use:

- Railway Postgres
- Supabase Postgres (DB only)
- Neon
- Render Postgres
- Any hosted Postgres provider

Get your connection string in this shape:

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

---

## 2) Update `DATABASE_URL`

### Local (SQLite)

In `server/.env`:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

### Production (Postgres)

In Railway (or your production env vars):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

---

## 3) Run migrations

### Local development

When developing locally, you typically run:

```bash
cd server
npx prisma migrate dev
```

### Production

In production, use:

```bash
cd server
npx prisma migrate deploy
```

> `migrate deploy` applies already-created migrations. It does not generate new ones.

---

## 4) (Optional) Generate Prisma client

This usually happens automatically during install/build, but if needed:

```bash
cd server
npx prisma generate
```

---

## 5) Verify everything is working

- Start the backend
- Confirm `/health` returns OK
- Create an account and login
- Create a search
- Confirm data exists in Postgres

---

## 6) Common gotchas

### “My SQLite DB disappears after deployment”

That’s expected on many platforms. Switch to Postgres for production.

### “My migrations didn’t run”

Make sure your deploy process runs:

```bash
npx prisma migrate deploy
```

### “I changed the schema but prod didn’t update”

Production doesn’t create migrations automatically. You need to:

1. Create a new migration locally (`prisma migrate dev`)
2. Commit the migration folder
3. Deploy
4. Run `prisma migrate deploy` in prod

