# Dutch trainer: data tools

Build-time scripts that turn large public datasets into small JSON files for the app.
**Nothing here is shipped in the app.** The app only loads what these tools write to
`dutch-app/public/data/`.

```
dutch/
  data-raw/     downloaded sources (large, not in git, safe to delete after a build)
  tools/        these scripts (no dependencies: Node ≥ 22.18 runs the TypeScript directly)
  dutch-app/
    public/data/              generated output the app loads (small, committed)
    src/app/data/format.ts    the data contract the tools must produce
```

## Commands

Run from this folder:

| Command | What it does |
|---|---|
| `npm run download` | Downloads all sources into `../data-raw/` (skips ones already there) |
| `npm run download -- tatoeba-nld-eng` | Downloads one source |
| `npm test` | Runs the tool tests (Node's built-in test runner) |

Sources, sizes, licences and required credits are listed in `src/sources.ts`.

## Notes

- The tools run without installing anything. Type-checking them would need `@types/node`,
  which is not installed yet.
