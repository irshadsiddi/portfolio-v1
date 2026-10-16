# portfolio

Personal site — Next.js, TypeScript, Tailwind.

```sh
bun install
bun run dev
```

## Source layout

- `src/app/`: App Router pages, layouts, and the GitHub API route.
- `src/app/page.tsx`: imports and composes all homepage sections within the document shell.
- `src/components/home/`: homepage sections, command palette, footer, shared section UI, and interaction provider.
- `src/components/header.tsx`: primary desktop and mobile navigation.
- `src/hooks/`: homepage interactions and shared client GitHub fetching.
- `src/constants/`: authoritative portfolio content, navigation, and configuration.
- `src/lib/github/`: API client, contribution parser, pull request enrichment, date formatting, cache, and service

## Styling

Use standard Tailwind utilities directly for simple layout and spacing. Shared or complex styles live in `src/styles/` as Tailwind `@utility` recipes, composed with `@apply` and responsive/state `@variant` rules. The recipes are grouped by home sections, navigation, GitHub widgets, project previews, and the document shell.

`tokens.css` defines named Tailwind theme values for the existing typography, compact spacing, gradients, and motion. Use a standard scale value whenever it matches; retain a named token when rounding would change the design. `primitives.css` registers the few exact effects that composed utilities cannot reproduce, such as a shadow that must not combine with a focus ring.

## Live GitHub data

Set `GITHUB_TOKEN=your_personal_access_token` in `.env.local`, then restart the development server. For hosting, add `GITHUB_TOKEN` to the server environment and redeploy. `.env.local` is ignored by Git; `.env.example` documents the setting. The token stays on the server and is never sent to the browser.

The GitHub widgets refresh every minute while the page is visible and when you return to the tab. Requests share a one-minute server cache to limit API usage. Only public pull requests are included, even if the token can access private repositories. Contribution activity is fetched from the public GitHub contribution calendar.
