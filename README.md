# Daniel Temesgen | Portfolio & Admin CMS

A database-driven personal portfolio for **Daniel Temesgen, Full-Stack Software Developer**, with a built-in admin dashboard. Almost everything visitors see (profile, projects, blog, skills, links, CV, images) is edited from the admin, so ordinary content changes never need a code change.

**Live site:** https://daniel-temesgen.netlify.app/

---

## Table of contents

1. [Features](#features)
2. [Technology stack](#technology-stack)
3. [Architecture](#architecture)
4. [Zero-cost services](#zero-cost-services)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [Service setup](#service-setup)
8. [Using the admin](#using-the-admin)
9. [Scripts](#scripts)
10. [Deploying to Netlify](#deploying-to-netlify)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)
13. [Roadmap](#roadmap)

---

## Features

### Public website

- Home, About, Projects, Blog (with individual posts) and Contact pages
- Project filters by category, blog categories and tags
- Downloadable CV, shown only while a CV is published
- Light and dark themes, responsive layouts from small phones to large screens
- Smooth animations that respect the `prefers-reduced-motion` setting
- Built-in fallback content, so the site still renders if the database is unreachable

### Admin dashboard

- Dashboard with counts, CV status and the most recent messages, projects and posts
- **Messages:** read, mark read or unread, archive, search and delete
- **Projects and Blog:** create, edit, delete, publish or hide, feature, reorder, categories, tags and cover images
- **Branding:** logos, symbol, profile photo and favicon
- **CV:** upload a PDF, publish one current version, unpublish or delete
- **Profile:** name, title, introduction, bio, journey story, goals, philosophy and interests
- **Skills, Education, Timeline, Links, Categories and Settings** (site title, description, home page technology list, footer text)
- Mobile-friendly menu so the whole admin works from a phone

### Contact system

- Validated contact form saved to the database first, then:
  - an email notification to the owner with a link to the message in the admin
  - an automatic, professionally formatted reply to the visitor
  - a Telegram notification
- If one notification service fails, the message is still safely stored and the other notifications still run

### SEO and performance

- Per-page titles and descriptions, canonical addresses, Open Graph and Twitter share previews
- `sitemap.xml` (includes published blog posts), `robots.txt` and Person structured data (JSON-LD)
- Public pages are cached and refreshed at most once a minute, and instantly after you save in the admin
- Cloudinary delivers resized, modern-format images (`f_auto`, `q_auto`)
- Self-hosted fonts through `next/font`

---

## Technology stack

| Area                   | Technology                                                  |
| ---------------------- | ----------------------------------------------------------- |
| Framework              | Next.js 16 (App Router, Server Components, Server Actions)  |
| UI                     | React 19, Tailwind CSS 4                                    |
| Language               | JavaScript                                                  |
| Database               | Neon (serverless PostgreSQL) via `@neondatabase/serverless` |
| Image and file storage | Cloudinary                                                  |
| Email                  | Nodemailer with Gmail SMTP                                  |
| Notifications          | Telegram Bot API                                            |
| Hosting                | Netlify                                                     |

---

## Architecture

```text
Visitor ──► Public pages (Server Components, cached 60 s) ──► src/lib/content.js ──► Neon
                                                                  │
                                                                  └─ built-in fallback content if Neon is unreachable

Contact form ──► /api/contact ──► save to Neon ──► email owner ─┐
                                                   auto-reply ───┼─► each step can fail without losing the message
                                                   Telegram ─────┘

Admin ──► Server Actions ──► requireAdmin() ──► Neon
Browser ──► signed upload permit ──► Cloudinary ──► server verifies the file with Cloudinary ──► saved in Neon
```

### Folder structure

```text
daniel-portfolio-revised/
└── web/
    ├── db/                  SQL: schema.sql (messages) and 002_cms_schema.sql (CMS tables)
    ├── scripts/             Setup helpers (database, seed, admin account, Telegram)
    ├── public/              Static files and fallback images
    └── src/
        ├── app/
        │   ├── (public)/    Home, about, projects, blog, contact
        │   ├── admin/       Login and the protected admin panel
        │   ├── api/contact/ Contact form endpoint
        │   ├── sitemap.js, robots.js, layout.js
        ├── components/      Public components, and admin/ for admin forms
        ├── lib/             content, auth, db, email, telegram, cloudinary, seo, validation
        └── data/            Built-in fallback content
```

### Key design decisions

- **Content comes from the database.** `src/lib/content.js` is the single place where public pages read content. It returns built-in fallback content if the database is down, and shares one answer per page visit so the same data is never requested twice.
- **Server Actions for the admin.** Every admin page and action calls `requireAdmin()` itself, so protection never depends on a single layout.
- **Direct-to-Cloudinary uploads.** Files never pass through the site's server. The server hands out a short-lived signed permit, then confirms the file with Cloudinary's own data before saving it.
- **Message first.** A contact message is saved before any notification is attempted.

---

## Zero-cost services

The project is designed to run on free tiers. Free tiers change, so check each provider's current limits before relying on them.

| Service    | Purpose               | Free? | Things to know                                                                                                        |
| ---------- | --------------------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Netlify    | Hosting               | Yes   | The free plan is credit-based and every production deploy uses credits, so batch your changes and deploy deliberately |
| Neon       | PostgreSQL database   | Yes   | The free database sleeps when idle, so the first request after a quiet period can be slower                           |
| Cloudinary | Images and the CV PDF | Yes   | Free storage and bandwidth quotas apply                                                                               |
| Gmail SMTP | Email                 | Yes   | Requires an App Password. Sending limits apply                                                                        |
| Telegram   | Notifications         | Yes   | Free Bot API                                                                                                          |

---

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A free account at Neon, Cloudinary and Telegram, and a Gmail account (see [Service setup](#service-setup))

### 1. Install

```bash
git clone <your-repository-url>
cd daniel-portfolio-revised/web
npm install
```

### 2. Configure environment variables

Copy the example file and fill in the values (see the [table below](#environment-variables)):

```bash
cp .env.example .env.local
```

On Windows PowerShell, use `copy .env.example .env.local`.

### 3. Set up the database

Run these once, in this order, from the `web` folder:

```bash
node --env-file=.env.local scripts/setup-db.mjs                    # creates the messages table
node --env-file=.env.local scripts/migrate.mjs 002_cms_schema.sql  # creates the CMS tables
node --env-file=.env.local scripts/seed.mjs                        # adds the starter content
node --env-file=.env.local scripts/create-admin.mjs                # creates the admin account
```

`migrate.mjs` and `seed.mjs` are safe to run again. The seed script never creates duplicates and never overwrites content you edited in the admin. Running `create-admin.mjs` with an existing email changes that account's password.

### 4. Run the site

```bash
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin (you will be redirected to the login page)

### 5. Production build (optional check)

```bash
npm run build
npm start
```

---

## Environment variables

Never commit `.env.local`. It is already ignored by Git.

| Variable                | Required | Description                                                                                                                                   |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Yes      | Neon connection string. Use the pooled one (it has `-pooler` in the host name)                                                                |
| `IP_HASH_SALT`          | Yes      | Random secret used to hash visitor IP addresses. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SITE_URL`              | Yes      | The public address of the site, for example `https://daniel-temesgen.netlify.app`. Used in emails, the sitemap and canonical addresses        |
| `EMAIL_HOST`            | Yes      | SMTP server, `smtp.gmail.com` for Gmail                                                                                                       |
| `EMAIL_PORT`            | Yes      | `465` for Gmail                                                                                                                               |
| `EMAIL_USER`            | Yes      | The sending email address                                                                                                                     |
| `EMAIL_PASSWORD`        | Yes      | A Gmail **App Password** (not your normal password)                                                                                           |
| `EMAIL_TO`              | Yes      | The address that receives contact notifications                                                                                               |
| `TELEGRAM_BOT_TOKEN`    | Yes      | Token from BotFather                                                                                                                          |
| `TELEGRAM_CHAT_ID`      | Yes      | The chat that receives notifications                                                                                                          |
| `CLOUDINARY_CLOUD_NAME` | Yes      | From the Cloudinary dashboard                                                                                                                 |
| `CLOUDINARY_API_KEY`    | Yes      | From the Cloudinary dashboard                                                                                                                 |
| `CLOUDINARY_API_SECRET` | Yes      | From the Cloudinary dashboard. Server only, never exposed to the browser                                                                      |

If the Cloudinary values are missing, the site still runs. Only image and CV uploads in the admin show a clear "not set up" message.

---

## Service setup

### Neon (database)

1. Create a free project at https://console.neon.tech.
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Choose a region close to where your Netlify functions run. Netlify's default functions region is US East (Ohio), so a nearby Neon region keeps database requests fast on the live site.

### Gmail (email)

1. Turn on 2-Step Verification for your Google account.
2. Create an **App Password** (Google Account → Security → App passwords).
3. Put the Gmail address in `EMAIL_USER` and the 16-character App Password in `EMAIL_PASSWORD`.
4. Set `EMAIL_TO` to the address that should receive messages.

### Telegram (notifications)

1. In Telegram, talk to **@BotFather**, create a bot and copy the token into `TELEGRAM_BOT_TOKEN`.
2. Open a chat with your new bot and send it any message.
3. Find your chat id:

```bash
   node --env-file=.env.local scripts/telegram-chat-id.mjs
```

4. Put the printed id in `TELEGRAM_CHAT_ID`.

### Cloudinary (images and CV)

1. Create a free account at https://cloudinary.com and copy the cloud name, API key and API secret.
2. Open **Settings → Security** and enable **PDF and ZIP files delivery**. Without this, visitors cannot download the CV.

---

## Using the admin

| Section                         | What you can do                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| **Dashboard**                   | See totals, unread messages and recent activity                                           |
| **Messages**                    | Read, mark read or unread, archive, search and delete visitor messages                    |
| **Projects**                    | Create and edit projects, set a cover image, publish or hide, feature, reorder            |
| **Blog**                        | Write posts, set categories, tags, SEO fields and a cover image, save as draft or publish |
| **Branding**                    | Upload logos, symbol, profile photo and favicon                                           |
| **CV**                          | Upload a PDF and publish it as the current CV                                             |
| **Profile**                     | Edit your name, title, introduction, bio, journey, goals, philosophy and interests        |
| **Skills, Education, Timeline** | Add, edit, reorder and delete entries                                                     |
| **Links**                       | Manage email, phone and social links (only `https://`, `mailto:` and `tel:` are accepted) |
| **Categories**                  | Manage project and blog categories                                                        |
| **Settings**                    | Site title and description, home page technology list, footer text                        |

Changes appear on the public site immediately after you save.

---

## Scripts

### npm scripts

| Command         | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build        |
| `npm start`     | Run the production build locally |
| `npm run lint`  | Check the code with ESLint       |

### Helper scripts (run from `web`)

| Command                                                     | Purpose                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `node --env-file=.env.local scripts/setup-db.mjs`           | Create the base table                                            |
| `node --env-file=.env.local scripts/migrate.mjs <file.sql>` | Apply a SQL file from `db/`                                      |
| `node --env-file=.env.local scripts/seed.mjs`               | Add starter content (safe to repeat)                             |
| `node --env-file=.env.local scripts/create-admin.mjs`       | Create the admin account or reset its password                   |
| `node --env-file=.env.local scripts/telegram-chat-id.mjs`   | Find your Telegram chat id                                       |
| `node --env-file=.env.local scripts/check-messages.mjs`     | Show the latest messages and whether each notification succeeded |

---

## Deploying to Netlify

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Set the **Base directory** to `web`. Netlify detects Next.js automatically. No `netlify.toml` file is needed.
4. Open **Site configuration → Environment variables** and add every variable from the [table above](#environment-variables). Set `SITE_URL` to your live address.
5. Under **Site configuration → Build & deploy → Functions**, check the functions region matches your Neon region (the default is US East, Ohio).
6. Deploy.

Because the free plan is credit-based, work on a separate branch, test locally with `npm run build`, and deploy once when a batch of changes is ready.

### After deploying, check

- [ ] Public pages load and the contact form works
- [ ] Admin login works over HTTPS
- [ ] Uploading an image and a CV works
- [ ] The Download CV button downloads the PDF
- [ ] `/sitemap.xml` and `/robots.txt` show your live address
- [ ] The test message reached your email and Telegram

---

## Security

- **Passwords** are hashed with scrypt, never stored in plain text.
- **Sessions** use a random token. Only a hash of it is stored in the database. The cookie is `httpOnly`, `SameSite=Lax` and, in production, uses the `__Host-` prefix and `Secure`.
- **Login protection:** after 5 failed attempts from one visitor within 15 minutes, further attempts are blocked.
- **Every admin page and Server Action** checks the session itself. Access never depends on one shared layout.
- **Server-side validation** for all input. Browser checks are only a convenience.
- **Uploads** use short-lived signed permits. The server checks the file type and size with data from Cloudinary itself, not from the browser.
- **Links** edited in the admin must start with `https://`, `mailto:` or `tel:`, which blocks `javascript:` links.
- **Contact form protection:** same-site origin check, request size limit, a hidden honeypot field, and at most 3 messages per visitor per hour. Visitor IP addresses are never stored, only a salted hash.
- **Output safety:** React escapes page text, email HTML is escaped, and structured data is escaped so database text can never break out of its script tag.
- **Secrets** live only in environment variables. The Telegram token and Cloudinary secret never reach the browser.
- **Search engines:** admin pages are marked `noindex`, and `robots.txt` disallows `/admin` and `/api`.

---

## Troubleshooting

| Problem                                                                       | Likely cause and fix                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site shows the built-in content instead of my edits                           | The database could not be reached. Check `DATABASE_URL` and the server logs                                                                                                                                                         |
| First page load is slow, or `UND_ERR_CONNECT_TIMEOUT` appears in the terminal | A network stall to Neon, or the free database waking from sleep. The code retries automatically. Distance matters, so the live site on Netlify US East (Ohio) with a nearby Neon region is much faster than a distant local machine |
| Cannot log in                                                                 | Re-create or reset the account with `scripts/create-admin.mjs`. After 5 failed attempts, wait 15 minutes                                                                                                                            |
| Upload says storage is not set up                                             | The three `CLOUDINARY_*` variables are missing in `.env.local` or Netlify                                                                                                                                                           |
| CV download shows an access error                                             | Enable **PDF and ZIP files delivery** in Cloudinary under Settings → Security                                                                                                                                                       |
| Contact emails are not sent                                                   | Use a Gmail App Password, not your normal password, and check `EMAIL_USER`, `EMAIL_PASSWORD` and `EMAIL_TO`                                                                                                                         |
| No Telegram notification                                                      | Send a message to your bot first, then run `scripts/telegram-chat-id.mjs` and check `TELEGRAM_CHAT_ID`                                                                                                                              |
| Did a contact message arrive?                                                 | Run `scripts/check-messages.mjs` to see the latest messages and which notifications succeeded                                                                                                                                       |
| Cannot find a change I saved                                                  | Public pages refresh when you save. Reload the page, or wait up to one minute                                                                                                                                                       |
| Changes to `next.config.mjs` do not apply                                     | Stop and restart `npm run dev`                                                                                                                                                                                                      |

---

## Roadmap

The structure leaves room to add, without redesigning anything:

- Extra project gallery images (the database table already exists)
- Testimonials and services sections
- Newsletter and analytics
- Multi-language support

---

## License

© 2026 Daniel Temesgen. All rights reserved.
