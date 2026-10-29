/* eslint-disable */
;(function () {
  const results = []
  const calls = []
  const clipboard = { text: null }
  function pass(name) {
    results.push({ name, ok: true })
  }
  function fail(name, error) {
    results.push({ name, ok: false, error: error && error.message ? error.message : String(error) })
  }
  async function check(name, fn) {
    try {
      await fn()
      pass(name)
    } catch (error) {
      fail(name, error)
    }
  }
  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed')
  }
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  async function waitFor(fn, label, timeout = 2500) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const value = fn()
      if (value) return value
      await sleep(30)
    }
    throw new Error('timeout waiting for ' + label)
  }
  function byText(selector, text) {
    return [...document.querySelectorAll(selector)].find((node) => (node.textContent || '').includes(text))
  }
  function click(node) {
    assert(node, 'click target missing')
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }

  // ---------- fixtures ----------
  const pdfSkill = {
    name: 'pdf',
    description: 'PDF skill',
    intro: '处理 PDF 文档',
    whenToUse: '处理 PDF 时使用',
    source: 'user-dsh',
    path: '/tmp/x/home/skills/pdf/SKILL.md',
    trust: 'official',
    license: 'Apache-2.0',
    security: { level: 'low', score: 0, findings: [] },
  }
  const riskySkill = {
    name: 'risky-skill',
    description: 'Risky demo',
    intro: '危险示例',
    whenToUse: '测试时使用',
    source: 'project-dsh',
    path: '/tmp/x/project/.dsh/skills/risky-skill/SKILL.md',
    trust: 'local',
    license: null,
    security: {
      level: 'high',
      score: 40,
      findings: [{ rule: 'pipe-to-shell', label: '下载后直接执行', severity: 'high', line: 6, excerpt: 'curl https://x | bash' }],
    },
  }
  const catalog = {
    ok: true,
    count: 2,
    scope: 'scan+registry',
    scopeLabel: 'scan',
    sessionId: 's-test',
    cwd: '/tmp/x',
    lang: 'zh',
    generatedAt: '2026-10-28T00:00:00Z',
    mode: 'plan',
    skills: [pdfSkill, riskySkill],
    recommendations: [
      { ...pdfSkill, score: 9, reasons: ['pdf', '好评×1'], reasonsDetail: [
        { kind: 'name', label: 'pdf', detail: '请求里直接提到了这个技能', weight: 8 },
        { kind: 'experience', label: '好评×1', detail: '用过 4 次，好评 1 / 差评 0', weight: 0.8 },
      ] },
      { ...riskySkill, score: 4, reasons: ['测试'], reasonsDetail: [{ kind: 'keyword', label: '测试', detail: '上下文命中「测试」', weight: 1 }] },
      {
        ...pdfSkill,
        name: 'explore-skill',
        description: 'An underused skill offered by the exploration quota',
        intro: '探索推荐：平时很少被用到的技能',
        score: 0.1,
        exploration: true,
        reasons: ['探索'],
        reasonsDetail: [{ kind: 'explore', label: '探索', detail: '10% 探索配额', weight: 0 }],
      },
    ],
    activeSkills: [pdfSkill],
    recentSkills: [],
    activeCombo: {
      source: 'active',
      label: 'active',
      mode: 'plan',
      names: ['pdf', 'risky-skill'],
      skills: [
        { name: 'pdf', rating: 5, category: 'office', reason: 'pdf · 好评×1' },
        { name: 'risky-skill', rating: null, category: 'other', reason: '测试' },
      ],
      rating: 5,
      ratedSkills: 1,
      why: 'pdf: pdf · 好评×1  /  risky-skill: 测试',
      key: 'active:7:pdf+risky-skill',
      turn: 7,
      changedAt: '2026-10-28T00:00:00Z',
      contextPreview: '帮我处理 pdf',
    },
    betterOptions: [{
      name: 'pdf-forms',
      description: 'Fill, merge and extract PDF forms with a tested workflow.',
      intro: '更优的 PDF 表单/合并/抽取技能',
      category: 'office',
      categoryLabel: '办公文档',
      rating: 4.9,
      quality: 88,
      qualityLabel: 'high',
      trust: 'verified',
      rawUrl: 'https://raw.githubusercontent.com/example/pdf-forms/HEAD/SKILL.md',
      url: 'https://raw.githubusercontent.com/example/pdf-forms/HEAD/SKILL.md',
      repo: 'example/pdf-forms',
      path: 'skills/pdf-forms',
      matched: ['pdf', 'form', 'extract'],
      score: 18.4,
      gain: 7.2,
      autoSafe: true,
      whyBetter: '命中 3 个上下文关键词（评分 4.9）；已装的 pdf 命中 1 个',
      compareTo: { name: 'pdf', score: 8.2, hits: 1 },
      installed: false,
    }],
    discoveries: [{
      name: 'open-video-harness',
      description: 'Make videos with code through the OpenVideoHarness workbench.',
      intro: '视频生成：用代码做产品发布片、知识短片和动画',
      category: 'video',
      categoryLabel: '视频',
      rating: 3.8,
      quality: 62,
      qualityLabel: 'medium',
      trust: 'community',
      rawUrl: 'https://raw.githubusercontent.com/example/open-video-harness/HEAD/SKILL.md',
      url: 'https://raw.githubusercontent.com/example/open-video-harness/HEAD/SKILL.md',
      repo: 'example/open-video-harness',
      path: 'skills/open-video-harness',
      installed: false,
    }],
    running: true,
    contextPreview: '帮我处理 pdf',
    contextWindow: { messages: 9, files: 12 },
    evolution: {
      weights: { token: 1, name: 8.8, category: 0.6, experience: 1, completion: 1 },
      defaults: { token: 1, name: 8, category: 0.6, experience: 1, completion: 1 },
      bounds: { token: [0.5, 2], name: [4, 14], category: [0.2, 1.5], experience: [0.4, 2] },
      contentLabels: { token: '关键词', name: '名称', category: '类别', experience: '经验' },
      stats: { exposures: 12, tasks: 3, observations: 10, good: 9, bad: 1, successRate: 0.9 },
      observationsSinceEval: 0,
      lastEvaluatedAt: '2026-10-28T00:00:00Z',
      recentHistory: [{
        at: '2026-10-28T00:00:00Z',
        reason: 'auto',
        changes: [{ kind: 'name', weight: 'name', label: '名称', from: 8, to: 8.8, rate: 0.9, sample: 10, reason: '好评为 9/10' }],
      }],
      canRollback: true,
      path: '/tmp/x/evolution.json',
      explorationRate: 0.1,
      explorationBounds: [0, 0.3],
      categoryWeights: { video: 1.2, office: 0.9, harness: 1.1, other: 1 },
      categoryLabels: { video: '视频/动效', office: '办公文档', harness: 'Harness 插件', other: '通用' },
      categoryBounds: [0.5, 2],
      learning: { skillsTracked: 3, avgAffinity: 0.62, exploredServed: 5, exploredRecommendations: 2, explorationAdopted: 1 },
      stats: Object.assign({}, {
        exposures: 12, tasks: 3, observations: 10, good: 9, bad: 1, successRate: 0.9,
        byCategory: { video: { good: 4, bad: 1 }, office: { good: 2, bad: 0 }, harness: { good: 3, bad: 0 }, other: { good: 0, bad: 0 } },
        exploration: { served: 5, attempts: 2, adopted: 1, good: 1, bad: 0 },
      }),
    },
    experience: {
      topSkills: [{ name: 'pdf', uses: 4, successes: 3, good: 1, bad: 0, successRate: 0.75, avgDurationMs: 2000, lastUsed: '2026-10-01T00:00:00Z', failureStreak: 0 }],
      recent: [{ id: 'e1', task: '处理 pdf', skills: ['pdf'], outcome: 'ok', rating: null }],
      totalEntries: 1,
      path: '/tmp/x/experience.md',
      health: {
        stale: [],
        failing: [{ name: 'pdf', bad: 2, failureStreak: 0 }],
        neverUsed: [],
        licenseUnknown: [{ name: 'risky-skill', trust: 'local' }],
        installed: 2,
      },
      recFeedback: { skills: { pdf: { adopt: 2, good: 1, bad: 0 } }, updatedAt: '2026-10-28T00:00:00Z' },
    },
  }
  const updates = {
    ok: true,
    checked: 2,
    updates: [
      {
        name: 'pdf',
        url: 'https://raw.githubusercontent.com/x/y/SKILL.md',
        license: 'Apache-2.0',
        risk: 'medium',
        diff: {
          added: 2,
          removed: 1,
          changedAtLine: 3,
          lines: [
            { type: '-', text: 'old instruction line' },
            { type: '+', text: 'new instruction line' },
            { type: '+', text: 'another new line' },
          ],
        },
      },
    ],
  }

  const intelligenceFail = { current: false }
  const intelligencePlanFixture = {
    ok: true,
    plan: {
      ok: true,
      goal: '会议录音 → 纪要 docx + 30 秒宣传片',
      pattern: 'sequential+review-gate',
      confidence: 0.78,
      stages: [
        {
          role: 'produce',
          skills: [{ name: 'office-docx', why: '生成可交付的 .docx 纪要' }],
          input: '录音转写文本',
          output: 'minutes.docx',
          handoff: '文稿文件',
          fallback: 'office-render 兜底导出',
        },
        {
          role: 'verify',
          skills: [{ name: 'office-render', why: '渲染检查版式与分页' }],
          input: 'minutes.docx',
          output: '校验结论',
          handoff: '校验结论',
        },
      ],
      missing: [
        {
          capability: 'meeting-minutes-template',
          domain: 'office',
          draftNeeded: true,
          suggestedLibrarySkills: [
            { name: 'meeting-notes', url: 'https://raw.githubusercontent.com/example/meeting-notes/HEAD/SKILL.md' },
          ],
        },
        {
          capability: 'evil-capability',
          domain: 'other',
          draftNeeded: false,
          suggestedLibrarySkills: [{ name: 'evil-skill', url: 'javascript:alert(1)' }],
        },
      ],
      conflicts: [],
      estimates: { tokenSavingPct: 35, steps: 6 },
      assumptions: ['录音已在本机', '宣传片素材来自会议录屏'],
    },
  }
  const intelligenceDraftFixture = {
    ok: true,
    draft: {
      name: 'meeting-minutes-template',
      description: '把会议录音整理成结构化会议纪要',
      whenToUse: '用户要求整理会议纪要、转写录音或输出 minutes 时',
      content:
        '---\nname: meeting-minutes-template\ndescription: "把会议录音整理成结构化会议纪要"\nwhenToUse: "用户要求整理会议纪要时"\n---\n\n# meeting-minutes-template\n\n## When to use\n\n会议纪要 / minutes\n',
      lint: { ok: false, issues: ['description 建议包含触发关键词'] },
      safety: { level: 'low', findings: [] },
      evalCases: ['把这段会议录音整理成纪要 docx', '给这份会议记录做一个模板'],
    },
  }

  const originalPrompt = window.prompt
  window.prompt = () => JSON.stringify({ version: 2, entries: [{ id: 'imp-1', skills: ['pdf'] }], skills: { pdf: { uses: 2 } } })
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: (text) => { clipboard.text = text; return Promise.resolve() }, readText: () => Promise.resolve(clipboard.text || '') },
  })

  window.fetch = async (url, options) => {
    const target = String(url)
    const method = (options && options.method) || 'GET'
    let body = null
    try { body = options && options.body ? JSON.parse(options.body) : null } catch {}
    calls.push({ url: target, method, body })
    const json = (payload) => ({ ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload) })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/catalog.json') === 0) return json(catalog)
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/recommend-feedback') === 0) return json({ ok: true, stats: { adopt: 3, good: 2, bad: 0 } })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/updates') === 0) return json(updates)
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/update-all') === 0) return json({ ok: true, checked: 2, updated: 1, failed: 0, results: [] })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/update') === 0) return json({ ok: true, name: 'pdf', changed: true, diff: updates.updates[0].diff })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/rollback') === 0) return json({ ok: true, name: 'pdf', restoredFrom: 'backup.md' })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/install') === 0) return json({ ok: true, name: 'pdf-forms', path: '/tmp/x/home/skills/pdf-forms/SKILL.md' })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover/preview') === 0) return json({ ok: true, content: 'x', trust: 'official', license: null, security: { level: 'high', score: 40, findings: [{ rule: 'pipe-to-shell', label: '下载后直接执行', severity: 'high', line: 6, excerpt: 'curl | bash' }] }, frontmatter: { name: 'x' } })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/discover?') === 0) return json({ ok: true, entries: [], total: 0 })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/experience/export') === 0) return json({ ok: true, payload: { version: 2, entries: [], skills: {}, recFeedback: {} } })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/experience/import') === 0) return json({ ok: true, addedEntries: 1, mergedSkills: 1, mergedFeedback: 0 })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/config') === 0) {
      return json({ ok: true, explorationRate: 0.2, snapshot: catalog.evolution })
    }
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/evaluate') === 0) return json({ ok: true, changed: 1, changes: [{ kind: 'name', weight: 'name', from: 8, to: 8.8 }], snapshot: catalog.evolution })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/rollback') === 0) return json({ ok: true, rolledBack: '2026-10-28T00:00:00Z', weights: { token: 1, name: 8, category: 0.6, experience: 1, completion: 1 } })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/reset') === 0) return json({ ok: true, weights: { token: 1, name: 8, category: 0.6, experience: 1, completion: 1 } })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/evolution') === 0) return json({ ok: true, ...catalog.evolution })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/mode') === 0) return json({ ok: true, mode: 'plan' })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/feedback') === 0) return json({ ok: true })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/tools?') === 0) return json({ ok: true, servers: [] })
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/library?') === 0) {
      const hideInstalled = target.includes('hideInstalled=1')
      const entries = [{
        name: 'pdf',
        description: 'PDF skill for text and forms',
        intro: 'PDF 处理：抽取文本/表格、填表、合并',
        category: 'ai',
        categoryLabel: 'AI',
        rating: 5,
        quality: 80,
        qualityLabel: 'high',
        stars: 42000,
        repo: 'anthropics/skills',
        path: 'skills/pdf',
        url: 'https://raw.githubusercontent.com/anthropics/skills/HEAD/skills/pdf/SKILL.md',
        rawUrl: 'https://raw.githubusercontent.com/anthropics/skills/HEAD/skills/pdf/SKILL.md',
        installed: false,
      }, {
        name: 'pdf-pro',
        description: 'Already installed PDF helper',
        intro: '已安装的 PDF 工具',
        category: 'ai',
        categoryLabel: 'AI',
        rating: 4.6,
        quality: 72,
        qualityLabel: 'medium',
        repo: 'example/pdf-pro',
        path: 'skills/pdf-pro',
        url: 'https://raw.githubusercontent.com/example/pdf-pro/HEAD/SKILL.md',
        rawUrl: 'https://raw.githubusercontent.com/example/pdf-pro/HEAD/SKILL.md',
        installed: true,
      }]
      const filtered = hideInstalled ? entries.filter((entry) => !entry.installed) : entries
      return json({
        ok: true,
        total: filtered.length,
        categories: { ai: 2 },
        categoryLabels: { ai: 'AI', coding: '编程' },
        generatedAt: '2026-10-28T00:00:00Z',
        entries: filtered,
      })
    }
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/intelligence/') === 0) {
      if (intelligenceFail.current) {
        return {
          ok: false,
          status: 503,
          json: async () => ({ ok: false, error: 'intelligence engine unavailable' }),
          text: async () => JSON.stringify({ ok: false, error: 'intelligence engine unavailable' }),
        }
      }
      if (target.indexOf('/intelligence/draft') >= 0) return json(intelligenceDraftFixture)
      return json(intelligencePlanFixture)
    }
    if (target.indexOf('/dsh-ronge-adaptive-skill-archive/create') === 0) {
      const name = body && body.name ? String(body.name) : 'new-skill'
      return json({ ok: true, name, path: '/tmp/x/home/skills/' + name + '/SKILL.md' })
    }
    return json({ ok: false, error: 'unmocked ' + target })
  }

  // ---------- boot ----------
  try { window.localStorage.setItem('ronge.autoInstallBetter', '1') } catch {}
  const React = window.React
  const def = window.__SKILL_DEF
  assert(def && typeof def.factory === 'function', 'module loader captured factory')
  const mod = def.factory((name) => {
    if (name === 'react') return React
    throw new Error('unexpected require: ' + name)
  })
  assert(mod && typeof mod.apply === 'function', 'factory returns apply()')

  const dicts = {}
  const slots = {}
  const fakeCtx = {
    locale: {
      register(scope, lang, dict) { dicts[lang] = dict; return () => {} },
      subscribe() { return () => {} },
      bind() { return (key) => (dicts.zh && dicts.zh[key]) || key },
      getLocale() { return { active: 'zh' } },
    },
    slots: {
      inject(name, fn) { fn() },
      register(meta, component) { slots[meta.id] = component; return () => {} },
    },
    effect(fn) { fn(); return () => {} },
  }
  mod.apply(fakeCtx)
  assert(slots['dsh-ronge-adaptive-skill-archive'] && slots['dsh-ronge-adaptive-skill-archive-drawer'], 'both slots registered')

  const store = window.__SkillFactory.store
  store.set({ open: true, sessionId: 's-test' })
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    React.createElement('div', null,
      React.createElement(slots['dsh-ronge-adaptive-skill-archive'], { sessionId: 's-test' }),
      React.createElement(slots['dsh-ronge-adaptive-skill-archive-drawer'], null),
    ),
  )

  // ---------- assertions ----------
  ;(async function run() {
    try {
      try {
        await waitFor(() => document.querySelector('.sf-reco'), 'catalog rendered')
      } catch (error) {
        const dom = (document.querySelector('.sf-drawer-error') || document.body).innerText || ''
        throw new Error(error.message + ' | DOM: ' + dom.slice(0, 600))
      }
      await check('recommendation cards render structured reason badges', async () => {
        const reco = document.querySelectorAll('.sf-reco-item')
        assert(reco.length >= 2, 'expected 2 recommendation cards, got ' + reco.length)
        assert(document.querySelectorAll('.sf-reco-badge').length >= 2, 'expected reason badges')
        assert((document.body.textContent || '').includes('pdf'), 'pdf card rendered')
      })
      await check('skill card expansion shows trust/license/security + findings', async () => {
        const riskyCard = [...document.querySelectorAll('.sf-card')].find((card) => (card.textContent || '').includes('risky-skill'))
        assert(riskyCard, 'risky-skill card exists')
        click(riskyCard)
        await waitFor(() => document.querySelector('.sf-card-open .sf-detail'), 'detail opened')
        const detail = document.querySelector('.sf-card-open .sf-detail')
        assert((detail.textContent || '').includes('Apache-2.0') || (detail.textContent || '').includes('high') || (detail.textContent || '').includes('高'), 'detail shows security/license info')
        assert((detail.textContent || '').includes('pipe-to-shell') || (detail.textContent || '').includes('下载后直接执行'), 'finding rendered')
      await check('current combo bar shows names, rating and why', async () => {
        const combo = await waitFor(() => document.querySelector('.sf-combo'), 'combo bar')
        const text = combo.textContent || ''
        assert(text.includes('当前组合'), 'combo title')
        assert(text.includes('运行中'), 'combo kind')
        assert(text.includes('pdf × risky-skill'), 'combo names')
        assert(text.includes('★ 5.0'), 'combo rating')
        assert(text.includes('为什么'), 'combo why label')
        const hint = document.querySelector('.sf-reco-context-meta')
        assert(hint && (hint.textContent || '').includes('9'), 'context window message count')
        assert((hint.textContent || '').includes('12'), 'context window file count')
      })
      await check('better block proposes a stronger uninstalled skill and auto-installs it', async () => {
        const block = await waitFor(() => document.querySelector('.sf-better'), 'better block')
        const text = block.textContent || ''
        assert(text.includes('发现更优的未装技能'), 'better title')
        assert(text.includes('pdf-forms'), 'better candidate')
        assert(text.includes('命中关键词'), 'matched keywords')
        assert(text.includes('安装并使用') || text.includes('已安装'), 'install action')
        assert(text.includes('自动安装更优'), 'auto install toggle')
        await waitFor(
          () => calls.some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/install') === 0),
          'auto install call',
        )
      })
      await check('discovery block suggests uninstalled library skills', async () => {
        const block = await waitFor(() => document.querySelector('.sf-discoveries'), 'discoveries block')
        const text = block.textContent || ''
        assert(text.includes('库里还没装的'), 'discovery title')
        assert(text.includes('open-video-harness'), 'discovery entry')
        const installBtn = [...block.querySelectorAll('button')].find((btn) => (btn.textContent || '').trim() === '安装')
        assert(installBtn, 'install action')
        click(installBtn)
        await waitFor(() => {
          const card = document.querySelector('.sf-discovery-card')
          return card && (card.innerText || '').includes('已安装')
        }, 'install success status')
        const previewBtn = [...block.querySelectorAll('button')].find((btn) => (btn.textContent || '').trim() === '预览')
        assert(previewBtn, 'preview action')
        click(previewBtn)
        await waitFor(() => document.querySelector('.sf-preview'), 'preview modal')
      })
      await check('top-2 suggestion chips render', async () => {
        const chips = document.querySelectorAll('.sf-suggest .sf-chip')
        assert(chips.length === 2, 'expected 2 chips, got ' + chips.length)
        assert((chips[0].textContent || '').includes('pdf'), 'first chip is pdf')
      })
      await check('chip click copies /skill command and reports adopt', async () => {
        const before = calls.length
        click(document.querySelector('.sf-suggest .sf-chip'))
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/recommend-feedback') === 0), 'adopt feedback')
        const feedback = calls.slice(before).find((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/recommend-feedback') === 0)
        assert(clipboard.text === '/skill pdf', 'clipboard = ' + clipboard.text)
        assert(feedback.body && feedback.body.verdict === 'adopt', 'verdict adopt')
        assert(feedback.body.skillName === 'pdf', 'skillName pdf')
      })
      await check('👍 button posts good feedback', async () => {
        const goodBtn = await waitFor(() => {
          const card = document.querySelector('.sf-reco-item')
          if (!card) return null
          const btn = [...card.querySelectorAll('.sf-reco-btn')].find((item) => (item.textContent || '').indexOf('👍') >= 0)
          return btn && !btn.disabled ? btn : null
        }, 'enabled good button')
        const before = calls.length
        click(goodBtn)
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/recommend-feedback') === 0), 'good feedback')
        const feedback = calls.slice(before).find((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/recommend-feedback') === 0)
        assert(feedback.body.verdict === 'good', 'verdict good')
      })
      })
      await check('experience table and health block render', async () => {
        const rows = document.querySelectorAll('.sf-xp-row')
        assert(rows.length >= 2, 'expected header + 1 stat row, got ' + rows.length)
        assert((document.body.textContent || '').includes('技能健康'), 'health title')
        assert(document.querySelectorAll('.sf-health-row').length >= 1, 'health rows')
      })
      await check('self-evolution block renders weights, rate and history', async () => {
        const text = document.body.innerText || ''
        assert(text.includes('自进化'), 'evolution title')
        assert(text.includes('当前权重'), 'weights label')
        assert(text.includes('名称 ×8.8'), 'name weight chip')
        assert(text.includes('反馈成功率'), 'rate label')
        assert(text.includes('90%'), 'success rate value')
        assert(text.includes('名称 8 → 8.8'), 'history row')
        assert(byText('button', '立即评估'), 'evaluate button')
        assert(byText('button', '回滚'), 'rollback button')
        assert(byText('button', '重置'), 'reset button')
      })
      await check('evaluate button posts to evolution endpoint and shows notice', async () => {
        const before = calls.length
        click(byText('button', '立即评估'))
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/evaluate') === 0), 'evolution evaluate call')
        await waitFor(() => (byText('.sf-evolution .sf-xp-status', '已评估') || null), 'evolution notice')
      })
      await check('exploration quota block renders and exploration card is marked', async () => {
        const quota = document.querySelector('.sf-quota')
        assert(quota, 'quota block rendered')
        assert((quota.textContent || '').includes('探索配额'), 'quota title')
        assert((quota.textContent || '').includes('10%'), 'current quota 10%')
        const exploreCard = document.querySelector('.sf-reco-explore')
        assert(exploreCard, 'exploration recommendation card rendered')
        assert((exploreCard.textContent || '').includes('探索'), 'exploration badge')
      })
      await check('quota segmented posts to evolution config', async () => {
        const quota = document.querySelector('.sf-quota')
        const option = [...quota.querySelectorAll('button')].find((btn) => (btn.textContent || '').trim() === '20%')
        assert(option, '20% option')
        const before = calls.length
        click(option)
        await waitFor(
          () => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/config') === 0),
          'config call',
        )
        const call = calls.slice(before).find((entry) => entry.url.indexOf('/dsh-ronge-adaptive-skill-archive/evolution/config') === 0)
        assert(call.body && call.body.explorationRate === 0.2, 'explorationRate 0.2 sent')
      })
      await check('import experience posts payload and shows status', async () => {
        const before = calls.length
        const importBtn = byText('button', '导入经验')
        assert(importBtn, 'import button')
        click(importBtn)
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/experience/import') === 0), 'import call')
        const call = calls.slice(before).find((entry) => entry.url.indexOf('/dsh-ronge-adaptive-skill-archive/experience/import') === 0)
        assert(call.body && call.body.payload && call.body.payload.version === 2, 'payload sent')
        await waitFor(() => (document.querySelector('.sf-xp-status') || {}).textContent, 'import status')
        assert((document.querySelector('.sf-xp-status').textContent || '').length > 0, 'status line set')
      })
      await check('export experience triggers a JSON download request', async () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const before = calls.length
          click(byText('button', '导出经验'))
          try {
            await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/experience/export') === 0), 'export call', 600)
            return
          } catch (error) {
            await sleep(200)
          }
        }
        throw new Error('export call never fired')
        await waitFor(() => (document.querySelector('.sf-xp-status') || {}).textContent, 'export status')
        assert((document.querySelector('.sf-xp-status').textContent || '').includes('导出') || (document.querySelector('.sf-xp-status').textContent || '').includes('export'), 'export status text')
      })
      await check('library tab renders Chinese intro and labels without crashing', async () => {
        const tab = [...document.querySelectorAll('.sf-tab')].find((node) => (node.textContent || '').includes('卷轴馆'))
        assert(tab, 'library tab exists')
        const before = calls.length
        click(tab)
        await waitFor(() => document.querySelector('.sf-subview .sf-remote-card'), 'library cards')
        const text = document.querySelector('.sf-subview').innerText || ''
        assert(text.includes('PDF 处理'), 'Chinese intro rendered')
        assert(text.includes('AI 5') || text.includes('AI'), 'Chinese category label rendered')
        assert(text.includes('信号分'), 'signal label rendered')
        const call = calls.slice(before).find((entry) => entry.url.indexOf('/dsh-ronge-adaptive-skill-archive/library?') === 0)
        assert(call && call.url.includes('lang=zh'), 'library request carries lang')
        assert(call.url.includes('hideInstalled=1'), 'default library request hides installed skills')
        assert(!(document.querySelector('.sf-subview').innerText || '').includes('已安装的 PDF 工具'), 'installed skill hidden by default')
        const allButton = [...document.querySelectorAll('.sf-subview .sf-chip')].find((node) => (node.textContent || '').trim() === '全部')
        assert(allButton, 'all filter chip')
        const beforeAll = calls.length
        click(allButton)
        await waitFor(() => (document.querySelector('.sf-subview').innerText || '').includes('已安装的 PDF 工具'), 'installed skill in all mode')
        const allCall = calls.slice(beforeAll).find((entry) => entry.url.indexOf('/dsh-ronge-adaptive-skill-archive/library?') === 0)
        assert(allCall && !allCall.url.includes('hideInstalled=1'), 'all mode requests installed skills')
        assert((document.querySelector('.sf-subview').innerText || '').includes('已安装'), 'installed badge shown')
        const back = document.querySelector('.sf-subview .sf-icon-btn')
        click(back)
        await sleep(300)
      })
      await check('switching session updates the catalog request sessionId', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const switchRoot = ReactDOM.createRoot(host)
        switchRoot.render(React.createElement(slots['dsh-ronge-adaptive-skill-archive'], { sessionId: 's-switch' }))
        await sleep(300)
        const switchBtn = host.querySelector('button.sf-trigger')
        assert(switchBtn, 'switch button rendered')
        click(switchBtn)
        await waitFor(
          () => calls.some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/catalog.json') === 0 && call.url.includes('sessionId=s-switch')),
          'catalog refetch for switched session',
          2500,
        )
        switchRoot.unmount()
        host.remove()
      })
      await check('updates tab loads updates with diff and update-all', async () => {
        const updateTab = [...document.querySelectorAll('.sf-tab')].find((tab) => (tab.textContent || '').trim() === '更新')
        assert(updateTab, 'updates tab exists')
        click(updateTab)
        const checkBtn = await waitFor(() => byText('button', '检查更新'), 'check updates button')
        click(checkBtn)
        await waitFor(() => document.querySelector('.sf-update-item'), 'update item')
        const item = document.querySelector('.sf-update-item')
        assert((item.textContent || '').includes('+2') && (item.textContent || '').includes('-1'), 'diff summary +2/-1')
        assert(document.querySelectorAll('.sf-diff-add').length >= 1, 'added lines rendered')
        assert(document.querySelectorAll('.sf-diff-del').length >= 1, 'removed lines rendered')
        assert(byText('button', '全部更新'), 'update all button')
      })
      await check('per-item update and rollback call backend endpoints', async () => {
        const before = calls.length
        const updateBtn = byText('.sf-update-item button', '更新')
        click(updateBtn)
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/update') === 0), 'update call')
        const updateCall = calls.slice(before).find((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/update') === 0)
        assert(updateCall.body && updateCall.body.name === 'pdf', 'update body name')

        const rollbackBtn = await waitFor(() => {
          const btn = byText('.sf-update-item button', '回滚')
          return btn && !btn.disabled ? btn : null
        }, 'enabled rollback button')
        const beforeRollback = calls.length
        click(rollbackBtn)
        await waitFor(() => calls.slice(beforeRollback).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/rollback') === 0), 'rollback call')
        const rollbackCall = calls.slice(beforeRollback).find((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/rollback') === 0)
        assert(rollbackCall.body && rollbackCall.body.name === 'pdf', 'rollback body name')
      })
      await check('update-all button posts to update-all endpoint', async () => {
        const before = calls.length
        const allBtn = await waitFor(() => {
          const btn = byText('button', '全部更新')
          return btn && !btn.disabled ? btn : null
        }, 'enabled update-all button')
        click(allBtn)
        await waitFor(() => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/discover/update-all') === 0), 'update-all call')
      })
      const setNativeValue = (element, value) => {
        const proto =
          element instanceof window.HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
        setter.call(element, value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }

      await check('intelligence section opens with task input and aria-live status', async () => {
        const skillsTab = [...document.querySelectorAll('.sf-tab')].find((tab) => (tab.textContent || '').trim() === '技能')
        assert(skillsTab, 'skills tab exists')
        click(skillsTab)
        const section = await waitFor(() => document.querySelector('.sf-intel'), 'intelligence section')
        assert((section.textContent || '').includes('智能组合'), 'section title')
        const toggle = [...section.querySelectorAll('button')].find((btn) => (btn.textContent || '').includes('拆解任务'))
        assert(toggle, 'intelligence toggle button')
        click(toggle)
        const textarea = await waitFor(() => document.querySelector('.sf-intel .sf-intel-task'), 'task textarea')
        assert(textarea.tagName === 'TEXTAREA', 'task textarea rendered')
        const status = document.querySelector('.sf-intel-status')
        assert(status, 'status region exists')
        assert(status.getAttribute('role') === 'status', 'status role')
        assert(status.getAttribute('aria-live') === 'polite', 'status aria-live polite')
      })
      await check('compose renders stages, handoffs, gaps, estimates from mocked engine', async () => {
        setNativeValue(document.querySelector('.sf-intel .sf-intel-task'), '把会议录音整理成纪要 docx，再做一个 30 秒宣传片')
        const before = calls.length
        click(byText('.sf-intel-body button', '完整组合'))
        await waitFor(
          () => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/intelligence/compose') === 0),
          'compose request',
        )
        const call = calls.slice(before).find((entry) => entry.url.indexOf('/intelligence/compose') >= 0)
        assert(call.body && String(call.body.task || '').includes('会议录音'), 'compose carries task')
        assert(call.body.mode === 'plan', 'compose carries current mode')
        const plan = await waitFor(() => document.querySelector('.sf-intel-plan'), 'plan rendered')
        const text = plan.innerText || ''
        assert(text.includes('会议录音 → 纪要 docx + 30 秒宣传片'), 'goal rendered')
        assert(document.querySelectorAll('.sf-intel-stage').length === 2, 'two stages rendered')
        assert(text.includes('office-docx') && text.includes('office-render'), 'stage skills rendered')
        assert(text.includes('生成可交付的 .docx 纪要'), 'stage skill why rendered')
        assert(text.includes('文稿文件'), 'handoff rendered')
        assert(text.includes('meeting-minutes-template'), 'missing capability rendered')
        assert(text.includes('meeting-notes'), 'suggested library skill rendered')
        assert(text.includes('tokenSavingPct') || text.includes('预计收益'), 'estimates rendered')
        assert(text.includes('录音已在本机'), 'assumptions rendered')
      })
      await check('copy as agent instructions writes the plan to the clipboard', async () => {
        clipboard.text = null
        click(byText('.sf-intel-plan button', '复制为 Agent 指令'))
        await waitFor(() => clipboard.text && clipboard.text.includes('office-docx'), 'clipboard instructions')
        assert(clipboard.text.includes('会议录音'), 'goal included')
        assert(clipboard.text.includes('交接物'), 'handoff label included')
        assert(clipboard.text.includes('这是计划，不是执行结果'), 'plan-not-execution note included')
      })
      await check('draft renders frontmatter/lint/safety/eval cases and confirm creates via /create', async () => {
        const before = calls.length
        click(byText('.sf-intel-plan button', '生成技能草稿'))
        await waitFor(
          () => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/intelligence/draft') >= 0),
          'draft request',
        )
        const draftCall = calls.slice(before).find((entry) => entry.url.indexOf('/intelligence/draft') >= 0)
        assert(draftCall.body && draftCall.body.task, 'draft carries task')
        assert(draftCall.body.plan && Array.isArray(draftCall.body.plan.stages), 'draft carries plan')
        const draft = await waitFor(() => document.querySelector('.sf-intel-draft'), 'draft rendered')
        const text = draft.innerText || ''
        assert(text.includes('meeting-minutes-template'), 'draft name rendered')
        assert(text.includes('校验'), 'lint section rendered')
        assert(text.includes('description 建议包含触发关键词'), 'lint issue rendered')
        assert(text.includes('评测用例'), 'eval cases rendered')
        assert(text.includes('安全扫描') || text.includes('低风险'), 'safety rendered')
        assert(document.querySelector('.sf-intel-draft .sf-intel-pre'), 'SKILL.md draft content rendered')
        const createBefore = calls.length
        click(byText('.sf-intel-draft button', '确认并创建'))
        await waitFor(
          () => calls.slice(createBefore).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/create') === 0),
          'create request',
        )
        const createCall = calls.slice(createBefore).find((entry) => entry.url.indexOf('/skill-archive/create') >= 0 || entry.url.indexOf('/create') >= 0)
        assert(createCall.body && createCall.body.name === 'meeting-minutes-template', 'create body name')
        assert(createCall.body.description && createCall.body.whenToUse, 'create body frontmatter fields')
        await waitFor(() => {
          const status = document.querySelector('.sf-intel-status')
          return status && (status.textContent || '').includes('已创建技能')
        }, 'created status')
      })
      await check('intelligence failures show a recoverable error without crashing the drawer', async () => {
        intelligenceFail.current = true
        const before = calls.length
        click(byText('.sf-intel-body button', '快速拆解'))
        await waitFor(
          () => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/intelligence/plan') >= 0),
          'plan request',
        )
        await waitFor(() => {
          const status = document.querySelector('.sf-intel-status')
          return status && (status.textContent || '').includes('智能组合失败')
        }, 'intelligence error status')
        assert(document.querySelector('.sf-drawer'), 'drawer still mounted after error')
        assert(byText('.sf-intel button', '重试'), 'retry button visible')
        intelligenceFail.current = false
        const retryBefore = calls.length
        click(byText('.sf-intel button', '重试'))
        await waitFor(
          () => calls.slice(retryBefore).some((call) => call.url.indexOf('/intelligence/plan') >= 0),
          'retry request',
        )
        await waitFor(() => {
          const status = document.querySelector('.sf-intel-status')
          return status && (status.textContent || '').includes('组合方案已生成')
        }, 'recovered status')
      })
      await check('drawer is modal: role/aria-modal, Escape close, focus restore, Tab focus trap', async () => {
        const drawer = document.querySelector('.sf-drawer')
        assert(drawer, 'drawer mounted')
        assert(drawer.getAttribute('role') === 'dialog', 'role=dialog')
        assert(drawer.getAttribute('aria-modal') === 'true', 'aria-modal=true')
        const selector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        const focusables = [...drawer.querySelectorAll(selector)].filter(
          (node) => node.offsetParent !== null || node === document.activeElement,
        )
        assert(focusables.length > 5, 'focusable elements found: ' + focusables.length)
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        last.focus()
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
        assert(document.activeElement === first, 'Tab on last element wraps to first')
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await waitFor(() => !document.querySelector('.sf-drawer'), 'Escape closes drawer')
        const trigger = document.querySelector('.sf-trigger')
        assert(trigger, 'trigger button still present')
        assert(
          document.activeElement === document.body || document.activeElement === trigger,
          'focus restored outside the closed drawer',
        )
        click(trigger)
        await waitFor(() => document.querySelector('.sf-drawer'), 'drawer reopened')
        await waitFor(() => document.querySelector('.sf-tab'), 'tabs after reopen')
        await sleep(200)
        assert(
          !document.querySelector('.sf-intel-plan'),
          'session-scoped plan reset after the session switched back',
        )
      })
      await check('external links are https-only with noopener noreferrer', async () => {
        const status = document.querySelector('.sf-intel-status')
        assert(status, 'intelligence section present after reopen')
        const before = calls.length
        click(byText('.sf-intel-body button', '完整组合'))
        await waitFor(
          () => calls.slice(before).some((call) => call.url.indexOf('/dsh-ronge-adaptive-skill-archive/intelligence/compose') === 0),
          'recompose after session switch',
        )
        await waitFor(() => document.querySelector('.sf-intel-plan'), 'plan rendered again after reopen')
        const anchors = [...document.querySelectorAll('.sf-drawer a[href]')]
        assert(anchors.length >= 1, 'expected at least one external suggestion link')
        for (const anchor of anchors) {
          const href = anchor.getAttribute('href') || ''
          assert(href.startsWith('https://'), 'unsafe href rendered: ' + href)
          const rel = (anchor.getAttribute('rel') || '').toLowerCase()
          assert(rel.includes('noopener') && rel.includes('noreferrer'), 'rel missing on ' + href + ': ' + rel)
        }
        assert(!document.querySelector('.sf-drawer [href^="javascript:"]'), 'no javascript: href')
        assert(!document.querySelector('.sf-drawer [href^="data:"]'), 'no data: href')
        assert(
          [...document.querySelectorAll('.sf-intel-chip')].some((node) => (node.textContent || '').includes('evil-skill')),
          'unsafe suggestion degrades to plain text',
        )
        assert(
          ![...document.querySelectorAll('.sf-drawer a[href]')].some((node) => (node.textContent || '').includes('evil-skill')),
          'unsafe suggestion is never rendered as a link',
        )
      })
    } catch (error) {
      fail('unexpected harness error', error)
    } finally {
      const payload = { results, calls: calls.map((call) => call.url), clipboard: clipboard.text }
      document.getElementById('results').setAttribute('data-results', JSON.stringify(payload))
      document.getElementById('results').textContent = JSON.stringify(payload)
      document.title = 'DONE ' + results.filter((item) => item.ok).length + '/' + results.length
      window.prompt = originalPrompt
    }
  })()
})()
