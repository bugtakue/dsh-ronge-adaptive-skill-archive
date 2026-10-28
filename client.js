window.__ModuleLoader__.load({
  id: 'ronge-adaptive-skill-archive',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const store = {
      open: false,
      sessionId: null,
      listeners: new Set(),
      set(patch) {
        Object.assign(this, patch)
        for (const listener of this.listeners) listener()
      },
      subscribe(listener) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
      },
    }

    let localeCtx = null

    const dictZh = {
      trigger: '卷轴馆',
      open: '打开技能工厂',
      title: '荣哥技能卷轴收藏馆（可沉浸式体验版本）',
      subtitle: '可沉浸式体验 · 上下文感知 · 自进化推荐 · 正在使用 · 一键新建',
      recommend: '推荐',
      recommendHint: '根据当前会话内容',
      basedOn: '基于：',
      noRecommend: '暂无推荐，先聊几句或点刷新',
      activeNow: '正在使用',
      recentUsed: '最近使用',
      mode: '模式',
      planMode: '计划模式',
      immersiveMode: '沉浸模式',
      planHint: '会先问你确认再执行',
      immersiveHint: '不询问，自动执行',
      experience: '经验',
      lastTask: '上次：',
      lastOutcome: '结果：',
      good: '好用',
      bad: '不好用',
      memory: '记忆文件',
      modeBusy: '切换中…',
      tabSkills: '技能',
      tabDiscover: '发现',
      tabTools: '工具',
      tabLibrary: '卷轴馆',
      libraryTitle: '荣哥技能卷轴收藏馆（可沉浸式体验版本）',
      libraryHint: '全 GitHub 公开 SKILL.md 索引，按分类和评级浏览',
      all: '全部',
      loadMore: '加载更多',
      noLibrary: '没有匹配的卷轴',
      ratingLabel: '评级',
      discoverTitle: '发现远程技能',
      toolsTitle: 'MCP / Tools 目录',
      searchBtn: '搜索',
      searchRemote: '搜索远程技能…',
      searchTools: '搜索 MCP 服务器…',
      refreshIndex: '刷新索引',
      checkUpdates: '检查更新',
      install: '安装',
      installing: '安装中…',
      installed: '已安装',
      preview: '预览',
      noRemote: '没有远程结果',
      noTools: '没有 MCP 结果',
      remoteHint: '来自精选 GitHub 源；只拉取 SKILL.md',
      toolsHint: '来自 MCP 官方 registry；工具不是 skill',
      updatesFound: '个更新',
      noUpdates: '暂无更新',
      source: '来源',
      versionLabel: '版本',
      repoLabel: '仓库',
      search: '搜索技能、描述、用途…',
      refresh: '刷新',
      close: '关闭',
      loading: '正在读取技能目录…',
      error: '读取失败',
      retry: '重试',
      empty: '没有匹配的技能',
      count: '个技能',
      sourceUser: '用户',
      sourceBundled: '内置',
      sourceProject: '项目',
      sourceProfile: '配置',
      sourceOther: '其他',
      whenLabel: '何时用',
      copy: '复制名称',
      copied: '已复制',
      path: '路径',
      flags: '调用',
      modelOnly: '模型可调用',
      userOnly: '用户可调用',
      create: '新建技能',
      createHint: '创建到本机 ~/.dsh/skills，下一次会话自动可见。',
      name: '名称（kebab-case）',
      namePlaceholder: 'my-new-skill',
      description: '描述（必填）',
      descriptionPlaceholder: '一句话说明这个技能做什么。',
      whenToUse: '何时用（可选）',
      whenToUsePlaceholder: '用户说什么话、做什么任务时应该用它。',
      createBtn: '创建',
      creating: '创建中…',
      cancel: '取消',
      created: '已创建：',
      createFailed: '创建失败',
      scopeSession: '当前会话目录',
      scopeScan: '本地扫描 + 内置',
      scopeGlobal: '全局目录',
      generated: '更新于',
      suggest: '建议',
      copySkill: '复制 /skill',
      security: '安全',
      secLow: '低风险',
      secMedium: '中风险',
      secHigh: '高风险',
      trust: '信任',
      trustOfficial: '官方',
      trustVerified: '已验证',
      trustCommunity: '社区',
      trustLocal: '本地',
      trustUnknown: '未知',
      license: '许可',
      findings: '检查项',
      update: '更新',
      updating: '更新中…',
      updateAll: '全部更新',
      rollback: '回滚',
      updateOk: '已更新：',
      rollbackOk: '已回滚：',
      actionFailed: '操作失败',
      experienceHealth: '技能健康',
      evolution: '自进化',
      evolutionHint: '按反馈自动微调推荐权重 · 本地 · 可回滚',
      evolutionWeights: '当前权重',
      evolutionRate: '反馈成功率',
      evolutionObs: '待评估反馈',
      evolutionHistory: '最近调整',
      evolutionNone: '还没有自动调整（攒够 10 条反馈后自动评估）',
      weightToken: '关键词',
      weightName: '名称',
      weightCategory: '类别',
      weightExperience: '经验',
      evaluateEvolution: '立即评估',
      rollbackEvolution: '回滚',
      resetEvolution: '重置',
      evolutionBusy: '评估中…',
      evolutionDone: '已评估',
      evolutionRolledBack: '已回滚上一次调整',
      evolutionReset: '权重已重置',
      noEvolution: '暂无自进化数据',
      panelError: '这个面板出错了，但不会影响会话。可以重试或先关闭。',
      healthStale: '陈旧',
      healthFailing: '连续失败',
      healthNeverUsed: '从未使用',
      healthLicenseUnknown: '许可未知',
      exportExperience: '导出经验',
      exportBusy: '导出中…',
      importExperience: '导入经验',
      importBusy: '导入中…',
      importPrompt: '粘贴经验 JSON：',
      importOk: '已导入经验',
      exportOk: '已导出经验 JSON',
      importInvalid: 'JSON 解析失败',
      usesLabel: '次数',
      successRate: '成功率',
      avgDuration: '平均耗时',
    }

    const dictEn = {
      trigger: 'Scrolls',
      open: 'Open Skill Factory',
      title: "Ronge's Adaptive Skill Cockpit (Immersive Edition)",
      subtitle: 'Adaptive · self-evolving recommendations · context-aware · active skills · one-click create',
      recommend: 'Recommended',
      recommendHint: 'From the current session',
      basedOn: 'Based on: ',
      noRecommend: 'No recommendation yet — chat a little, then refresh',
      activeNow: 'In use',
      recentUsed: 'Recently used',
      mode: 'Mode',
      planMode: 'Plan',
      immersiveMode: 'Immersive',
      planHint: 'Asks for confirmation first',
      immersiveHint: 'No ask, auto-execute',
      experience: 'Experience',
      lastTask: 'Last: ',
      lastOutcome: 'Outcome: ',
      good: 'Good',
      bad: 'Bad',
      memory: 'Memory file',
      modeBusy: 'Switching…',
      tabSkills: 'Skills',
      tabDiscover: 'Discover',
      tabTools: 'Tools',
      tabLibrary: 'Scrolls',
      libraryTitle: "Ronge's Adaptive Skill Cockpit (Immersive Edition)",
      libraryHint: 'Index of public GitHub SKILL.md files, by category and rating',
      all: 'All',
      loadMore: 'Load more',
      noLibrary: 'No matching scrolls',
      ratingLabel: 'Rating',
      discoverTitle: 'Discover remote skills',
      toolsTitle: 'MCP / Tools directory',
      searchBtn: 'Search',
      searchRemote: 'Search remote skills…',
      searchTools: 'Search MCP servers…',
      refreshIndex: 'Refresh index',
      checkUpdates: 'Check updates',
      install: 'Install',
      installing: 'Installing…',
      installed: 'Installed',
      preview: 'Preview',
      noRemote: 'No remote results',
      noTools: 'No MCP results',
      remoteHint: 'From curated GitHub sources; SKILL.md only',
      toolsHint: 'From the official MCP registry; tools are not skills',
      updatesFound: 'updates',
      noUpdates: 'Up to date',
      source: 'Source',
      versionLabel: 'Version',
      repoLabel: 'Repo',
      search: 'Search skills, descriptions, usage…',
      refresh: 'Refresh',
      close: 'Close',
      loading: 'Reading the skill catalog…',
      error: 'Failed to load',
      retry: 'Retry',
      empty: 'No matching skills',
      count: 'skills',
      sourceUser: 'User',
      sourceBundled: 'Bundled',
      sourceProject: 'Project',
      sourceProfile: 'Profile',
      sourceOther: 'Other',
      whenLabel: 'When to use',
      copy: 'Copy name',
      copied: 'Copied',
      path: 'Path',
      flags: 'Invocation',
      modelOnly: 'Model-invocable',
      userOnly: 'User-invocable',
      create: 'New skill',
      createHint: 'Created under ~/.dsh/skills; visible to the next session.',
      name: 'Name (kebab-case)',
      namePlaceholder: 'my-new-skill',
      description: 'Description (required)',
      descriptionPlaceholder: 'One sentence about what this skill does.',
      whenToUse: 'When to use (optional)',
      whenToUsePlaceholder: 'What the user says or does when this skill should apply.',
      createBtn: 'Create',
      creating: 'Creating…',
      cancel: 'Cancel',
      created: 'Created: ',
      createFailed: 'Create failed',
      scopeSession: 'Session catalog',
      scopeScan: 'Local scan + bundled',
      scopeGlobal: 'Global catalog',
      generated: 'Updated',
      suggest: 'Suggested',
      copySkill: 'Copy /skill',
      security: 'Security',
      secLow: 'Low risk',
      secMedium: 'Medium risk',
      secHigh: 'High risk',
      trust: 'Trust',
      trustOfficial: 'Official',
      trustVerified: 'Verified',
      trustCommunity: 'Community',
      trustLocal: 'Local',
      trustUnknown: 'Unknown',
      license: 'License',
      findings: 'Findings',
      update: 'Update',
      updating: 'Updating…',
      updateAll: 'Update all',
      rollback: 'Roll back',
      updateOk: 'Updated: ',
      rollbackOk: 'Rolled back: ',
      actionFailed: 'Action failed',
      experienceHealth: 'Skill health',
      evolution: 'Self-evolution',
      evolutionHint: 'Auto-tunes recommendation weights from feedback · local · rollback-able',
      evolutionWeights: 'Weights',
      evolutionRate: 'Feedback success',
      evolutionObs: 'Pending feedback',
      evolutionHistory: 'Recent changes',
      evolutionNone: 'No auto-change yet (evaluates after 10 feedback signals)',
      weightToken: 'Keyword',
      weightName: 'Name',
      weightCategory: 'Category',
      weightExperience: 'Experience',
      evaluateEvolution: 'Evaluate now',
      rollbackEvolution: 'Roll back',
      resetEvolution: 'Reset',
      evolutionBusy: 'Evaluating…',
      evolutionDone: 'Evaluated',
      evolutionRolledBack: 'Rolled back the last change',
      evolutionReset: 'Weights reset',
      noEvolution: 'No self-evolution data yet',
      panelError: 'This panel hit an error (your session is unaffected). Retry or close it.',
      healthStale: 'Stale',
      healthFailing: 'Failing',
      healthNeverUsed: 'Never used',
      healthLicenseUnknown: 'License unknown',
      exportExperience: 'Export experience',
      exportBusy: 'Exporting…',
      importExperience: 'Import experience',
      importBusy: 'Importing…',
      importPrompt: 'Paste the experience JSON:',
      importOk: 'Experience imported',
      exportOk: 'Experience JSON exported',
      importInvalid: 'Invalid JSON',
      usesLabel: 'Uses',
      successRate: 'Success',
      avgDuration: 'Avg time',
    }

    function useStore() {
      const [, force] = React.useState(0)
      React.useEffect(() => store.subscribe(() => force((value) => value + 1)), [])
      return store
    }

    function useT() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        if (!localeCtx) return undefined
        return localeCtx.locale.subscribe(() => force((value) => value + 1))
      }, [])
      if (!localeCtx) return (key) => key
      return localeCtx.locale.bind('ronge-adaptive-skill-archive')
    }

    function IconSkills(props) {
      const size = props && props.size ? props.size : 16
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1.5 }),
        h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1.5 }),
        h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1.5 }),
        h('path', { d: 'M17.5 14v6M14.5 17h6' }),
      )
    }

    function IconRefresh() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: 14,
          height: 14,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M20 12a8 8 0 1 1-2.34-5.66' }),
        h('path', { d: 'M20 4v5h-5' }),
      )
    }

    function IconClose() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: 16,
          height: 16,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M6 6l12 12M18 6L6 18' }),
      )
    }

    function SkillButton(props) {
      const state = useStore()
      const t = useT()
      const incomingSessionId = props && props.sessionId ? props.sessionId : null
      React.useEffect(() => {
        if (incomingSessionId && incomingSessionId !== store.sessionId) {
          store.set({ sessionId: incomingSessionId })
        }
      }, [incomingSessionId])

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'button',
          {
            type: 'button',
            className: state.open ? 'sf-trigger sf-trigger-open' : 'sf-trigger',
            title: t('open'),
            'aria-label': t('open'),
            onClick: () => store.set({ open: true, sessionId: props.sessionId || store.sessionId }),
          },
          h(IconSkills, { size: 15 }),
          h('span', { className: 'sf-trigger-label' }, t('trigger')),
        ),
      )
    }

    function sourceLabel(t, source) {
      if (source === 'user-dsh' || source === 'user-agents') return t('sourceUser')
      if (source === 'bundled') return t('sourceBundled')
      if (source === 'project-dsh' || source === 'project-agents') return t('sourceProject')
      if (source === 'profile') return t('sourceProfile')
      return t('sourceOther')
    }

    function categoryOf(name) {
      if (/^office/.test(name)) return 'office'
      if (/^(hyperframes|beat-promo|media-use)/.test(name)) return 'video'
      if (/^cordis|^editing-cordis/.test(name) || name === 'agent-experience') return 'harness'
      return 'other'
    }

    function writeClipboardText(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(String(text)).catch(() => {})
        }
      } catch {
        // Clipboard is optional in non-secure contexts.
      }
    }

    function trustBadge(t, trust) {
      const value = typeof trust === 'string' ? trust.toLowerCase() : ''
      const keys = {
        official: 'trustOfficial',
        verified: 'trustVerified',
        community: 'trustCommunity',
        local: 'trustLocal',
        unknown: 'trustUnknown',
      }
      const key = keys[value]
      if (!key) return null
      return h(
        'span',
        { className: 'sf-badge sf-trust', title: t('trust') + ': ' + String(trust) },
        t('trust') + ': ' + t(key),
      )
    }

    function securityLevelKey(level) {
      const value = typeof level === 'string' ? level.toLowerCase() : ''
      if (value === 'high') return 'secHigh'
      if (value === 'medium') return 'secMedium'
      if (value === 'low') return 'secLow'
      return null
    }

    function securityBadge(t, security) {
      const level =
        security && typeof security === 'object' ? security.level : typeof security === 'string' ? security : null
      const key = securityLevelKey(level)
      if (!key) return null
      return h(
        'span',
        {
          className: 'sf-badge sf-sec sf-sec-' + String(level).toLowerCase(),
          title: t('security') + ': ' + t(key),
        },
        t('security') + ': ' + t(key),
      )
    }

    function licenseBadge(t, license) {
      if (typeof license !== 'string' || !license.trim()) return null
      return h('span', { className: 'sf-badge', title: license }, t('license') + ': ' + license)
    }

    function badgeRow(badges, className) {
      const items = (Array.isArray(badges) ? badges : []).filter(Boolean)
      if (!items.length) return null
      return h(
        'div',
        { className: className || 'sf-meta-row' },
        items.map((item, index) =>
          typeof React.cloneElement === 'function' && (item.key === undefined || item.key === null)
            ? React.cloneElement(item, { key: index })
            : item,
        ),
      )
    }

    function securityFindings(t, security) {
      const findings = security && Array.isArray(security.findings) ? security.findings : []
      const usable = findings.filter(
        (finding) => finding && typeof finding === 'object' && (finding.rule || finding.excerpt),
      )
      if (!usable.length) return null
      return h(
        'div',
        { className: 'sf-findings' },
        h('span', { className: 'sf-findings-label' }, t('findings')),
        usable.slice(0, 2).map((finding, index) =>
          h(
            'div',
            { className: 'sf-finding', key: String(finding.rule || index) + ':' + index },
            finding.rule ? h('code', { className: 'sf-finding-rule' }, String(finding.rule)) : null,
            finding.line !== undefined && finding.line !== null && finding.line !== ''
              ? h('span', { className: 'sf-finding-line' }, ' L' + String(finding.line))
              : null,
            finding.excerpt
              ? h('span', { className: 'sf-finding-excerpt' }, ' ' + String(finding.excerpt).slice(0, 140))
              : null,
          ),
        ),
      )
    }

    function formatPercent(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '—'
      const percent = number <= 1 ? number * 100 : number
      return Math.round(percent) + '%'
    }

    function formatDuration(value) {
      const number = Number(value)
      if (!Number.isFinite(number) || number < 0) return '—'
      if (number < 1000) return Math.round(number) + 'ms'
      const seconds = number / 1000
      if (seconds < 60) return seconds.toFixed(1).replace(/\.0$/, '') + 's'
      return Math.round(seconds / 60) + 'm'
    }

    function healthEntryName(entry) {
      if (typeof entry === 'string') return entry
      if (!entry || typeof entry !== 'object') return ''
      return String(entry.name || entry.skillName || entry.skill || entry.id || '')
    }

    function SkillCard(props) {
      const skill = props.skill
      const t = props.t
      const expanded = props.expanded
      const copied = props.copied
      const onToggle = props.onToggle
      const onCopy = props.onCopy
      return h(
        'div',
        {
          className: expanded ? 'sf-card sf-card-open' : 'sf-card',
          onClick: onToggle,
          role: 'button',
          tabIndex: 0,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onToggle()
            }
          },
        },
        h(
          'div',
          { className: 'sf-card-head' },
          h('code', { className: 'sf-name' }, skill.name),
          h('span', { className: 'sf-source' }, sourceLabel(t, skill.source)),
        ),
        h('p', { className: 'sf-desc' }, skill.intro || skill.description),
        skill.whenToUse
          ? h(
              'p',
              { className: 'sf-when' },
              h('span', { className: 'sf-when-label' }, t('whenLabel')),
              skill.whenToUse,
            )
          : null,
        expanded
          ? h(
              'div',
              { className: 'sf-detail' },
              h('div', { className: 'sf-cat' }, categoryOf(skill.name)),
              skill.path
                ? h(
                    'div',
                    { className: 'sf-path' },
                    h('span', { className: 'sf-detail-label' }, t('path')),
                    h('code', null, skill.path),
                  )
                : null,
              h(
                'div',
                { className: 'sf-flags' },
                h('span', { className: 'sf-detail-label' }, t('flags')),
                h('span', { className: 'sf-flag' }, t('modelOnly')),
                h('span', { className: 'sf-flag' }, t('userOnly')),
              ),
              badgeRow([trustBadge(t, skill.trust), licenseBadge(t, skill.license), securityBadge(t, skill.security)]),
              securityFindings(t, skill.security),
            )
          : null,
        h(
          'button',
          {
            type: 'button',
            className: 'sf-copy',
            onClick: (event) => {
              event.stopPropagation()
              onCopy(skill.name)
            },
          },
          copied ? t('copied') : t('copy'),
        ),
      )
    }

    class DrawerErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch() {
        // Keep the drawer mounted: a tab error must never wedge the panel button.
      }

      render() {
        if (this.state.error) {
          const t = this.props.t || ((key) => key)
          const detail = String((this.state.error && this.state.error.message) || this.state.error || '').slice(0, 200)
          return h(
            'aside',
            { className: 'sf-drawer sf-drawer-error', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('panelError') },
            h(
              'div',
              { className: 'sf-empty sf-error' },
              h('div', null, t('panelError')),
              h('div', { className: 'sf-error-detail' }, detail),
              h(
                'button',
                { type: 'button', className: 'sf-primary', onClick: () => this.setState({ error: null }) },
                t('retry'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-secondary',
                  onClick: () => {
                    if (this.props.onClose) this.props.onClose()
                  },
                },
                t('close'),
              ),
            ),
          )
        }
        return this.props.children
      }
    }

    function SkillDrawer() {
      const state = useStore()
      const t = useT()
      const [data, setData] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [query, setQuery] = React.useState('')
      const [expanded, setExpanded] = React.useState(null)
      const [copied, setCopied] = React.useState(null)
      const [showCreate, setShowCreate] = React.useState(false)
      const [form, setForm] = React.useState({ name: '', description: '', whenToUse: '' })
      const [createBusy, setCreateBusy] = React.useState(false)
      const [createError, setCreateError] = React.useState(null)
      const [createdPath, setCreatedPath] = React.useState(null)
      const [modeBusy, setModeBusy] = React.useState(false)
      const [feedbackBusy, setFeedbackBusy] = React.useState(false)
      const [view, setView] = React.useState('skills')
      const [remoteQuery, setRemoteQuery] = React.useState('')
      const [remoteResults, setRemoteResults] = React.useState([])
      const [remoteLoading, setRemoteLoading] = React.useState(false)
      const [remoteError, setRemoteError] = React.useState(null)
      const [remotePreview, setRemotePreview] = React.useState(null)
      const [remoteInstall, setRemoteInstall] = React.useState(null)
      const [updates, setUpdates] = React.useState(null)
      const [updateBusy, setUpdateBusy] = React.useState(null)
      const [updateError, setUpdateError] = React.useState(null)
      const [updateNotice, setUpdateNotice] = React.useState(null)
      const [recoBusy, setRecoBusy] = React.useState(null)
      const [xpBusy, setXpBusy] = React.useState(null)
      const [xpStatus, setXpStatus] = React.useState(null)
      const [evolutionBusy, setEvolutionBusy] = React.useState(null)
      const [evolutionNotice, setEvolutionNotice] = React.useState(null)
      const [toolsQuery, setToolsQuery] = React.useState('')
      const [toolsResults, setToolsResults] = React.useState([])
      const [toolsLoading, setToolsLoading] = React.useState(false)
      const [toolsError, setToolsError] = React.useState(null)
      const [libraryQuery, setLibraryQuery] = React.useState('')
      const [libraryCategory, setLibraryCategory] = React.useState('')
      const [libraryMinRating, setLibraryMinRating] = React.useState(0)
      const [libraryResults, setLibraryResults] = React.useState([])
      const [libraryMeta, setLibraryMeta] = React.useState(null)
      const [libraryLoading, setLibraryLoading] = React.useState(false)
      const [libraryError, setLibraryError] = React.useState(null)
      const [libraryPage, setLibraryPage] = React.useState(1)
      const searchRef = React.useRef(null)
      const abortRef = React.useRef(null)

      const load = React.useCallback(async (sessionId, silent = false) => {
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller
        if (!silent) {
          setLoading(true)
          setError(null)
        }
        try {
          const params = new URLSearchParams()
          if (sessionId) params.set('sessionId', sessionId)
          const activeLocale = localeCtx?.locale?.getLocale?.().active || ''
          if (activeLocale) params.set('lang', activeLocale.toLowerCase().startsWith('zh') ? 'zh' : 'en')
          const suffix = params.toString() ? '?' + params.toString() : ''
          const response = await fetch('/ronge-adaptive-skill-archive/catalog.json' + suffix, {
            cache: 'no-store',
            signal: controller.signal,
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setData(payload)
        } catch (err) {
          if (err && err.name === 'AbortError') return
          if (silent) return
          setError(err instanceof Error ? err.message : String(err))
          setData(null)
        } finally {
          if (!silent) setLoading(false)
        }
      }, [])

      React.useEffect(() => {
        if (!state.open) {
          setQuery('')
          setExpanded(null)
          setError(null)
          if (abortRef.current) abortRef.current.abort()
          return undefined
        }
        load(state.sessionId)
        const pollTimer = setInterval(() => load(state.sessionId, true), 10000)
        const focusTimer = setTimeout(() => {
          if (searchRef.current) searchRef.current.focus()
        }, 80)
        return () => {
          clearTimeout(focusTimer)
          clearInterval(pollTimer)
          if (abortRef.current) abortRef.current.abort()
        }
      }, [state.open, state.sessionId, load])

      React.useEffect(() => {
        if (!state.open) return undefined
        const onKey = (event) => {
          if (event.key === 'Escape') store.set({ open: false })
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [state.open])

      if (!state.open) return null

      const skills = data && Array.isArray(data.skills) ? data.skills : []
      const recommendations = data && Array.isArray(data.recommendations) ? data.recommendations : []
      const activeSkills = data && Array.isArray(data.activeSkills) ? data.activeSkills : []
      const recentSkills = data && Array.isArray(data.recentSkills) ? data.recentSkills : []
      const shownSkills = activeSkills.length ? activeSkills : recentSkills
      const currentMode = data && data.mode ? data.mode : 'off'
      const experience = data && data.experience ? data.experience : null
      const recFeedback =
        experience && experience.recFeedback && experience.recFeedback.skills && typeof experience.recFeedback.skills === 'object'
          ? experience.recFeedback.skills
          : null
      const normalized = query.trim().toLowerCase()
      const filtered = normalized
        ? skills.filter((skill) =>
            [skill.name, skill.description, skill.intro, skill.whenToUse]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(normalized),
          )
        : skills

      const copyName = (name) => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(name).catch(() => {})
          }
        } catch {
          // Clipboard is optional.
        }
        setCopied(name)
        setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200)
      }

      const topReasonKind = (item) => {
        if (!item || !Array.isArray(item.reasonsDetail)) return ''
        const first = item.reasonsDetail.find((reason) => reason && reason.kind)
        return first ? String(first.kind) : ''
      }

      const sendRecommendFeedback = async (skillName, verdict, kind) => {
        if (!skillName || recoBusy) return
        setRecoBusy({ name: skillName, verdict })
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/recommend-feedback', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ skillName, verdict, kind: kind || undefined }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          await load(state.sessionId, true)
        } catch {
          // Recommendation feedback is best-effort; failures stay silent.
        } finally {
          setRecoBusy(null)
        }
      }

      const copyCommand = (name, kind) => {
        if (!name) return
        writeClipboardText('/skill ' + name)
        setCopied(name)
        setTimeout(() => setCopied((current) => (current === name ? null : current)), 1500)
        sendRecommendFeedback(name, 'adopt', kind)
      }

      const changeMode = async (next) => {
        const target = currentMode === next ? 'off' : next
        setModeBusy(true)
        setError(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/mode', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ mode: target }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          await load(state.sessionId, true)
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setModeBusy(false)
        }
      }

      const sendFeedback = async (id, rating) => {
        if (!id || feedbackBusy) return
        setFeedbackBusy(true)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/feedback', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id, rating }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          await load(state.sessionId, true)
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setFeedbackBusy(false)
        }
      }

      const loadRemote = async (q = remoteQuery) => {
        setRemoteLoading(true)
        setRemoteError(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/discover?q=' + encodeURIComponent(q || ''), {
            cache: 'no-store',
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setRemoteResults(Array.isArray(payload.entries) ? payload.entries : [])
        } catch (err) {
          setRemoteError(err instanceof Error ? err.message : String(err))
          setRemoteResults([])
        } finally {
          setRemoteLoading(false)
        }
      }

      const loadTools = async (q = toolsQuery) => {
        setToolsLoading(true)
        setToolsError(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/tools?q=' + encodeURIComponent(q || ''), {
            cache: 'no-store',
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setToolsResults(Array.isArray(payload.servers) ? payload.servers : [])
        } catch (err) {
          setToolsError(err instanceof Error ? err.message : String(err))
          setToolsResults([])
        } finally {
          setToolsLoading(false)
        }
      }

      const loadLibrary = async (page = 1, append = false, filters = {}) => {
        setLibraryLoading(true)
        setLibraryError(null)
        try {
          const params = new URLSearchParams({
            q: filters.q !== undefined ? filters.q : libraryQuery,
            category: filters.category !== undefined ? filters.category : libraryCategory,
            minRating: String(filters.minRating !== undefined ? filters.minRating : libraryMinRating),
            page: String(page),
            limit: '40',
          })
          const activeLocale = localeCtx?.locale?.getLocale?.().active || ''
          if (activeLocale) params.set('lang', activeLocale.toLowerCase().startsWith('zh') ? 'zh' : 'en')
          const response = await fetch('/ronge-adaptive-skill-archive/library?' + params.toString(), { cache: 'no-store' })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setLibraryMeta({
            total: payload.total,
            categories: payload.categories || {},
            categoryLabels: payload.categoryLabels || {},
            generatedAt: payload.generatedAt,
          })
          setLibraryPage(page)
          setLibraryResults((current) => (append ? current.concat(payload.entries || []) : payload.entries || []))
        } catch (err) {
          setLibraryError(err instanceof Error ? err.message : String(err))
          if (!append) setLibraryResults([])
        } finally {
          setLibraryLoading(false)
        }
      }

      const openRemotePreview = async (entry) => {
        setRemotePreview({ entry, content: '', loading: true, error: null })
        try {
          const response = await fetch(
            '/ronge-adaptive-skill-archive/discover/preview?url=' + encodeURIComponent(entry.url),
            { cache: 'no-store' },
          )
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setRemotePreview({
            entry,
            content: payload.content || '',
            loading: false,
            error: null,
            security: payload.security || null,
            license: payload.license || null,
            trust: payload.trust || null,
          })
        } catch (err) {
          setRemotePreview({
            entry,
            content: '',
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }

      const installRemote = async (entry) => {
        setRemoteInstall({ name: entry.name, status: 'installing' })
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/discover/install', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url: entry.url, trust: entry.trust }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setRemoteInstall({ name: entry.name, status: 'installed', path: payload.path })
          await load(state.sessionId, true)
        } catch (err) {
          setRemoteInstall({
            name: entry.name,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }

      const checkUpdates = async (silent = false) => {
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/discover/updates', { cache: 'no-store' })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setUpdates({ updates: payload.updates || [], checked: payload.checked || 0 })
        } catch (err) {
          if (!silent) setRemoteError(err instanceof Error ? err.message : String(err))
        }
      }

      const performUpdateAction = async (kind, name) => {
        if (updateBusy) return
        if (kind !== 'all' && !name) return
        setUpdateBusy({ kind, name: name || 'all' })
        setUpdateError(null)
        setUpdateNotice(null)
        try {
          let endpoint = '/ronge-adaptive-skill-archive/discover/update'
          let body = { name }
          let doneKey = 'updateOk'
          if (kind === 'all') {
            endpoint = '/ronge-adaptive-skill-archive/discover/update-all'
            body = {}
          } else if (kind === 'rollback') {
            endpoint = '/ronge-adaptive-skill-archive/discover/rollback'
            doneKey = 'rollbackOk'
          }
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          let summary = name || ''
          if (kind === 'all' && Number.isFinite(Number(payload.updated))) {
            summary = String(Number(payload.updated)) + ' ' + t('updatesFound')
          }
          setUpdateNotice(t(doneKey) + summary)
          await checkUpdates(true)
          await load(state.sessionId, true)
        } catch (err) {
          setUpdateError(
            t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)),
          )
        } finally {
          setUpdateBusy(null)
        }
      }

      const exportExperience = async () => {
        if (xpBusy) return
        setXpBusy('export')
        setXpStatus(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/experience/export', { cache: 'no-store' })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          const data =
            payload && payload.payload && typeof payload.payload === 'object' ? payload.payload : payload
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'ronge-skill-studio-experience.json'
          document.body.appendChild(link)
          link.click()
          link.remove()
          setTimeout(() => {
            try {
              URL.revokeObjectURL(url)
            } catch {
              // Object URL cleanup is best-effort.
            }
          }, 1500)
          setXpStatus({ kind: 'ok', text: t('exportOk') })
        } catch (err) {
          setXpStatus({
            kind: 'error',
            text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)),
          })
        } finally {
          setXpBusy(null)
        }
      }

      const importExperience = async () => {
        if (xpBusy) return
        let text = ''
        try {
          text = window.prompt(t('importPrompt')) || ''
        } catch {
          return
        }
        if (!text.trim()) return
        let parsed
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          setXpStatus({
            kind: 'error',
            text: t('importInvalid') + ': ' + (err instanceof Error ? err.message : String(err)),
          })
          return
        }
        const payload =
          parsed && typeof parsed === 'object' && parsed.payload && typeof parsed.payload === 'object'
            ? parsed.payload
            : parsed
        setXpBusy('import')
        setXpStatus(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/experience/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ payload }),
          })
          const result = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status)
          setXpStatus({ kind: 'ok', text: t('importOk') })
          await load(state.sessionId, true)
        } catch (err) {
          setXpStatus({
            kind: 'error',
            text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)),
          })
        } finally {
          setXpBusy(null)
        }
      }

      const runEvolutionAction = async (action) => {
        if (evolutionBusy) return
        const endpoints = {
          evaluate: '/ronge-adaptive-skill-archive/evolution/evaluate',
          rollback: '/ronge-adaptive-skill-archive/evolution/rollback',
          reset: '/ronge-adaptive-skill-archive/evolution/reset',
        }
        const doneKeys = {
          evaluate: 'evolutionDone',
          rollback: 'evolutionRolledBack',
          reset: 'evolutionReset',
        }
        const endpoint = endpoints[action]
        if (!endpoint) return
        setEvolutionBusy(action)
        setEvolutionNotice(null)
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setEvolutionNotice({ kind: 'ok', text: t(doneKeys[action]) })
          await load(state.sessionId, true)
        } catch (err) {
          setEvolutionNotice({
            kind: 'error',
            text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)),
          })
        } finally {
          setEvolutionBusy(null)
        }
      }

      const changeView = (next) => {
        setView(next)
        if (next === 'discover' && remoteResults.length === 0) loadRemote('')
        if (next === 'tools' && toolsResults.length === 0) loadTools('')
        if (next === 'library' && libraryResults.length === 0) loadLibrary(1, false)
      }

      const submitCreate = async (event) => {        event.preventDefault()
        setCreateBusy(true)
        setCreateError(null)
        setCreatedPath(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/create', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(form),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setCreatedPath(payload.path || null)
          setForm({ name: '', description: '', whenToUse: '' })
          await load(state.sessionId)
        } catch (err) {
          setCreateError(err instanceof Error ? err.message : String(err))
        } finally {
          setCreateBusy(false)
        }
      }

      const setField = (key) => (event) => {
        const value = event.target.value
        setForm((current) => ({ ...current, [key]: value }))
      }

      const close = () => store.set({ open: false })

      const renderLibrary = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h('button', { type: 'button', className: 'sf-icon-btn', onClick: () => setView('skills') }, '←'),
            h('strong', null, t('libraryTitle')),
            libraryMeta ? h('span', { className: 'sf-source' }, String(libraryMeta.total) + ' ' + t('count')) : null,
          ),
          h(
            'div',
            { className: 'sf-toolbar' },
            h('input', {
              className: 'sf-input',
              type: 'search',
              value: libraryQuery,
              placeholder: t('searchRemote'),
              onChange: (event) => setLibraryQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') loadLibrary(1, false)
              },
            }),
            h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadLibrary(1, false) }, t('searchBtn')),
          ),
          h('div', { className: 'sf-subhint' }, t('libraryHint')),
          h(
            'div',
            { className: 'sf-chips' },
            h(
              'button',
              {
                type: 'button',
                className: libraryCategory === '' ? 'sf-chip sf-chip-active' : 'sf-chip',
                onClick: () => {
                  setLibraryCategory('')
                  loadLibrary(1, false, { category: '' })
                },
              },
              t('all'),
            ),
            Object.entries((libraryMeta && libraryMeta.categories) || {}).map(([category, count]) =>
              h(
                'button',
                {
                  type: 'button',
                  key: category,
                  className: libraryCategory === category ? 'sf-chip sf-chip-active' : 'sf-chip',
                  onClick: () => {
                    setLibraryCategory(category)
                    loadLibrary(1, false, { category })
                  },
                },
                ((libraryMeta && libraryMeta.categoryLabels && libraryMeta.categoryLabels[category]) || category) +
                  ' ' +
                  count,
              ),
            ),
          ),
          h(
            'div',
            { className: 'sf-chips' },
            h('span', { className: 'sf-mode-label' }, t('ratingLabel')),
            [0, 3, 4, 4.5].map((value) =>
              h(
                'button',
                {
                  type: 'button',
                  key: value,
                  className: libraryMinRating === value ? 'sf-chip sf-chip-active' : 'sf-chip',
                  onClick: () => {
                    setLibraryMinRating(value)
                    loadLibrary(1, false, { minRating: value })
                  },
                },
                value === 0 ? t('all') : '★ ' + value + '+',
              ),
            ),
          ),
          remoteInstall
            ? h(
                'div',
                { className: 'sf-install-note' },
                remoteInstall.name + ': ' +
                  (remoteInstall.status === 'installing'
                    ? t('installing')
                    : remoteInstall.status === 'installed'
                      ? t('installed') + ' ' + (remoteInstall.path || '')
                      : remoteInstall.error || ''),
              )
            : null,
          libraryLoading ? h('div', { className: 'sf-empty' }, t('loading')) : null,
          libraryError ? h('div', { className: 'sf-empty sf-error' }, t('error') + ': ' + libraryError) : null,
          !libraryLoading && !libraryError && libraryResults.length === 0
            ? h('div', { className: 'sf-empty' }, t('noLibrary'))
            : null,
          h(
            'div',
            { className: 'sf-list' },
            libraryResults.map((entry) =>
              h(
                'div',
                { className: 'sf-remote-card', key: entry.repo + '::' + entry.path },
                h(
                  'div',
                  { className: 'sf-remote-head' },
                  h('strong', { className: 'sf-name' }, entry.name),
                  h('span', { className: 'sf-source' }, '★ ' + entry.rating + ' · ' + (entry.categoryLabel || entry.category)),
                ),
                h('p', { className: 'sf-desc' }, entry.intro || entry.description || ''),
                h('div', { className: 'sf-remote-meta' }, (entry.repo || '') + ' · ' + (entry.path || '')),
                h(
                  'div',
                  { className: 'sf-remote-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-secondary',
                      onClick: () => openRemotePreview({ ...entry, url: entry.rawUrl || entry.url }),
                    },
                    t('preview'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-primary',
                      disabled: entry.installed,
                      onClick: () => installRemote({ ...entry, url: entry.rawUrl || entry.url }),
                    },
                    entry.installed ? t('installed') : t('install'),
                  ),
                ),
              ),
            ),
            remotePreview
              ? h(
                  'div',
                  { className: 'sf-preview' },
                  h(
                    'div',
                    { className: 'sf-preview-head' },
                    h('strong', null, remotePreview.entry.name),
                    h('button', { type: 'button', className: 'sf-icon-btn', onClick: () => setRemotePreview(null) }, '✕'),
                  ),
                  remotePreview.loading
                    ? h('div', { className: 'sf-empty' }, t('loading'))
                    : remotePreview.error
                      ? h('div', { className: 'sf-empty sf-error' }, remotePreview.error)
                      : h('pre', { className: 'sf-preview-code' }, String(remotePreview.content || '').slice(0, 6000)),
                  badgeRow(
                    [
                      trustBadge(
                        t,
                        remotePreview.trust || (remotePreview.entry && remotePreview.entry.trust),
                      ),
                      securityBadge(t, remotePreview.security),
                      licenseBadge(t, remotePreview.license),
                    ],
                    'sf-meta-row sf-preview-meta',
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'sf-primary', onClick: () => installRemote(remotePreview.entry) },
                    t('install'),
                  ),
                )
              : null,
            libraryMeta && libraryResults.length < libraryMeta.total && !libraryLoading
              ? h(
                  'button',
                  { type: 'button', className: 'sf-new-btn', onClick: () => loadLibrary(libraryPage + 1, true) },
                  t('loadMore'),
                )
              : null,
          ),
        )

      const renderUpdates = () => {
        if (!updates) return null
        const items = Array.isArray(updates.updates) ? updates.updates : []
        const busyAll = updateBusy && updateBusy.kind === 'all'
        return h(
          'div',
          { className: 'sf-updates' },
          h(
            'div',
            { className: 'sf-updates-head' },
            h('span', null, items.length ? items.length + ' ' + t('updatesFound') : t('noUpdates')),
            items.length
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-secondary',
                    disabled: Boolean(updateBusy),
                    onClick: () => performUpdateAction('all'),
                  },
                  busyAll ? t('updating') : t('updateAll'),
                )
              : null,
          ),
          updateError ? h('div', { className: 'sf-update-error sf-error' }, updateError) : null,
          updateNotice ? h('div', { className: 'sf-update-ok' }, updateNotice) : null,
          items.slice(0, 12).map((item, index) => {
            const entry = item && typeof item === 'object' ? item : {}
            const name = entry.name ? String(entry.name) : ''
            const diff = entry.diff && typeof entry.diff === 'object' ? entry.diff : null
            const added = diff && Number.isFinite(Number(diff.added)) ? Number(diff.added) : null
            const removed = diff && Number.isFinite(Number(diff.removed)) ? Number(diff.removed) : null
            const lines =
              diff && Array.isArray(diff.lines)
                ? diff.lines
                    .filter((line) => line && (line.type === '+' || line.type === '-'))
                    .slice(0, 3)
                : []
            const busy = updateBusy && updateBusy.name === name
            return h(
              'div',
              { className: 'sf-update-item', key: name || 'update-' + index },
              h(
                'div',
                { className: 'sf-update-row' },
                h('code', { className: 'sf-name' }, name),
                added !== null || removed !== null
                  ? h(
                      'span',
                      { className: 'sf-update-diff' },
                      (added !== null ? '+' + added : '') + (removed !== null ? ' / -' + removed : ''),
                    )
                  : null,
                licenseBadge(t, entry.license),
                securityBadge(t, entry.risk),
              ),
              lines.length
                ? h(
                    'div',
                    { className: 'sf-diff' },
                    lines.map((line, index) =>
                      h(
                        'div',
                        {
                          className: line.type === '+' ? 'sf-diff-line sf-diff-add' : 'sf-diff-line sf-diff-del',
                          key: index,
                        },
                        (line.type === '+' ? '+ ' : '- ') + String(line.text === undefined ? '' : line.text),
                      ),
                    ),
                  )
                : null,
              h(
                'div',
                { className: 'sf-update-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-secondary',
                    disabled: Boolean(updateBusy),
                    onClick: () => performUpdateAction('update', name),
                  },
                  busy && updateBusy.kind === 'update' ? t('updating') : t('update'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-secondary',
                    disabled: Boolean(updateBusy),
                    onClick: () => performUpdateAction('rollback', name),
                  },
                  busy && updateBusy.kind === 'rollback' ? t('updating') : t('rollback'),
                ),
              ),
            )
          }),
        )
      }

      const renderExperienceTable = () => {
        const topSkills =
          experience && Array.isArray(experience.topSkills)
            ? experience.topSkills.filter((stat) => stat && typeof stat === 'object')
            : []
        if (!topSkills.length) return null
        return h(
          'div',
          { className: 'sf-xp-table' },
          h(
            'div',
            { className: 'sf-xp-row sf-xp-row-head' },
            h('span', null, t('tabSkills')),
            h('span', null, t('usesLabel')),
            h('span', null, t('successRate')),
            h('span', null, t('avgDuration')),
          ),
          topSkills.slice(0, 8).map((stat) =>
            h(
              'div',
              { className: 'sf-xp-row', key: stat.name },
              h('code', { className: 'sf-xp-name' }, stat.name),
              h('span', null, stat.uses === undefined || stat.uses === null ? '—' : String(stat.uses)),
              h('span', null, formatPercent(stat.successRate)),
              h('span', null, formatDuration(stat.avgDurationMs)),
            ),
          ),
        )
      }

      const renderExperienceHealth = () => {
        const health =
          experience && experience.health && typeof experience.health === 'object' ? experience.health : null
        if (!health) return null
        const groups = [
          ['healthStale', 'stale'],
          ['healthFailing', 'failing'],
          ['healthNeverUsed', 'neverUsed'],
          ['healthLicenseUnknown', 'licenseUnknown'],
        ]
        const rows = groups
          .map(([key, field]) => {
            const list = Array.isArray(health[field]) ? health[field] : []
            const names = list.map(healthEntryName).filter(Boolean).slice(0, 5)
            if (!names.length) return null
            return h(
              'div',
              { className: 'sf-health-row', key: field },
              h('span', { className: 'sf-health-label' }, t(key) + ' ' + list.length),
              h('span', { className: 'sf-health-names' }, names.join(' · ')),
            )
          })
          .filter(Boolean)
        if (!rows.length) return null
        return h(
          'div',
          { className: 'sf-health' },
          h('div', { className: 'sf-health-title' }, t('experienceHealth')),
          rows,
        )
      }

      const renderEvolution = () => {
        const evolution = data && data.evolution && typeof data.evolution === 'object' ? data.evolution : null
        if (!evolution) return null
        const weights = evolution.weights && typeof evolution.weights === 'object' ? evolution.weights : {}
        const labels = {
          token: t('weightToken'),
          name: t('weightName'),
          category: t('weightCategory'),
          experience: t('weightExperience'),
        }
        const chips = Object.keys(labels)
          .filter((key) => Number.isFinite(Number(weights[key])))
          .map((key) =>
            h('span', { className: 'sf-xp-chip', key: 'weight-' + key }, labels[key] + ' ×' + weights[key]),
          )
        const rate = evolution.stats && Number.isFinite(Number(evolution.stats.successRate))
          ? Math.round(Number(evolution.stats.successRate) * 100)
          : null
        const sinceEval = Number(evolution.observationsSinceEval || 0)
        const history = Array.isArray(evolution.recentHistory) ? evolution.recentHistory : []
        const changeRows = history
          .slice(-3)
          .reverse()
          .flatMap((entry) =>
            (Array.isArray(entry.changes) ? entry.changes : []).slice(0, 3).map((change, index) =>
              h(
                'div',
                { className: 'sf-health-row', key: 'evolution-' + String(entry.at) + '-' + index },
                h(
                  'span',
                  { className: 'sf-health-label' },
                  (change.label || change.weight || '') + ' ' + change.from + ' → ' + change.to,
                ),
                h('span', { className: 'sf-health-names' }, change.reason || ''),
              ),
            ),
          )
        return h(
          'div',
          { className: 'sf-health sf-evolution' },
          h('div', { className: 'sf-health-title' }, t('evolution')),
          h('div', { className: 'sf-health-row' }, h('span', { className: 'sf-health-label' }, t('evolutionHint'))),
          h(
            'div',
            { className: 'sf-health-row' },
            h('span', { className: 'sf-health-label' }, t('evolutionWeights')),
            h('span', { className: 'sf-health-names' }, chips),
          ),
          h(
            'div',
            { className: 'sf-health-row' },
            h('span', { className: 'sf-health-label' }, t('evolutionRate')),
            h(
              'span',
              { className: 'sf-health-names' },
              (rate === null ? '—' : rate + '%') + ' · ' + t('evolutionObs') + ' ' + sinceEval,
            ),
          ),
          changeRows.length
            ? h('div', { className: 'sf-health-row' }, h('span', { className: 'sf-health-label' }, t('evolutionHistory')), h('span', { className: 'sf-health-names' }, changeRows.length + ' 条'))
            : h('div', { className: 'sf-health-row' }, h('span', { className: 'sf-health-label' }, t('evolutionNone'))),
          changeRows,
          h(
            'div',
            { className: 'sf-xp-tools' },
            h(
              'button',
              { type: 'button', className: 'sf-fb', disabled: Boolean(evolutionBusy), onClick: () => runEvolutionAction('evaluate') },
              evolutionBusy === 'evaluate' ? t('evolutionBusy') : t('evaluateEvolution'),
            ),
            h(
              'button',
              { type: 'button', className: 'sf-fb', disabled: Boolean(evolutionBusy) || !evolution.canRollback, onClick: () => runEvolutionAction('rollback') },
              t('rollbackEvolution'),
            ),
            h(
              'button',
              { type: 'button', className: 'sf-fb', disabled: Boolean(evolutionBusy), onClick: () => runEvolutionAction('reset') },
              t('resetEvolution'),
            ),
          ),
          evolutionNotice
            ? h(
                'div',
                { className: evolutionNotice.kind === 'error' ? 'sf-xp-status sf-error' : 'sf-xp-status sf-ok' },
                evolutionNotice.text,
              )
            : null,
        )
      }

      const renderDiscover = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h('button', { type: 'button', className: 'sf-icon-btn', onClick: () => setView('skills') }, '←'),
            h('strong', null, t('discoverTitle')),
            h(
              'button',
              { type: 'button', className: 'sf-secondary', onClick: () => loadRemote(remoteQuery) },
              t('refreshIndex'),
            ),
            h(
              'button',
              { type: 'button', className: 'sf-secondary', onClick: checkUpdates },
              t('checkUpdates'),
            ),
          ),
          h(
            'div',
            { className: 'sf-toolbar' },
            h('input', {
              className: 'sf-input',
              type: 'search',
              value: remoteQuery,
              placeholder: t('searchRemote'),
              onChange: (event) => setRemoteQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') loadRemote(remoteQuery)
              },
            }),
            h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadRemote(remoteQuery) }, t('searchBtn')),
          ),
          h('div', { className: 'sf-subhint' }, t('remoteHint')),
          renderUpdates(),
          remoteInstall
            ? h(
                'div',
                { className: 'sf-install-note' },
                remoteInstall.name + ': ' +
                  (remoteInstall.status === 'installing'
                    ? t('installing')
                    : remoteInstall.status === 'installed'
                      ? t('installed') + ' ' + (remoteInstall.path || '')
                      : remoteInstall.error || ''),
              )
            : null,
          remoteLoading ? h('div', { className: 'sf-empty' }, t('loading')) : null,
          remoteError ? h('div', { className: 'sf-empty sf-error' }, t('error') + ': ' + remoteError) : null,
          !remoteLoading && !remoteError && remoteResults.length === 0
            ? h('div', { className: 'sf-empty' }, t('noRemote'))
            : null,
          h(
            'div',
            { className: 'sf-list' },
            remoteResults.map((entry) =>
              h(
                'div',
                { className: 'sf-remote-card', key: entry.url || entry.name },
                h(
                  'div',
                  { className: 'sf-remote-head' },
                  h('strong', { className: 'sf-name' }, entry.name),
                  h('span', { className: 'sf-source' }, entry.trust || entry.sourceLabel || t('source')),
                ),
                h('p', { className: 'sf-desc' }, entry.description || ''),
                h('div', { className: 'sf-remote-meta' }, (entry.repo || '') + ' · ' + (entry.path || '')),
                h(
                  'div',
                  { className: 'sf-remote-actions' },
                  h('button', { type: 'button', className: 'sf-secondary', onClick: () => openRemotePreview(entry) }, t('preview')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-primary',
                      disabled: entry.installed,
                      onClick: () => installRemote(entry),
                    },
                    entry.installed ? t('installed') : t('install'),
                  ),
                ),
              ),
            ),
            remotePreview
              ? h(
                  'div',
                  { className: 'sf-preview' },
                  h(
                    'div',
                    { className: 'sf-preview-head' },
                    h('strong', null, remotePreview.entry.name),
                    h('button', { type: 'button', className: 'sf-icon-btn', onClick: () => setRemotePreview(null) }, '✕'),
                  ),
                  remotePreview.loading
                    ? h('div', { className: 'sf-empty' }, t('loading'))
                    : remotePreview.error
                      ? h('div', { className: 'sf-empty sf-error' }, remotePreview.error)
                      : h(
                          'pre',
                          { className: 'sf-preview-code' },
                          String(remotePreview.content || '').slice(0, 6000),
                        ),
                  badgeRow(
                    [
                      trustBadge(
                        t,
                        remotePreview.trust || (remotePreview.entry && remotePreview.entry.trust),
                      ),
                      securityBadge(t, remotePreview.security),
                      licenseBadge(t, remotePreview.license),
                    ],
                    'sf-meta-row sf-preview-meta',
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-primary',
                      onClick: () => installRemote(remotePreview.entry),
                    },
                    t('install'),
                  ),
                )
              : null,
          ),
        )

      const renderTools = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h('button', { type: 'button', className: 'sf-icon-btn', onClick: () => setView('skills') }, '←'),
            h('strong', null, t('toolsTitle')),
          ),
          h(
            'div',
            { className: 'sf-toolbar' },
            h('input', {
              className: 'sf-input',
              type: 'search',
              value: toolsQuery,
              placeholder: t('searchTools'),
              onChange: (event) => setToolsQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') loadTools(toolsQuery)
              },
            }),
            h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadTools(toolsQuery) }, t('searchBtn')),
          ),
          h('div', { className: 'sf-subhint' }, t('toolsHint')),
          toolsLoading ? h('div', { className: 'sf-empty' }, t('loading')) : null,
          toolsError ? h('div', { className: 'sf-empty sf-error' }, t('error') + ': ' + toolsError) : null,
          !toolsLoading && !toolsError && toolsResults.length === 0
            ? h('div', { className: 'sf-empty' }, t('noTools'))
            : null,
          h(
            'div',
            { className: 'sf-list' },
            toolsResults.map((server) =>
              h(
                'div',
                { className: 'sf-remote-card', key: server.name },
                h(
                  'div',
                  { className: 'sf-remote-head' },
                  h('strong', { className: 'sf-name' }, server.title || server.name),
                  h('span', { className: 'sf-source' }, server.version || ''),
                ),
                h('p', { className: 'sf-desc' }, server.description || ''),
                h('div', { className: 'sf-remote-meta' }, server.name),
                server.repo
                  ? h(
                      'a',
                      { className: 'sf-remote-link', href: server.repo, target: '_blank', rel: 'noreferrer' },
                      t('repoLabel') + ': ' + server.repo,
                    )
                  : null,
              ),
            ),
          ),
        )


      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h('div', { className: 'sf-backdrop', onClick: close }),
        h(
          DrawerErrorBoundary,
          { t, onClose: close },
          h(
            'aside',
            {
              className: 'sf-drawer',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': t('title'),
            },
          h(
            'header',
            { className: 'sf-head' },
            h(
              'div',
              { className: 'sf-head-main' },
              h('div', { className: 'sf-title-row' }, h(IconSkills, { size: 18 }), h('strong', null, t('title'))),
              h('div', { className: 'sf-subtitle' }, t('subtitle')),
            ),
            h(
              'div',
              { className: 'sf-head-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-icon-btn',
                  title: t('refresh'),
                  'aria-label': t('refresh'),
                  onClick: () => load(state.sessionId),
                },
                h(IconRefresh, null),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-icon-btn',
                  title: t('close'),
                  'aria-label': t('close'),
                  onClick: close,
                },
                h(IconClose, null),
              ),
            ),
          ),
          h(
            'div',
            { className: 'sf-tabs' },
            h(
              'button',
              {
                type: 'button',
                className: view === 'skills' ? 'sf-tab sf-tab-active' : 'sf-tab',
                onClick: () => setView('skills'),
              },
              t('tabSkills'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: view === 'library' ? 'sf-tab sf-tab-active' : 'sf-tab',
                onClick: () => changeView('library'),
              },
              t('tabLibrary'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: view === 'discover' ? 'sf-tab sf-tab-active' : 'sf-tab',
                onClick: () => changeView('discover'),
              },
              t('tabDiscover'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: view === 'tools' ? 'sf-tab sf-tab-active' : 'sf-tab',
                onClick: () => changeView('tools'),
              },
              t('tabTools'),
            ),
          ),
          h(
            'div',
            { className: 'sf-toolbar' },
            h('input', {
              ref: searchRef,
              className: 'sf-input',
              type: 'search',
              value: query,
              placeholder: t('search'),
              onChange: (event) => setQuery(event.target.value),
            }),
            h(
              'span',
              { className: 'sf-count' },
              filtered.length + ' ' + t('count'),
            ),
          ),
          h(
            'div',
            { className: 'sf-modebar' },
            h('span', { className: 'sf-mode-label' }, t('mode')),
            h(
              'button',
              {
                type: 'button',
                className: currentMode === 'plan' ? 'sf-mode sf-mode-active' : 'sf-mode',
                disabled: modeBusy,
                onClick: () => changeMode('plan'),
              },
              t('planMode'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: currentMode === 'immersive' ? 'sf-mode sf-mode-active' : 'sf-mode',
                disabled: modeBusy,
                onClick: () => changeMode('immersive'),
              },
              t('immersiveMode'),
            ),
            h(
              'span',
              { className: 'sf-mode-hint' },
              currentMode === 'plan' ? t('planHint') : currentMode === 'immersive' ? t('immersiveHint') : '',
            ),
          ),
          recommendations.length
            ? h(
                'div',
                { className: 'sf-suggest' },
                h('span', { className: 'sf-mode-label' }, t('suggest')),
                recommendations.slice(0, 2).map((item) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      key: 'suggest-' + item.name,
                      className: copied === item.name ? 'sf-chip sf-chip-active' : 'sf-chip',
                      title: t('copySkill'),
                      disabled: Boolean(recoBusy && recoBusy.name === item.name),
                      onClick: () => copyCommand(item.name, topReasonKind(item)),
                    },
                    copied === item.name ? t('copied') : item.name,
                  ),
                ),
              )
            : null,
          activeSkills.length || recentSkills.length
            ? h(
                'div',
                { className: 'sf-active' },
                h('span', { className: 'sf-active-label' }, activeSkills.length ? t('activeNow') : t('recentUsed')),
                shownSkills.map((skill) =>
                  h('span', { key: skill.name, className: 'sf-active-chip' }, skill.name),
                ),
              )
            : null,
          experience
            ? h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'sf-xp', title: experience.path || '' },
                  h('span', { className: 'sf-xp-label' }, t('experience')),
                  Array.isArray(experience.topSkills)
                    ? experience.topSkills
                        .filter((stat) => stat && stat.name)
                        .slice(0, 5)
                        .map((stat) =>
                          h('span', { key: stat.name, className: 'sf-xp-chip' }, stat.name + ' ×' + stat.uses),
                        )
                    : null,
                  experience.recent && experience.recent[0]
                    ? h(
                        'span',
                        { className: 'sf-xp-last' },
                        t('lastTask') + String(experience.recent[0].task || '').slice(0, 36),
                      )
                    : null,
                  h(
                    'span',
                    { className: 'sf-xp-tools' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sf-fb',
                        disabled: xpBusy === 'export',
                        onClick: () => exportExperience(),
                      },
                      xpBusy === 'export' ? t('exportBusy') : t('exportExperience'),
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sf-fb',
                        disabled: xpBusy === 'import',
                        onClick: () => importExperience(),
                      },
                      xpBusy === 'import' ? t('importBusy') : t('importExperience'),
                    ),
                  ),
                ),
                xpStatus
                  ? h(
                      'div',
                      {
                        className:
                          xpStatus.kind === 'error' ? 'sf-xp-status sf-error' : 'sf-xp-status sf-ok',
                      },
                      xpStatus.text,
                    )
                  : null,
                experience.recent && experience.recent[0] && experience.recent[0].outcome
                  ? h(
                      'div',
                      { className: 'sf-feedback' },
                      h(
                        'span',
                        { className: 'sf-feedback-outcome', title: experience.recent[0].outcome },
                        t('lastOutcome') + String(experience.recent[0].outcome).slice(0, 90),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className:
                            experience.recent[0].rating === 'good' ? 'sf-fb sf-fb-active' : 'sf-fb',
                          disabled: feedbackBusy,
                          onClick: () => sendFeedback(experience.recent[0].id, 'good'),
                        },
                        '👍 ' + t('good'),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className:
                            experience.recent[0].rating === 'bad' ? 'sf-fb sf-fb-active' : 'sf-fb',
                          disabled: feedbackBusy,
                          onClick: () => sendFeedback(experience.recent[0].id, 'bad'),
                        },
                        '👎 ' + t('bad'),
                      ),
                    )
                  : null,
                renderExperienceTable(),
                renderExperienceHealth(),
                renderEvolution(),
              )
            : null,
          h(
            'div',
            { className: 'sf-list' },
            loading ? h('div', { className: 'sf-empty' }, t('loading')) : null,
            !loading && error
              ? h(
                  'div',
                  { className: 'sf-empty sf-error' },
                  h('div', null, t('error') + ': ' + error),
                  h('button', { type: 'button', className: 'sf-secondary', onClick: () => load(state.sessionId) }, t('retry')),
                )
              : null,
            !loading && !error && recommendations.length
              ? h(
                  'section',
                  { className: 'sf-reco' },
                  h(
                    'div',
                    { className: 'sf-reco-head' },
                    h('span', null, t('recommend')),
                    h('span', { className: 'sf-reco-hint' }, t('recommendHint')),
                  ),
                  data && data.contextPreview
                    ? h('div', { className: 'sf-reco-context' }, t('basedOn') + data.contextPreview)
                    : null,
                  recommendations.map((item) => {
                    const detail = Array.isArray(item.reasonsDetail)
                      ? item.reasonsDetail
                          .filter((entry) => entry && typeof entry.label === 'string' && entry.label.trim())
                          .slice(0, 3)
                      : []
                    const counts =
                      recFeedback && recFeedback[item.name] && typeof recFeedback[item.name] === 'object'
                        ? recFeedback[item.name]
                        : null
                    const busy = Boolean(recoBusy && recoBusy.name === item.name)
                    return h(
                      'div',
                      {
                        role: 'button',
                        tabIndex: 0,
                        key: item.name,
                        className: 'sf-reco-item',
                        onClick: () => {
                          setQuery(item.name)
                          setExpanded(item.name)
                        },
                        onKeyDown: (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setQuery(item.name)
                            setExpanded(item.name)
                          }
                        },
                      },
                      h('span', { className: 'sf-reco-name' }, item.name),
                      h('span', { className: 'sf-reco-score' }, String(item.score ?? '')),
                      detail.length
                        ? h(
                            'span',
                            { className: 'sf-reco-badges' },
                            detail.map((reason, index) =>
                              h(
                                'span',
                                {
                                  key: String(reason.kind || 'reason') + ':' + index,
                                  className: 'sf-reco-badge',
                                  title: reason.detail ? String(reason.detail) : '',
                                },
                                String(reason.label),
                              ),
                            ),
                          )
                        : (item.reasons || []).length
                          ? h('span', { className: 'sf-reco-reasons' }, (item.reasons || []).join(' · '))
                          : null,
                      h('span', { className: 'sf-reco-intro' }, item.intro || item.description || ''),
                      h(
                        'div',
                        { className: 'sf-reco-actions' },
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'sf-reco-btn',
                            disabled: busy,
                            title: t('copySkill'),
                            onClick: (event) => {
                              event.stopPropagation()
                              copyCommand(item.name, topReasonKind(item))
                            },
                          },
                          (copied === item.name ? t('copied') : t('copySkill')) +
                            (counts && Number.isFinite(Number(counts.adopt)) && Number(counts.adopt) > 0
                              ? ' ' + Number(counts.adopt)
                              : ''),
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'sf-reco-btn',
                            disabled: busy,
                            onClick: (event) => {
                              event.stopPropagation()
                              sendRecommendFeedback(item.name, 'good', topReasonKind(item))
                            },
                          },
                          '👍 ' +
                            t('good') +
                            (counts && Number.isFinite(Number(counts.good)) ? ' ' + Number(counts.good) : ''),
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'sf-reco-btn',
                            disabled: busy,
                            onClick: (event) => {
                              event.stopPropagation()
                              sendRecommendFeedback(item.name, 'bad', topReasonKind(item))
                            },
                          },
                          '👎 ' +
                            t('bad') +
                            (counts && Number.isFinite(Number(counts.bad)) ? ' ' + Number(counts.bad) : ''),
                        ),
                      ),
                    )
                  }),
                )
              : null,
            !loading && !error && filtered.length === 0
              ? h('div', { className: 'sf-empty' }, t('empty'))
              : null,
            !loading && !error
              ? filtered.map((skill) =>
                  h(SkillCard, {
                    key: skill.name,
                    skill,
                    t,
                    expanded: expanded === skill.name,
                    copied: copied === skill.name,
                    onToggle: () => setExpanded((current) => (current === skill.name ? null : skill.name)),
                    onCopy: copyName,
                  }),
                )
              : null,
          ),
          h(
            'footer',
            { className: 'sf-foot' },
            data
              ? h(
                  'div',
                  { className: 'sf-meta' },
                  h('span', null, data.scope && String(data.scope).indexOf('session') === 0 ? t('scopeSession') : String(data.scope).indexOf('scan') === 0 ? t('scopeScan') : t('scopeGlobal')),
                )
              : null,
            showCreate
              ? h(
                  'form',
                  { className: 'sf-create', onSubmit: submitCreate },
                  h('div', { className: 'sf-create-title' }, t('create')),
                  h('div', { className: 'sf-create-hint' }, t('createHint')),
                  h('input', {
                    className: 'sf-input',
                    value: form.name,
                    placeholder: t('namePlaceholder'),
                    'aria-label': t('name'),
                    onChange: setField('name'),
                  }),
                  h('textarea', {
                    className: 'sf-input sf-textarea',
                    value: form.description,
                    placeholder: t('descriptionPlaceholder'),
                    'aria-label': t('description'),
                    onChange: setField('description'),
                  }),
                  h('textarea', {
                    className: 'sf-input sf-textarea',
                    value: form.whenToUse,
                    placeholder: t('whenToUsePlaceholder'),
                    'aria-label': t('whenToUse'),
                    onChange: setField('whenToUse'),
                  }),
                  createError
                    ? h('div', { className: 'sf-create-error' }, t('createFailed') + ': ' + createError)
                    : null,
                  createdPath
                    ? h('div', { className: 'sf-create-ok' }, t('created') + createdPath)
                    : null,
                  h(
                    'div',
                    { className: 'sf-create-actions' },
                    h('button', { type: 'submit', className: 'sf-primary', disabled: createBusy }, createBusy ? t('creating') : t('createBtn')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sf-secondary',
                        onClick: () => {
                          setShowCreate(false)
                          setCreateError(null)
                          setCreatedPath(null)
                        },
                      },
                      t('cancel'),
                    ),
                  ),
                )
              : h(
                  'button',
                  { type: 'button', className: 'sf-new-btn', onClick: () => setShowCreate(true) },
                  '+ ' + t('create'),
                ),
          ),
          view !== 'skills'
            ? h(
                'div',
                { className: 'sf-subview' },
                view === 'discover' ? renderDiscover() : view === 'tools' ? renderTools() : renderLibrary(),
              )
            : null,
          ),
        ),
      )
    }

    const CSS = `
.sf-trigger{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;cursor:pointer;font:inherit;font-size:12px;line-height:1;transition:background .12s,color .12s,border-color .12s}
.sf-trigger:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.sf-trigger-open{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.sf-trigger-label{white-space:nowrap}
.sf-backdrop{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.38);pointer-events:auto}
.sf-drawer{position:fixed;top:0;right:0;bottom:0;z-index:71;display:flex;flex-direction:column;width:min(404px,94vw);background:var(--dsw-alias-bg-layer-1);border-left:1px solid var(--dsw-alias-border-l1);box-shadow:-18px 0 40px rgba(0,0,0,.22);color:var(--dsw-alias-label-primary);pointer-events:auto}
.sf-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 18px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.sf-head-main{min-width:0}
.sf-title-row{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;line-height:1.45;overflow-wrap:anywhere}
.sf-subtitle{margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5}
.sf-head-actions{display:flex;gap:4px}
.sf-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.sf-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
".sf-chips{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:0 18px 8px}
.sf-chip{padding:2px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;cursor:pointer}
.sf-chip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.sf-chip-active{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.sf-tabs{display:flex;gap:4px;padding:8px 18px 0}
.sf-tab{padding:5px 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.sf-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.sf-tab-active{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.sf-subview{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1)}
.sf-subhead{display:flex;align-items:center;gap:8px;padding:14px 14px 8px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.sf-subhead strong{flex:1;font-size:14px}
.sf-subhead .sf-secondary{height:26px;font-size:10px;padding:0 8px}
.sf-subhint{padding:0 18px 6px;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.5}
.sf-remote-card{padding:10px;margin-bottom:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2)}
.sf-remote-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sf-remote-meta{color:var(--dsw-alias-label-secondary);font-size:10px;margin-top:4px;overflow-wrap:anywhere}
.sf-remote-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:8px}
.sf-remote-actions .sf-secondary,.sf-remote-actions .sf-primary{height:26px;font-size:10px;padding:0 8px}
.sf-remote-link{display:block;color:var(--dsw-alias-brand-primary);font-size:10px;margin-top:4px;overflow-wrap:anywhere}
.sf-preview{margin-top:10px;padding:10px;border:1px solid var(--dsw-alias-brand-primary);border-radius:10px;background:var(--dsw-alias-bg-layer-2)}
.sf-preview-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:12px}
.sf-preview-code{max-height:240px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.5;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);padding:8px;border-radius:6px;margin:0 0 8px}
.sf-update-note,.sf-install-note{padding:0 18px 8px;font-size:10px;color:var(--dsw-alias-label-secondary);line-height:1.5;overflow-wrap:anywhere}
.sf-install-note{color:var(--dsw-alias-state-success-primary)}
.sf-toolbar{display:flex;align-items:center;gap:10px;padding:12px 18px}
.sf-modebar{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 18px 8px}
.sf-mode-label{color:var(--dsw-alias-label-secondary);font-size:10px;margin-right:2px}
.sf-mode{padding:3px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer}
.sf-mode:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.sf-mode-active{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.sf-mode:disabled{opacity:.55;cursor:default}
.sf-mode-hint{color:var(--dsw-alias-label-secondary);font-size:10px;margin-left:2px}
.sf-xp{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 18px 10px}
.sf-xp-label{color:var(--dsw-alias-state-success-primary);font-size:11px;font-weight:600;margin-right:2px}
.sf-xp-chip{padding:2px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
.sf-xp-last{color:var(--dsw-alias-label-secondary);font-size:10px;opacity:.85;overflow-wrap:anywhere}
.sf-feedback{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 18px 10px}
.sf-feedback-outcome{color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.45;max-width:100%;overflow-wrap:anywhere}
.sf-fb{padding:2px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;cursor:pointer}
.sf-fb:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.sf-fb-active{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.sf-fb:disabled{opacity:.55;cursor:default}
.sf-active{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0 18px 10px}
.sf-active-label{color:var(--dsw-alias-brand-primary);font-size:11px;font-weight:600;margin-right:2px}
.sf-active-chip{padding:2px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
.sf-reco{margin:0 0 10px;padding:10px 10px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-base)}
.sf-reco-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:11px;font-weight:600}
.sf-reco-context{margin:-2px 0 7px;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.45;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-reco-hint{color:var(--dsw-alias-label-secondary);font-size:10px;font-weight:400}
.sf-reco-item{display:grid;grid-template-columns:1fr auto;gap:2px 8px;width:100%;padding:7px 8px;margin:0 0 4px;border:1px solid transparent;border-left:2px solid var(--dsw-alias-brand-primary);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;font:inherit;cursor:pointer}
.sf-reco-item:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1);border-left-color:var(--dsw-alias-brand-primary)}
.sf-reco-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:600;overflow-wrap:anywhere}
.sf-reco-score{color:var(--dsw-alias-brand-primary);font-size:10px}
.sf-reco-reasons{grid-column:1/-1;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.4;overflow-wrap:anywhere}
.sf-reco-intro{grid-column:1/-1;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-input{flex:1;min-width:0;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;outline:none}
.sf-input:focus{border-color:var(--dsw-alias-brand-primary)}
.sf-textarea{height:64px;padding:8px 10px;resize:vertical;line-height:1.5}
.sf-count{flex:none;color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap}
.sf-list{flex:1;overflow-y:auto;padding:0 18px 12px}
.sf-card{position:relative;padding:12px 12px 34px;margin-bottom:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:border-color .12s,background .12s}
.sf-card:hover{border-color:var(--dsw-alias-border-l2)}
.sf-card-open{border-color:var(--dsw-alias-brand-primary)}
.sf-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sf-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.sf-source{flex:none;padding:2px 7px;border-radius:999px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.4}
.sf-desc{margin:7px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sf-card-open .sf-desc{-webkit-line-clamp:unset;display:block}
.sf-when{margin:7px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.55}
.sf-when-label{margin-right:6px;color:var(--dsw-alias-brand-primary);font-weight:600}
.sf-detail{margin-top:9px;padding-top:9px;border-top:1px dashed var(--dsw-alias-border-l1);font-size:11px;color:var(--dsw-alias-label-secondary)}
.sf-path{display:flex;gap:6px;margin-top:5px;overflow-wrap:anywhere}
.sf-path code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.sf-detail-label{margin-right:6px;color:var(--dsw-alias-label-secondary);opacity:.8}
.sf-flags{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:5px}
.sf-flag{padding:1px 6px;border-radius:6px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);font-size:10px}
.sf-cat{float:right;margin-left:8px;padding:1px 6px;border-radius:6px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.sf-copy{position:absolute;right:10px;bottom:9px;padding:2px 6px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;cursor:pointer}
.sf-copy:hover{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-border-l1)}
.sf-empty{padding:28px 10px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}
.sf-error{color:var(--dsw-alias-state-error-primary)}
.sf-foot{flex:none;padding:10px 18px 14px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.sf-meta{color:var(--dsw-alias-label-secondary);font-size:10px;margin-bottom:6px}
.sf-new-btn{width:100%;height:32px;border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.sf-new-btn:hover{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.sf-create{display:flex;flex-direction:column;gap:7px;max-height:44vh;overflow-y:auto;padding-right:2px}
.sf-create-title{font-size:13px;font-weight:600}
.sf-create-hint{color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.5}
.sf-create-actions{display:flex;gap:8px;margin-top:2px}
.sf-primary,.sf-secondary{height:30px;padding:0 12px;border-radius:7px;font:inherit;font-size:12px;cursor:pointer}
.sf-primary{border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:#fff}
.sf-primary:disabled{opacity:.55;cursor:default}
.sf-secondary{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary)}
.sf-secondary:hover{background:var(--dsw-alias-bg-layer-2)}
.sf-create-error{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:1.5}
.sf-create-ok{color:var(--dsw-alias-state-success-primary);font-size:10px;line-height:1.5;overflow-wrap:anywhere}
.sf-suggest{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:0 18px 10px}
.sf-suggest .sf-chip:disabled{opacity:.55;cursor:default}
.sf-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-top:6px}
.sf-badge{padding:1px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.5}
.sf-badge.sf-sec{font-weight:600}
.sf-badge.sf-sec-low{color:var(--dsw-alias-state-success-primary)}
.sf-badge.sf-sec-medium{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.sf-badge.sf-sec-high{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.sf-findings{display:flex;flex-direction:column;gap:2px;margin-top:5px}
.sf-findings-label{color:var(--dsw-alias-label-secondary);opacity:.8;font-size:10px;margin-bottom:1px}
.sf-finding{font-size:10px;line-height:1.45;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.sf-finding-rule{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-primary)}
.sf-finding-line{opacity:.85}
.sf-preview-meta{margin:0 0 8px}
.sf-reco-badges{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
.sf-reco-badge{padding:1px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.5}
.sf-reco-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
.sf-reco-btn{padding:1px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;cursor:pointer}
.sf-reco-btn:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.sf-reco-btn:disabled{opacity:.55;cursor:default}
.sf-updates{flex:none;margin:0 18px 10px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base);max-height:38vh;overflow-y:auto}
.sf-updates-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.sf-updates-head .sf-secondary{height:24px;font-size:10px;padding:0 8px}
.sf-updates-head .sf-secondary:disabled{opacity:.55;cursor:default}
.sf-update-item{margin-top:8px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l1)}
.sf-update-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.sf-update-diff{color:var(--dsw-alias-brand-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
.sf-update-error{font-size:10px;line-height:1.5;margin-top:6px;overflow-wrap:anywhere}
.sf-update-ok{font-size:10px;color:var(--dsw-alias-state-success-primary);line-height:1.5;margin-top:6px;overflow-wrap:anywhere}
.sf-diff{margin-top:5px;padding:5px 6px;border-radius:6px;background:var(--dsw-alias-bg-layer-2);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.5;max-height:86px;overflow:auto}
.sf-diff-line{white-space:pre-wrap;overflow-wrap:anywhere}
.sf-diff-add{color:var(--dsw-alias-state-success-primary)}
.sf-diff-del{color:var(--dsw-alias-state-error-primary)}
.sf-update-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:6px}
.sf-update-actions .sf-secondary{height:24px;font-size:10px;padding:0 8px}
.sf-update-actions .sf-secondary:disabled{opacity:.55;cursor:default}
.sf-xp-tools{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;margin-left:auto}
.sf-xp-tools .sf-fb:disabled{opacity:.55;cursor:default}
.sf-xp-status{padding:0 18px 8px;font-size:10px;line-height:1.5;overflow-wrap:anywhere}
.sf-ok{color:var(--dsw-alias-state-success-primary)}
.sf-xp-table{margin:0 18px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}
.sf-xp-row{display:grid;grid-template-columns:minmax(0,1fr) 40px 52px 62px;gap:6px;padding:4px 8px;font-size:10px;line-height:1.5;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.sf-xp-row:first-child{border-top:0}
.sf-xp-row span{overflow-wrap:anywhere;text-align:right}
.sf-xp-row span:first-child{text-align:left}
.sf-xp-row-head{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:600}
.sf-xp-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.sf-health{margin:0 18px 12px;font-size:10px}
.sf-health-title{color:var(--dsw-alias-label-secondary);font-weight:600;margin-bottom:4px}
.sf-health-row{display:flex;gap:6px;line-height:1.5;margin-top:2px;overflow-wrap:anywhere}
.sf-health-label{flex:none;color:var(--dsw-alias-label-secondary);opacity:.85}
.sf-health-names{color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
@media (max-width:640px){.sf-trigger-label{display:none}.sf-drawer{width:100%}}
`

    window.__SkillFactory = { store }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeCtx = ctx
        const localeDisposers = [
          ctx.locale.register('ronge-adaptive-skill-archive', 'zh', dictZh),
          ctx.locale.register('ronge-adaptive-skill-archive', 'zh-CN', dictZh),
          ctx.locale.register('ronge-adaptive-skill-archive', 'zh-Hans', dictZh),
          ctx.locale.register('ronge-adaptive-skill-archive', 'en', dictEn),
          ctx.locale.register('ronge-adaptive-skill-archive', 'en-US', dictEn),
        ]
        ctx.effect(() => () => {
          for (const dispose of localeDisposers) dispose()
        })

        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'ronge-adaptive-skill-archive',
              order: -3,
            },
            SkillButton,
          ),
        )

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'ronge-adaptive-skill-archive-drawer',
              order: 30,
            },
            SkillDrawer,
          ),
        )
      },
    }
  },
})
