This project includes a GitHub-based file storage utility that replaces Supabase for simple JSON-backed persistence.

Files added:
- `lib/githubStorage.js` — core utility using `@octokit/rest` to read/modify JSON files in `data/`.
- `pages/api/appointments/index.js` — example list/create API route.
- `pages/api/appointments/[id].js` — example get/update/delete API route.
- `.env.example` — environment variables required.

Quick start
1. Add your GitHub token and repo info to `.env.local` (see `.env.example`).
2. Initialize `data/appointments.json` locally and commit, or let the API create it on first write.
3. Start Next.js dev server and exercise endpoints:

```bash
npm run dev
curl http://localhost:3000/api/appointments
curl -X POST http://localhost:3000/api/appointments -H "Content-Type: application/json" -d '{"title":"test"}'
```

Notes
- Keep `lib/githubStorage.js` server-side only. Do not import from client bundles.
- Monitor GitHub rate limits for heavy traffic.
- For high-throughput apps, use a proper DB instead of repository-backed JSON.
