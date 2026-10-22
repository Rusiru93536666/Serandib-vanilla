# Serandib Vanilla export site
Edit brand, contact details, products and specs in `src/config/site.ts`. Replace image placeholders with files in `public/images`.
Email delivery: set RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL in `.env.local`. Without them the form returns an honest "not sent" message.

## Blog administration

Use `/admin/blogs` after signing in through `/admin/login`. The dashboard supports drafts, publication, scheduled posts, private previews, duplicate/delete, SEO fields, image uploads, rich text, tables, galleries, charts, and YouTube embeds. Existing posts in `data/content.json` are kept and upgraded when read; changing a slug records the old slug and redirects it to the new one.

The project has no database or media service. Blog entries continue to use the existing `data/content.json` file, and uploaded JPEG/PNG/WebP images are written to `public/uploads` (5 MB maximum). Back up both locations. This is suitable for local development or a single self-hosted Node.js instance with a persistent writable disk. Scheduled posts become publicly visible only when their scheduled time has passed; public pages and the sitemap evaluate that condition on each request, so no cron service is required.

Do not deploy this file-and-disk storage unchanged to a serverless or multi-instance host: the filesystem may be ephemeral and writes are not shared across instances. For that deployment style, migrate the JSON store to managed PostgreSQL (for example, Supabase or Neon) and image uploads to an object-storage service (for example, S3-compatible storage or Cloudinary). That migration requires a persistence adapter and corresponding credentials such as `DATABASE_URL` and the chosen provider's bucket/region/access-key or Cloudinary cloud-name/API-key/API-secret settings; no such provider is currently configured or consumed by this project.

### Local setup (Windows PowerShell)

```powershell
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Set `ADMIN_PASSWORD` and `ADMIN_SECRET` in `.env.local` to strong, private values. `ADMIN_SECRET` must be at least 16 characters; generate one with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The sample file intentionally leaves admin credentials blank. Do not commit `.env.local`. No database migration is needed for the current JSON-backed setup.

Start development:

```powershell
npm run dev
```

Type-check and build for production:

```powershell
npm run lint
npm run build
npm run start
```

Production also needs a persistent writable disk for `data/content.json` and `public/uploads`, the existing `ADMIN_PASSWORD`/`ADMIN_SECRET` variables, and `NEXT_PUBLIC_SITE_URL` set to the canonical HTTPS site URL. Uploaded videos and arbitrary embed providers are not supported; only validated YouTube embeds are available.
