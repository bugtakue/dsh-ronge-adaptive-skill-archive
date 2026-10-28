# Contributing

Thanks for trying Skill Studio.

## Development

```bash
npm run check
npm test
node --check index.js
node --check client.js
```

No build step, no dependencies. The Host half uses only Node built-ins; the Client half is a plain-JS module loaded through `window.__ModuleLoader__.load`.

## Pull requests

- Keep the client bundle free of external imports (React only).
- Run `npm run check` before committing: the client factory id must equal the package name.
- Add a test for pure logic changes (recommendations, language detection, experience stats).
- Keep the panel usable in light and dark themes; use theme tokens, not hard-coded surface colors.

## Reporting

Open an issue with the DSH version, the panel screenshot, and the relevant `~/.dsh/skill-studio/experience.md` excerpt (redact anything private).
