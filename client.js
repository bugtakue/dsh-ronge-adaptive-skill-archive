window.__ModuleLoader__.load({
  id: 'dsh-skill-studio',
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
      trigger: '技能',
      open: '打开技能工厂',
      title: '技能工作室',
      subtitle: '上下文感知推荐 · 正在使用 · 一键新建',
      recommend: '推荐',
      recommendHint: '根据当前会话内容',
      basedOn: '基于：',
      noRecommend: '暂无推荐，先聊几句或点刷新',
      activeNow: '正在使用',
      recentUsed: '最近使用',
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
    }

    const dictEn = {
      trigger: 'Skills',
      open: 'Open Skill Factory',
      title: 'Skill Studio',
      subtitle: 'Context-aware recommendations, active skills, one-click create',
      recommend: 'Recommended',
      recommendHint: 'From the current session',
      basedOn: 'Based on: ',
      noRecommend: 'No recommendation yet — chat a little, then refresh',
      activeNow: 'In use',
      recentUsed: 'Recently used',
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
      return localeCtx.locale.bind('skill-studio')
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
        h('p', { className: 'sf-desc' }, skill.description),
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
          const suffix = sessionId ? '?sessionId=' + encodeURIComponent(sessionId) : ''
          const response = await fetch('/skill-studio/catalog.json' + suffix, {
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
      const normalized = query.trim().toLowerCase()
      const filtered = normalized
        ? skills.filter((skill) =>
            [skill.name, skill.description, skill.whenToUse]
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

      const submitCreate = async (event) => {
        event.preventDefault()
        setCreateBusy(true)
        setCreateError(null)
        setCreatedPath(null)
        try {
          const response = await fetch('/skill-studio/create', {
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

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h('div', { className: 'sf-backdrop', onClick: close }),
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
                  recommendations.map((item) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        key: item.name,
                        className: 'sf-reco-item',
                        onClick: () => {
                          setQuery(item.name)
                          setExpanded(item.name)
                        },
                      },
                      h('span', { className: 'sf-reco-name' }, item.name),
                      h('span', { className: 'sf-reco-score' }, String(item.score ?? '')),
                      h('span', { className: 'sf-reco-reasons' }, (item.reasons || []).join(' · ')),
                    ),
                  ),
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
.sf-title-row{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600}
.sf-subtitle{margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5}
.sf-head-actions{display:flex;gap:4px}
.sf-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.sf-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.sf-toolbar{display:flex;align-items:center;gap:10px;padding:12px 18px}
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
@media (max-width:640px){.sf-trigger-label{display:none}.sf-drawer{width:100%}}
`

    window.__SkillFactory = { store }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeCtx = ctx
        const localeDisposers = [
          ctx.locale.register('skill-studio', 'zh', dictZh),
          ctx.locale.register('skill-studio', 'zh-CN', dictZh),
          ctx.locale.register('skill-studio', 'zh-Hans', dictZh),
          ctx.locale.register('skill-studio', 'en', dictEn),
          ctx.locale.register('skill-studio', 'en-US', dictEn),
        ]
        ctx.effect(() => () => {
          for (const dispose of localeDisposers) dispose()
        })

        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'skill-studio',
              order: -3,
            },
            SkillButton,
          ),
        )

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'skill-studio-drawer',
              order: 30,
            },
            SkillDrawer,
          ),
        )
      },
    }
  },
})
