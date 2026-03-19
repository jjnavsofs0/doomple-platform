# Claude Rules for Doomple Platform

## Git & Deployment

- **NEVER push to GitHub without explicit user confirmation.** Always show the changes, run a local build first, and wait for the user to say "push it", "go ahead", or similar before running any `git push` command.
- Always run `next build` locally and confirm it passes before asking for push permission.
- Never use `--force` push unless explicitly asked.

## Workflow

- Run local build (`prisma generate && next build`) before any push to catch TypeScript/compile errors.
- Wait for user approval after showing build results before pushing.
