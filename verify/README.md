# Verification scripts

These are development-time end-to-end checks. They never touch the user profile:
Host E2E uses a temporary HOME; UI E2E renders `client.js` in headless Chrome.

## Host E2E (macOS/Linux, network for raw.githubusercontent.com)

```bash
node verify/host-e2e.mjs
```

Starts a real loopback HTTP server around `index.js`, uses a temporary
`DSH_HOME`/`DSH_AGENTS_HOME`, and checks install/preview/update/rollback,
session/experience/evolution plus v5 `/version`, `/intelligence/plan` and
`/intelligence/draft`. Latest local run: **20/20 passed**.

## UI E2E (macOS, Chrome, React 18)

```bash
mkdir -p /tmp/uiverify && cd /tmp/uiverify
npm init -y >/dev/null && npm i react@18 react-dom@18 >/dev/null
cd -
node verify/ui-e2e.mjs
```

Optional env: `CHROME_PATH`, `REACT_DIR`. Latest local run: **27/27 passed**.
