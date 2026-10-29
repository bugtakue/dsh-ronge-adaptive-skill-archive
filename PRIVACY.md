# Privacy and data

- **No telemetry, no accounts, no analytics SDK.** The plugin does not upload task
  text, skill content, usage, or identifiers.
- **Network is user-triggered only.** It fetches `raw.githubusercontent.com` when
  you preview/install/update a remote skill, and GitHub repo metadata was fetched
  at build time for the bundled index. No background uploads.
- **Local data directory:** `${DSH_HOME:-~/.dsh}/dsh-ronge-adaptive-skill-archive/`
  contains `experience.json`, `evolution.json`, `rec-feedback.json`,
  `skills-lock.json`, `backups/`, and optional local audit logs. Legacy names are
  merged and kept.
- **MCP data directory:** `~/.ronge-adaptive-skill-cockpit/` for the cross-agent
  experience/lock state.
- **Skills directories:** installing a skill writes the selected `SKILL.md` into
  the target agent directory (DSH/Claude/Codex/etc.) as the user requested.
- **Deletion:** remove the data directory to delete local history; remove installed
  skills individually. No remote copy exists.
- **Audit logs** contain action, skill name, hash, timestamp and outcome; they never
  contain full skill text or credentials.
