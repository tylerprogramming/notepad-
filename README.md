# notepad-

A tabbed notepad built with Vite, React, TypeScript and Tailwind. Files are
stored in Supabase; the settings dialog can save an email app password and an
OpenAI key for the AI and email features.

## Setup

```bash
npm install
```

`.env` holds the Supabase project URL and anon key (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`). The anon key is public by design.

The app signs into one shared Supabase account on start. Put that login in
`.env.local`, which git ignores:

```bash
VITE_NOTEPAD_EMAIL=you@example.com
VITE_NOTEPAD_PASSWORD=choose-a-new-password
```

Then run:

```bash
npm run dev
```

Without those two variables the app shows "Failed to initialize" and logs
`Missing VITE_NOTEPAD_EMAIL or VITE_NOTEPAD_PASSWORD`.

## Security notes

- Vite inlines every `VITE_*` variable into the built JavaScript. Anyone who
  can load a deployed build can read the shared login, so only deploy this
  privately, or replace the shared account with real per-user sign-in.
- Earlier commits hardcoded the shared account's password in
  `src/lib/supabase.ts`. That password is still in git history and must be
  treated as public: change it in Supabase (and anywhere else it was used).
- `user_settings` stores the email app password and OpenAI key in plain
  columns. Keep row level security on that table.
