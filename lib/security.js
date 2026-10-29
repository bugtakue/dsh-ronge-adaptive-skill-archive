/**
 * Local, heuristic SKILL.md safety scanner. Never executes content.
 * Shared by Host, MCP and the intelligence draft pipeline.
 */
export const RISK_RULES = [
  { id: 'shell-exec', label: 'shell 执行', severity: 'high', pattern: /\b(?:child_process|execSync|spawnSync|os\.system|subprocess\.(?:run|call|Popen))\b/i },
  { id: 'pipe-to-shell', label: '下载后直接执行', severity: 'high', pattern: /(?:curl|wget)[\s\S]{0,300}?\|\s*(?:sh|bash|zsh)\b/i },
  { id: 'dynamic-eval', label: '动态执行/解码', severity: 'high', pattern: /\b(?:(?:eval|new Function)\s*\(|base64\s+-d\b|atob\s*\()/i },
  {
    id: 'prompt-injection',
    label: '提示注入模式',
    severity: 'high',
    pattern: /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|rules|prompts)|system\s+prompt|jailbreak/i,
  },
  { id: 'network', label: '网络访问', severity: 'medium', pattern: /\b(?:curl|wget|https?:\/\/|fetch\s*\(|requests\.(?:get|post)|axios\b)/i },
  {
    id: 'credentials',
    label: '凭据/密钥访问',
    severity: 'medium',
    pattern: /(?:\.ssh\/|id_rsa|\.aws\/credentials|(?:^|[^.\w])\.env\b|keychain|\.netrc|\.npmrc|api[_-]?key|secret[_-]?key)/i,
  },
  { id: 'file-write', label: '文件系统写入/提权', severity: 'low', pattern: /\b(?:rm\s+-rf|sudo\s+|chmod\s+\+?x|\bwriteFileSync\b|\bwriteFile\b)/i },
  { id: 'destructive', label: '破坏性命令', severity: 'high', pattern: /\b(?:rm\s+-rf\s+\/(?:\s|$)|mkfs\.|dd\s+if=\/dev\/zero|:(){ :\|:& };:)/i },
  { id: 'obfuscation', label: '混淆载荷', severity: 'high', pattern: /(?:[A-Za-z0-9+/]{120,}={0,2}|(?:\\x[0-9a-f]{2}){8,}|String\.fromCharCode\s*\()/i },
  { id: 'destructive-absolute', label: '绝对路径递归删除', severity: 'medium', pattern: /\brm\s+-rf\s+\/(?!\s|$)[A-Za-z0-9._-]+/i },
  { id: 'global-install', label: '全局安装/系统修改', severity: 'medium', pattern: /\b(?:npm\s+(?:i|install)\s+-g|pip\s+install\s+(?:--user\s+)?(?:-e\s+)?\.(?:\s|$)|gem\s+install|brew\s+install)\b/i },
  { id: 'exfil', label: '疑似数据外传', severity: 'medium', pattern: /\b(?:webhook\.site|discord(?:app)?\.com\/api\/webhooks|pastebin\.com|transfer\.sh|0x0\.st)\b/i },
]

export const RISK_WEIGHT = { high: 40, medium: 15, low: 5 }

function parseFrontmatterLite(text) {
  const match = String(text || '').match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const out = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (pair) out[pair[1]] = pair[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}

export function normalizeSkillText(text) {
  return String(text || '').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '')
}

export function scanSkillText(text) {
  const source = normalizeSkillText(text)
  const lines = source.split(/\r?\n/)
  const findings = []
  for (const rule of RISK_RULES) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!line) continue
      if (!rule.pattern.test(line)) continue
      findings.push({ rule: rule.id, label: rule.label, severity: rule.severity, line: index + 1, excerpt: line.trim().slice(0, 120) })
      break
    }
  }
  const frontmatter = parseFrontmatterLite(text)
  const allowedTools = String(frontmatter['allowed-tools'] || '')
  if (allowedTools && (allowedTools.includes('*') || /(?:^|[\s,])(?:Bash|shell|bash)(?:[\s,]|$)/.test(allowedTools))) {
    findings.push({ rule: 'broad-tools', label: 'allowed-tools 过宽', severity: 'medium', line: 1, excerpt: ('allowed-tools: ' + allowedTools).slice(0, 120) })
  }
  const score = findings.reduce((total, finding) => total + (RISK_WEIGHT[finding.severity] || 0), 0)
  const level = findings.some((finding) => finding.severity === 'high') ? 'high' : score >= RISK_WEIGHT.medium ? 'medium' : 'low'
  return { level, score, findings: findings.slice(0, 8) }
}
