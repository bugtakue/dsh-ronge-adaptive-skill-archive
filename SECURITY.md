# Security policy

## Supported versions

Security fixes are released on the latest `5.x` line. The pre-rename package
(`ronge-adaptive-skill-archive`) is deprecated and not supported for new installs.

## Reporting

Please report a suspected vulnerability privately through GitHub Security
Advisories on `bugtakue/dsh-ronge-adaptive-skill-archive` (or open an issue with
the `security` label if private reporting is unavailable). Include:

- affected version / commit;
- exact endpoint, tool name or file path;
- a minimal reproduction, and whether the issue is local-only or remotely reachable.

Do not include real credentials or private skill files in a public report.

## Trust model in one paragraph

The plugin runs inside the user's own DSH process and reads/writes the user's
local skill directories and data directory. Remote `SKILL.md` files are treated
as untrusted text from `raw.githubusercontent.com` only. The plugin does not
execute remote code, does not install referenced scripts/assets automatically, and
blocks high-risk content by default. The local HTTP routes are loopback-only and
assume a single-user desktop; they are not a multi-tenant security boundary.
Prompt injection inside a skill can still influence the agent that loads it —
review skills before use and prefer the preview/safety scan.

## Security guarantees (and non-guarantees)

Guaranteed by design/tests:

- exact `https://raw.githubusercontent.com/**/SKILL.md` URL policy, HTTPS only,
  no redirects, 256 KiB cap, timeouts;
- scan before write; high-risk install/update blocked unless an explicit manual
  override is enabled on the Host;
- atomic writes and per-resource locks for skill installs/updates;
- names sanitized; existing skills never silently overwritten (unique suffix +
  frontmatter rename);
- MCP has no model-facing `force`; its scan tool accepts text only;
- no telemetry, no upload of task text, no network except user-triggered fetches.

Not guaranteed:

- the regex/heuristic scanner cannot prove a skill is safe;
- local processes or a compromised browser on the same machine are outside the
  trust boundary;
- a loaded skill can instruct the agent to do harmful things if the user approves
  that skill; the scanner is a warning layer, not a sandbox.

See `THREAT_MODEL.md` for assets, boundaries and residual risks.
