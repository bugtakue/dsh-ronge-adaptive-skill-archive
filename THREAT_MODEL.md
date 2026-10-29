# Threat model

## Assets

1. Local skill directories (`~/.dsh/skills`, `~/.claude/skills`, agent-specific dirs).
2. Plugin data (`~/.dsh/dsh-ronge-adaptive-skill-archive/`): experience, evolution,
   locks, backups, composition/benchmark data.
3. The DSH agent's context and tool access.
4. The user's machine and credentials reachable by tools the agent calls.

## Trust boundaries

- **Remote SKILL.md — untrusted.** Only exact `raw.githubusercontent.com` URLs are
  fetched. Redirects are rejected, content is size/time limited, scanned, and the
  first install writes only `SKILL.md` (not referenced assets/scripts).
- **Browser / loopback HTTP — semi-trusted.** Routes bind to the DSH local server;
  mutating routes reject explicit cross-site `Origin` / `Sec-Fetch-Site`. A local
  process on the same machine is outside this boundary.
- **Agent model — untrusted for security decisions.** The model can call read-only
  planning/search tools. It cannot call install, force, or write via the plugin's
  DSH tools. Installation/creation require an explicit user action in the panel or
  an MCP tool call outside the model's plugin toolset.
- **User — trusted.** A user who explicitly enables the manual high-risk override
  (`DSH_RONGE_ALLOW_FORCE=1` + a reason header) accepts the risk; the action is
  recorded.

## Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| SSRF via remote URL | strict host/scheme/path allowlist, no query/fragment, no redirects, DNS is GitHub's, size/time caps |
| Path traversal / symlink escape | kebab-case names, `realpath` containment, target dirs constrained, atomic temp files in the target dir |
| Overwriting an existing skill | unique-name suffix + frontmatter rename; never `flag:'w'` on an existing skill |
| Crash leaves half-written file | temp file + fsync + rename; source/lock written atomically |
| Concurrent install/update | per-URL/per-name in-memory locks; unique-name retry loop |
| High-risk install via model | no `force` in MCP schema; DSH tools are plan/search/draft only; Host override requires env + reason |
| Malicious skill instructions | local heuristic scan + preview; no automatic execution; user confirmation |
| Cross-site POST / CSRF | origin/site checks, JSON content type, loopback-only service, rate limits |
| Secret exfiltration via logs/data | audit log records actions/hashes, never full SKILL.md or credentials; no telemetry |
| Unbounded backup growth | per-skill retention cap (10 files) and atomic backups |

## Residual risks

- Regex security scanning can be bypassed by novel obfuscation; it is not a sandbox.
- `raw.githubusercontent.com` content is outside our control; a malicious repository
  can publish a plausible but harmful skill.
- Local same-user malware can read/write the same files regardless of this plugin.
- A user-approved skill can still instruct the agent to run risky commands.
- The 6,399 index is metadata from public repositories; its quality signals are
  heuristic and can be wrong.
