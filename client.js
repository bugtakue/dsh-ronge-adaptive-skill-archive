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
      comboTitle: '当前组合',
      comboActive: '运行中',
      comboRecent: '最近使用',
      comboRecommended: '推荐组合',
      comboRating: '评级',
      comboLocalRate: '本地成功率',
      comboWhy: '为什么',
      comboSwitch: '已切换 skill 组合',
      comboOpen: '查看面板',
      comboDismiss: '知道了',
      comboLive: '运行中的组合',
      onlyNew: '未安装',
      allSkills: '全部',
      betterTitle: '发现更优的未装技能',
      betterNotice: '发现更优技能',
      betterHint: '比已装的更匹配；安装后自动参与推荐',
      betterWhy: '更匹配',
      betterMatched: '命中关键词',
      betterCompare: '相比已装',
      autoInstallBetter: '自动安装更优',
      autoInstalled: '已自动安装更优技能',
      autoInstallFailed: '自动安装失败',
      installUse: '安装并使用',
      installFailed: '安装失败',
      installNetworkHint: '下载 SKILL.md 失败：当前网络无法访问 GitHub（raw.githubusercontent.com）。检查 Clash/TUN 或代理规则后重试。',
      ignore: '忽略',
      newFromLibrary: '库里还没装的',
      newFromLibraryHint: '按上下文相关度排序的未安装技能（放宽候选）',
      installedBadge: '已安装',
      recommend: '推荐',
      recommendHint: '根据整段会话 + 项目文件',
      recentMessages: '会话消息',
      projectFiles: '项目文件',
      projectDocs: '项目文档',
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
      tabUpdates: '更新',
      tabLibrary: '卷轴馆',
      libraryTitle: '荣哥技能卷轴收藏馆（可沉浸式体验版本）',
      libraryHint: '全 GitHub 公开 SKILL.md 索引，按分类和评级浏览',
      all: '全部',
      loadMore: '加载更多',
      noLibrary: '没有匹配的卷轴',
      ratingLabel: '评级',
      updateTitle: '更新中心',
      updateHint: '检查已安装技能的远程更新：查看 diff、更新或回滚',
      updateEmpty: '还没有检查更新，点下面按钮开始',
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
      historyCount: '条历史',
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
      catVideo: '视频 / 动效',
      catOffice: '办公文档',
      catHarness: 'Harness 插件',
      catOther: '通用技能',
      skillCatalog: '技能目录',
      experienceOverview: '统计概览',
      statEntries: '经验记录',
      statSkills: '技能数',
      statSuccess: '平均成功率',
      statDuration: '平均耗时',
      skillPerformance: '技能表现',
      healthAlerts: '健康告警',
      healthOk: '一切正常',
      evolutionOverview: '进化概览',
      evolutionCategories: '分类权重',
      evolutionLearning: '学习进度',
      learningSkills: '已学习技能',
      learningAffinity: '平均手感',
      learningExplored: '探索反馈',
      learningServed: '探索展示',
      learningAdopted: '探索采用',
      exploration: '探索配额',
      explorationHint: '偶尔给没试过的技能一点曝光，避免推荐越用越窄。',
      explorationBadge: '探索',
      quotaSaved: '探索配额已更新',
      explorationStats: '探索反馈',
      exploreAttempts: '探索次数',
      exploreAdopted: '采用',
      weightsHint: '权重随反馈自动微调，越用越准',
      expandDetail: '展开详情',
      collapseDetail: '收起详情',
      noExperience: '还没有经验记录，完成一次任务后自动积累。',
      totalUses: '总使用',
      copySkillAria: '复制 /skill 命令',
      goodAria: '这个推荐好用',
      badAria: '这个推荐不好用',
      searchAria: '搜索技能',
      tabsAria: '面板分区',
      modeAria: '智能模式',
      quotaAria: '探索配额档位',
      starsAria: '评分',
      listAria: '技能列表',
      loadingMore: '加载中…',
    }

    const dictEn = {
      trigger: 'Scrolls',
      open: 'Open Skill Factory',
      title: "Ronge's Adaptive Skill Cockpit (Immersive Edition)",
      subtitle: 'Adaptive · self-evolving recommendations · context-aware · active skills · one-click create',
      comboTitle: 'Current combo',
      comboActive: 'Running',
      comboRecent: 'Recently used',
      comboRecommended: 'Recommended combo',
      comboRating: 'Rating',
      comboLocalRate: 'Local success',
      comboWhy: 'Why',
      comboSwitch: 'Skill combo switched',
      comboOpen: 'Open panel',
      comboDismiss: 'Got it',
      comboLive: 'Active combo',
      onlyNew: 'Not installed',
      allSkills: 'All',
      betterTitle: 'Better uninstalled matches',
      betterNotice: 'Better skill found',
      betterHint: 'More relevant than what is installed; installs join recommendations automatically',
      betterWhy: 'More relevant',
      betterMatched: 'Matched keywords',
      betterCompare: 'vs installed',
      autoInstallBetter: 'Auto-install better',
      autoInstalled: 'Auto-installed',
      autoInstallFailed: 'Auto-install failed',
      installUse: 'Install & use',
      installFailed: 'Install failed',
      installNetworkHint: 'Could not download SKILL.md: raw.githubusercontent.com is unreachable. Check proxy/TUN rules and retry.',
      ignore: 'Ignore',
      newFromLibrary: 'Not in your library yet',
      newFromLibraryHint: 'Uninstalled skills ranked by context relevance (broad candidates)',
      installedBadge: 'Installed',
      recommend: 'Recommended',
      recommendHint: 'From the whole conversation + project files',
      recentMessages: 'messages',
      projectFiles: 'project files',
      projectDocs: 'project docs',
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
      tabUpdates: 'Updates',
      tabLibrary: 'Scrolls',
      libraryTitle: "Ronge's Adaptive Skill Cockpit (Immersive Edition)",
      libraryHint: 'Index of public GitHub SKILL.md files, by category and rating',
      all: 'All',
      loadMore: 'Load more',
      noLibrary: 'No matching scrolls',
      ratingLabel: 'Rating',
      updateTitle: 'Update center',
      updateHint: 'Check remote updates for installed skills: diff, update, rollback',
      updateEmpty: 'Not checked yet — start below',
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
      historyCount: 'entries',
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
      catVideo: 'Video & motion',
      catOffice: 'Office documents',
      catHarness: 'Harness plugins',
      catOther: 'General skills',
      skillCatalog: 'Skill catalog',
      experienceOverview: 'Overview',
      statEntries: 'Entries',
      statSkills: 'Skills',
      statSuccess: 'Avg success',
      statDuration: 'Avg time',
      skillPerformance: 'Skill performance',
      healthAlerts: 'Health alerts',
      healthOk: 'All clear',
      evolutionOverview: 'Evolution',
      evolutionCategories: 'Category weights',
      evolutionLearning: 'Learning',
      learningSkills: 'Skills tracked',
      learningAffinity: 'Avg affinity',
      learningExplored: 'Explore feedback',
      learningServed: 'Exploration served',
      learningAdopted: 'Adopted explores',
      exploration: 'Exploration quota',
      explorationHint: 'Give untried skills some exposure so recommendations never narrow.',
      explorationBadge: 'Explore',
      quotaSaved: 'Exploration quota updated',
      explorationStats: 'Exploration feedback',
      exploreAttempts: 'Explores',
      exploreAdopted: 'Adopted',
      weightsHint: 'Weights auto-tune from feedback and get sharper over time',
      expandDetail: 'Show details',
      collapseDetail: 'Hide details',
      noExperience: 'No experience yet — finish a task to start collecting.',
      totalUses: 'Total uses',
      copySkillAria: 'Copy /skill command',
      goodAria: 'This recommendation works well',
      badAria: 'This recommendation does not work',
      searchAria: 'Search skills',
      tabsAria: 'Panel sections',
      modeAria: 'Smart mode',
      quotaAria: 'Exploration quota levels',
      starsAria: 'Rating',
      listAria: 'Skill list',
      loadingMore: 'Loading…',
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

    function iconSvg(props, children) {
      const options = props || {}
      const size = options.size ? options.size : 16
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: options.sw ? options.sw : 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          className: options.className || undefined,
          'aria-hidden': true,
          focusable: 'false',
        },
        children,
      )
    }

    function IconSkills(props) {
      return iconSvg({ size: props && props.size }, [
        h('rect', { key: 'a', x: 3, y: 3, width: 7, height: 7, rx: 2 }),
        h('rect', { key: 'b', x: 14, y: 3, width: 7, height: 7, rx: 2 }),
        h('rect', { key: 'c', x: 3, y: 14, width: 7, height: 7, rx: 2 }),
        h('path', { key: 'd', d: 'M17.5 14v6M14.5 17h6' }),
      ])
    }

    function IconRefresh(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M20 12a8 8 0 1 1-2.34-5.66' }),
        h('path', { key: 'b', d: 'M20 4v5h-5' }),
      ])
    }

    function IconClose(props) {
      return iconSvg({ size: (props && props.size) || 16, sw: 1.8 }, [
        h('path', { key: 'a', d: 'M6 6l12 12M18 6L6 18' }),
      ])
    }

    function IconSearch(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('circle', { key: 'a', cx: 11, cy: 11, r: 6.5 }),
        h('path', { key: 'b', d: 'M16 16l4.5 4.5' }),
      ])
    }

    function IconSparkle(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z' }),
        h('path', { key: 'b', d: 'M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z' }),
      ])
    }

    function IconLibrary(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5z' }),
        h('path', { key: 'b', d: 'M5 17.5A1.5 1.5 0 0 1 6.5 16H19' }),
        h('path', { key: 'c', d: 'M9 7h6' }),
      ])
    }

    function IconCompass(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('circle', { key: 'a', cx: 12, cy: 12, r: 8.5 }),
        h('path', { key: 'b', d: 'M14.8 9.2l-1.6 4.2-4.2 1.6 1.6-4.2z' }),
      ])
    }

    function IconTools(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6L21 9V4h-5z' }),
        h('path', { key: 'b', d: 'M13 8L4.5 16.5a2.1 2.1 0 1 0 3 3L16 11' }),
      ])
    }

    function IconCopy(props) {
      return iconSvg({ size: (props && props.size) || 13, sw: 1.7 }, [
        h('rect', { key: 'a', x: 9, y: 9, width: 11, height: 11, rx: 2 }),
        h('path', { key: 'b', d: 'M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3' }),
      ])
    }

    function IconArrowLeft(props) {
      return iconSvg({ size: (props && props.size) || 16, sw: 1.8 }, [
        h('path', { key: 'a', d: 'M15 5l-7 7 7 7' }),
      ])
    }

    function IconCheck(props) {
      return iconSvg({ size: (props && props.size) || 14, sw: 2 }, [
        h('path', { key: 'a', d: 'M4.5 12.5l5 5 10-11' }),
      ])
    }

    function IconChevron(props) {
      return iconSvg({ size: (props && props.size) || 14, sw: 1.8 }, [
        h('path', { key: 'a', d: 'M6 9l6 6 6-6' }),
      ])
    }

    function IconChart(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('path', { key: 'a', d: 'M4 20V9M10 20V4M16 20v-7M22 20H2' }),
      ])
    }

    function IconPulse(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('path', { key: 'a', d: 'M3 12h4l2.2-5 3.6 10L15 12h6' }),
      ])
    }

    function IconShield(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('path', { key: 'a', d: 'M12 3l7 3v5.2c0 4.4-3 8-7 9.8-4-1.8-7-5.4-7-9.8V6z' }),
        h('path', { key: 'b', d: 'M9.2 12.2l2 2 3.6-4' }),
      ])
    }

    function IconAlert(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('path', { key: 'a', d: 'M12 4l9 16H3z' }),
        h('path', { key: 'b', d: 'M12 10v4M12 17v.5' }),
      ])
    }

    function IconSliders(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('path', { key: 'a', d: 'M4 8h9M17 8h3M4 16h3M11 16h9' }),
        h('circle', { key: 'b', cx: 15, cy: 8, r: 2.2 }),
        h('circle', { key: 'c', cx: 9, cy: 16, r: 2.2 }),
      ])
    }

    function IconFilm(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('rect', { key: 'a', x: 3, y: 5, width: 18, height: 14, rx: 2.5 }),
        h('path', { key: 'b', d: 'M7.5 5v14M16.5 5v14M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21' }),
      ])
    }

    function IconDoc(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z' }),
        h('path', { key: 'b', d: 'M14 3.5V8h4.5M9 12h6M9 16h6' }),
      ])
    }

    function IconPlug(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('path', { key: 'a', d: 'M9 3v5M15 3v5' }),
        h('path', { key: 'b', d: 'M6 8h12v3a6 6 0 0 1-12 0z' }),
        h('path', { key: 'c', d: 'M12 17v4' }),
      ])
    }

    function IconSparkDots(props) {
      return iconSvg({ size: (props && props.size) || 15 }, [
        h('circle', { key: 'a', cx: 12, cy: 12, r: 3 }),
        h('path', { key: 'b', d: 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1' }),
      ])
    }

    function IconPlus(props) {
      return iconSvg({ size: (props && props.size) || 14, sw: 1.9 }, [
        h('path', { key: 'a', d: 'M12 5v14M5 12h14' }),
      ])
    }

    function IconGlobe(props) {
      return iconSvg({ size: (props && props.size) || 14 }, [
        h('circle', { key: 'a', cx: 12, cy: 12, r: 8.5 }),
        h('path', { key: 'b', d: 'M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5z' }),
      ])
    }

    function categoryOf(name) {
      if (/^office/.test(name)) return 'office'
      if (/^(hyperframes|beat-promo|media-use)/.test(name)) return 'video'
      if (/^cordis|^editing-cordis/.test(name) || name === 'agent-experience') return 'harness'
      return 'other'
    }

    const CATEGORY_ORDER = ['video', 'office', 'harness', 'other']

    function categoryLabel(t, key) {
      const map = { video: 'catVideo', office: 'catOffice', harness: 'catHarness', other: 'catOther' }
      return t(map[key] || 'catOther')
    }

    function CategoryIcon(props) {
      const key = props && props.category ? props.category : 'other'
      const size = (props && props.size) || 15
      if (key === 'video') return h(IconFilm, { size })
      if (key === 'office') return h(IconDoc, { size })
      if (key === 'harness') return h(IconPlug, { size })
      return h(IconSparkDots, { size })
    }

    function sourceLabel(t, source) {
      if (source === 'user-dsh' || source === 'user-agents') return t('sourceUser')
      if (source === 'bundled') return t('sourceBundled')
      if (source === 'project-dsh' || source === 'project-agents') return t('sourceProject')
      if (source === 'profile') return t('sourceProfile')
      return t('sourceOther')
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
        {
          className: 'sf-badge sf-trust sf-trust-' + value,
          title: t('trust') + ': ' + String(trust),
        },
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
      return h('span', { className: 'sf-badge sf-license', title: license }, t('license') + ': ' + license)
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
        usable.slice(0, 3).map((finding, index) =>
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

    function formatNumber(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '—'
      return String(Math.round(number))
    }

    function formatScore(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return ''
      return number.toFixed(1).replace(/\.0$/, '')
    }

    function formatAffinity(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '—'
      if (number <= 1) return Math.round(number * 100) + '%'
      return number.toFixed(2)
    }

    function formatTime(value) {
      if (!value) return ''
      const text = String(value)
      const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(text)
      if (match) return match[2] + '-' + match[3] + ' ' + match[4] + ':' + match[5]
      return text.slice(0, 16)
    }

    function healthEntryName(entry) {
      if (typeof entry === 'string') return entry
      if (!entry || typeof entry !== 'object') return ''
      return String(entry.name || entry.skillName || entry.skill || entry.id || '')
    }

    function clamp(value, min, max) {
      const number = Number(value)
      if (!Number.isFinite(number)) return min
      return Math.min(max, Math.max(min, number))
    }

    function percentBetween(value, min, max) {
      const span = Number(max) - Number(min)
      if (!Number.isFinite(span) || span <= 0) return 0
      return Math.round(clamp(((Number(value) - Number(min)) / span) * 100, 0, 100))
    }

    function SectionHead(props) {
      const { icon, title, hint, actions, badge } = props
      return h(
        'div',
        { className: 'sf-sec-head' },
        h(
          'div',
          { className: 'sf-sec-title' },
          icon ? h('span', { className: 'sf-sec-icon' }, icon) : null,
          h('span', { className: 'sf-sec-name' }, title),
          badge !== undefined && badge !== null && badge !== ''
            ? h('span', { className: 'sf-sec-badge' }, badge)
            : null,
          hint ? h('span', { className: 'sf-sec-hint' }, hint) : null,
        ),
        actions ? h('div', { className: 'sf-sec-actions' }, actions) : null,
      )
    }

    function ProgressBar(props) {
      const percent = clamp(Number(props.percent) || 0, 0, 100)
      const tone = props.tone || 'accent'
      return h(
        'div',
        {
          className: 'sf-bar',
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': percent,
          'aria-label': props.label || undefined,
        },
        h('span', { className: 'sf-bar-fill sf-bar-' + tone, style: { width: percent + '%' } }),
      )
    }

    function Segmented(props) {
      const options = Array.isArray(props.options) ? props.options : []
      const value = props.value
      return h(
        'div',
        { className: props.small ? 'sf-seg sf-seg-sm' : 'sf-seg', role: 'group', 'aria-label': props.label || undefined },
        options.map((option) =>
          h(
            'button',
            {
              type: 'button',
              key: String(option.value),
              className: option.value === value ? 'sf-seg-btn sf-seg-active' : 'sf-seg-btn',
              'aria-pressed': option.value === value,
              disabled: Boolean(props.busy),
              title: option.title || undefined,
              onClick: () => props.onChange && props.onChange(option.value),
            },
            option.label,
          ),
        ),
      )
    }

    function EmptyState(props) {
      return h(
        'div',
        { className: props.className ? 'sf-empty ' + props.className : 'sf-empty' },
        props.icon ? h('span', { className: 'sf-empty-icon' }, props.icon) : null,
        h('div', { className: 'sf-empty-title' }, props.title),
        props.hint ? h('div', { className: 'sf-empty-hint' }, props.hint) : null,
        props.action ? h('div', { className: 'sf-empty-action' }, props.action) : null,
      )
    }

    function SkeletonList(props) {
      const rows = Number(props && props.rows) || 4
      const kind = (props && props.kind) || 'card'
      return h(
        'div',
        { className: 'sf-skeleton-list', 'aria-hidden': true },
        Array.from({ length: rows }).map((_, index) =>
          kind === 'row'
            ? h(
                'div',
                { className: 'sf-skeleton-row', key: index },
                h('span', { className: 'sf-skeleton sf-skeleton-dot' }),
                h('span', { className: 'sf-skeleton sf-skeleton-line', style: { width: 30 + ((index * 17) % 45) + '%' } }),
                h('span', { className: 'sf-skeleton sf-skeleton-pill' }),
              )
            : h(
                'div',
                { className: 'sf-skeleton-card', key: index },
                h('span', { className: 'sf-skeleton sf-skeleton-line', style: { width: 42 + ((index * 13) % 30) + '%' } }),
                h('span', { className: 'sf-skeleton sf-skeleton-line sf-skeleton-line-soft', style: { width: 76 + (index % 3) * 6 + '%' } }),
                h('span', { className: 'sf-skeleton sf-skeleton-line sf-skeleton-line-soft', style: { width: 55 + ((index * 7) % 25) + '%' } }),
              ),
        ),
      )
    }

    function SkillCard(props) {
      const skill = props.skill || {}
      const t = props.t
      const expanded = Boolean(props.expanded)
      const copied = Boolean(props.copied)
      const category = categoryOf(skill.name)
      return h(
        'div',
        {
          className: expanded ? 'sf-card sf-card-open' : 'sf-card',
          role: 'button',
          tabIndex: 0,
          'aria-expanded': expanded,
          'aria-label': skill.name + ' · ' + t(expanded ? 'collapseDetail' : 'expandDetail'),
          'data-skill': skill.name,
          onClick: props.onToggle,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              props.onToggle()
            }
          },
        },
        h(
          'div',
          { className: 'sf-card-head' },
          h('span', { className: 'sf-card-icon' }, h(CategoryIcon, { category, size: 15 })),
          h(
            'div',
            { className: 'sf-card-title' },
            h('code', { className: 'sf-name' }, skill.name),
            h('span', { className: 'sf-source' }, sourceLabel(t, skill.source)),
          ),
          h('span', { className: 'sf-card-chevron' }, h(IconChevron, { size: 14 })),
        ),
        h('p', { className: 'sf-desc' }, skill.intro || skill.description || ''),
        skill.whenToUse
          ? h(
              'p',
              { className: 'sf-when' },
              h('span', { className: 'sf-when-label' }, t('whenLabel')),
              String(skill.whenToUse),
            )
          : null,
        badgeRow(
          [trustBadge(t, skill.trust), securityBadge(t, skill.security)],
          'sf-meta-row sf-card-badges',
        ),
        expanded
          ? h(
              'div',
              { className: 'sf-detail' },
              h(
                'div',
                { className: 'sf-detail-head' },
                h('span', { className: 'sf-cat' }, categoryLabel(t, category)),
                skill.path
                  ? h(
                      'div',
                      { className: 'sf-path' },
                      h('span', { className: 'sf-detail-label' }, t('path')),
                      h('code', null, String(skill.path)),
                    )
                  : null,
              ),
              h(
                'div',
                { className: 'sf-flags' },
                h('span', { className: 'sf-detail-label' }, t('flags')),
                h('span', { className: 'sf-flag' }, t('modelOnly')),
                h('span', { className: 'sf-flag' }, t('userOnly')),
              ),
              badgeRow(
                [trustBadge(t, skill.trust), licenseBadge(t, skill.license), securityBadge(t, skill.security)],
                'sf-meta-row',
              ),
              securityFindings(t, skill.security),
            )
          : null,
        h(
          'button',
          {
            type: 'button',
            className: copied ? 'sf-copy sf-copy-done' : 'sf-copy',
            'aria-label': t('copy') + ': ' + skill.name,
            title: t('copy'),
            onClick: (event) => {
              event.stopPropagation()
              props.onCopy(skill.name)
            },
            onKeyDown: (event) => event.stopPropagation(),
          },
          copied ? h(IconCheck, { size: 12 }) : h(IconCopy, { size: 12 }),
          h('span', null, copied ? t('copied') : t('copy')),
        ),
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

      // Combo watcher: polls silently even when the drawer is closed, and shows
      // a small notification only when a *running* skill combo changes.
      const [comboNotice, setComboNotice] = React.useState(null)
      const comboSeen = React.useRef(null)
      const comboNoticeTimer = React.useRef(null)
      const [betterNotice, setBetterNotice] = React.useState(null)
      const betterSeen = React.useRef(null)
      const betterNoticeTimer = React.useRef(null)
      React.useEffect(() => {
        const sessionId = props && props.sessionId ? props.sessionId : store.sessionId
        comboSeen.current = null
        setComboNotice(null)
        betterSeen.current = null
        setBetterNotice(null)
        if (!sessionId) return undefined
        let stopped = false
        const check = async () => {
          try {
            const params = new URLSearchParams({ sessionId })
            params.set('lang', String(store.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh')
            const response = await fetch('/ronge-adaptive-skill-archive/catalog.json?' + params.toString(), {
              cache: 'no-store',
            })
            if (!response.ok) return
            const payload = await response.json().catch(() => ({}))
            if (stopped) return
            const combo = payload && payload.activeCombo ? payload.activeCombo : null
            if (combo && combo.key) {
              if (!comboSeen.current) {
                comboSeen.current = combo.key
              } else if (combo.key !== comboSeen.current) {
                comboSeen.current = combo.key
                if (combo.source === 'active') {
                  setComboNotice(combo)
                  if (comboNoticeTimer.current) clearTimeout(comboNoticeTimer.current)
                  comboNoticeTimer.current = setTimeout(() => setComboNotice(null), 9000)
                }
              }
            }
            const better = payload && Array.isArray(payload.betterOptions) ? payload.betterOptions[0] : null
            if (better && better.name) {
              if (betterSeen.current !== better.name) {
                betterSeen.current = better.name
                setBetterNotice(better)
                if (betterNoticeTimer.current) clearTimeout(betterNoticeTimer.current)
                betterNoticeTimer.current = setTimeout(() => setBetterNotice(null), 12000)
              }
            }
          } catch {
            // Silent: the watcher never affects the page.
          }
        }
        check()
        const timer = setInterval(check, 12000)
        return () => {
          stopped = true
          clearInterval(timer)
          if (comboNoticeTimer.current) clearTimeout(comboNoticeTimer.current)
          if (betterNoticeTimer.current) clearTimeout(betterNoticeTimer.current)
        }
      }, [props && props.sessionId, state.sessionId])

      const comboNoticeNames = comboNotice && Array.isArray(comboNotice.skills) ? comboNotice.skills.map((item) => item.name) : []
      const comboNoticeRating =
        comboNotice && comboNotice.rating !== null && comboNotice.rating !== undefined && Number.isFinite(Number(comboNotice.rating))
          ? Number(comboNotice.rating)
          : null
      const comboNoticeLocalRate =
        comboNotice && comboNotice.localRate !== null && comboNotice.localRate !== undefined && Number.isFinite(Number(comboNotice.localRate))
          ? Number(comboNotice.localRate)
          : null
      const betterNoticeRating =
        betterNotice && betterNotice.rating !== null && betterNotice.rating !== undefined && Number.isFinite(Number(betterNotice.rating))
          ? Number(betterNotice.rating)
          : null

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
        comboNotice
          ? h(
              'div',
              { className: 'sf-combo-toast', role: 'status', 'aria-live': 'polite' },
              h('span', { className: 'sf-combo-toast-icon' }, h(IconSparkle, { size: 15 })),
              h(
                'div',
                { className: 'sf-combo-toast-body' },
                h('div', { className: 'sf-combo-toast-title' }, t('comboSwitch')),
                h(
                  'div',
                  { className: 'sf-combo-toast-names' },
                  comboNoticeNames.join(' × ') +
                    (comboNoticeRating !== null
                      ? '  ★ ' + comboNoticeRating.toFixed(1)
                      : comboNoticeLocalRate !== null
                        ? '  ' + t('comboLocalRate') + ' ' + comboNoticeLocalRate + '%'
                        : ''),
                ),
                comboNotice.why
                  ? h('div', { className: 'sf-combo-toast-why' }, String(comboNotice.why))
                  : null,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-combo-toast-open',
                  onClick: () => {
                    store.set({ open: true, sessionId: props && props.sessionId ? props.sessionId : store.sessionId })
                    setComboNotice(null)
                  },
                },
                t('comboOpen'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-combo-toast-close',
                  'aria-label': t('comboDismiss'),
                  title: t('comboDismiss'),
                  onClick: () => setComboNotice(null),
                },
                h(IconClose, { size: 13 }),
              ),
            )
          : null,
        betterNotice
          ? h(
              'div',
              { className: 'sf-combo-toast sf-better-toast', role: 'status', 'aria-live': 'polite' },
              h('span', { className: 'sf-combo-toast-icon' }, h(IconSparkle, { size: 15 })),
              h(
                'div',
                { className: 'sf-combo-toast-body' },
                h('div', { className: 'sf-combo-toast-title' }, t('betterNotice')),
                h(
                  'div',
                  { className: 'sf-combo-toast-names' },
                  betterNotice.name + (betterNoticeRating !== null ? '  ★ ' + betterNoticeRating.toFixed(1) : ''),
                ),
                betterNotice.whyBetter
                  ? h('div', { className: 'sf-combo-toast-why' }, String(betterNotice.whyBetter))
                  : null,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-combo-toast-open',
                  onClick: () => {
                    store.set({ open: true, sessionId: props && props.sessionId ? props.sessionId : store.sessionId })
                    setBetterNotice(null)
                  },
                },
                t('comboOpen'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-combo-toast-close',
                  'aria-label': t('comboDismiss'),
                  title: t('comboDismiss'),
                  onClick: () => setBetterNotice(null),
                },
                h(IconClose, { size: 13 }),
              ),
            )
          : null,
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
              h('div', { className: 'sf-empty-icon' }, h(IconAlert, { size: 22 })),
              h('div', { className: 'sf-empty-title' }, t('panelError')),
              h('div', { className: 'sf-error-detail' }, detail),
              h(
                'div',
                { className: 'sf-empty-action' },
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
      const [quotaBusy, setQuotaBusy] = React.useState(false)
      const [toast, setToast] = React.useState(null)
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
      const [libraryOnlyNew, setLibraryOnlyNew] = React.useState(true)
      const [autoInstallBetter, setAutoInstallBetter] = React.useState(() => {
        try {
          return window.localStorage.getItem('ronge.autoInstallBetter') !== '0'
        } catch {
          return true
        }
      })
      const [ignoredBetter, setIgnoredBetter] = React.useState([])
      const autoInstallRef = React.useRef(new Set())
      const autoInstallCount = React.useRef(0)
      const searchRef = React.useRef(null)
      const abortRef = React.useRef(null)
      const toastTimer = React.useRef(null)
      const previousFocus = React.useRef(null)

      const showToast = React.useCallback((text, kind) => {
        if (!text) return
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast({ text: String(text), kind: kind || 'ok', id: Date.now() })
        toastTimer.current = setTimeout(() => setToast(null), 1900)
      }, [])

      React.useEffect(
        () => () => {
          if (toastTimer.current) clearTimeout(toastTimer.current)
        },
        [],
      )

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
        if (!state.open || view !== 'skills') return undefined
        const timer = setTimeout(() => {
          if (searchRef.current && document.activeElement !== searchRef.current) searchRef.current.focus()
        }, 80)
        return () => clearTimeout(timer)
      }, [state.open, view])

      React.useEffect(() => {
        if (state.open) {
          if (!previousFocus.current) previousFocus.current = document.activeElement
          return undefined
        }
        const target = previousFocus.current
        previousFocus.current = null
        if (target && typeof target.focus === 'function' && document.contains(target)) target.focus()
        return undefined
      }, [state.open])

      React.useEffect(() => {
        if (!state.open || !autoInstallBetter || !data) return
        if (autoInstallCount.current >= 1) return
        const candidate = (data.betterOptions || []).find(
          (item) =>
            item &&
            item.name &&
            item.autoSafe === true &&
            !item.installed &&
            !ignoredBetter.includes(item.name) &&
            !autoInstallRef.current.has(item.name),
        )
        if (!candidate) return
        autoInstallRef.current.add(candidate.name)
        autoInstallCount.current += 1
        installRemote({ name: candidate.name, url: candidate.rawUrl || candidate.url, trust: candidate.trust }, { auto: true }).catch(
          () => showToast(t('autoInstallFailed') + ' · ' + candidate.name, 'error'),
        )
      }, [data, autoInstallBetter, ignoredBetter, state.open])

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
      const evolution = data && data.evolution && typeof data.evolution === 'object' ? data.evolution : null
      const combo = data && data.activeCombo && Array.isArray(data.activeCombo.skills) ? data.activeCombo : null
      const discoveries = data && Array.isArray(data.discoveries) ? data.discoveries : []
      const betterOptions =
        data && Array.isArray(data.betterOptions)
          ? data.betterOptions.filter((item) => !ignoredBetter.includes(item.name))
          : []
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
      const groupCounts = {}
      for (const skill of skills) {
        const key = categoryOf(skill.name)
        groupCounts[key] = (groupCounts[key] || 0) + 1
      }
      const groups = CATEGORY_ORDER.map((key) => ({
        key,
        label: categoryLabel(t, key),
        total: groupCounts[key] || 0,
        items: filtered.filter((skill) => categoryOf(skill.name) === key),
      })).filter((group) => group.items.length)

      const copyName = (name) => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(name).catch(() => {})
          }
        } catch {
          // Clipboard is optional.
        }
        setCopied(name)
        showToast(t('copied') + ' · ' + String(name))
        setTimeout(() => setCopied((current) => (current === name ? null : current)), 1400)
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
          showToast(t('good') === verdict ? t('good') : verdict === 'adopt' ? t('copied') : t('bad'))
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
        showToast('/skill ' + name + ' · ' + t('copied'))
        setTimeout(() => setCopied((current) => (current === name ? null : current)), 1600)
        sendRecommendFeedback(name, 'adopt', kind)
      }

      const revealSkill = (name) => {
        if (!name) return
        setQuery(name)
        setExpanded(name)
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            const node = document.querySelector('.sf-card[data-skill="' + String(name).replace(/"/g, '') + '"]')
            if (node && typeof node.scrollIntoView === 'function') {
              node.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          })
        }
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
          const onlyNew = filters.onlyNew !== undefined ? filters.onlyNew : libraryOnlyNew
          const params = new URLSearchParams({
            q: filters.q !== undefined ? filters.q : libraryQuery,
            category: filters.category !== undefined ? filters.category : libraryCategory,
            minRating: String(filters.minRating !== undefined ? filters.minRating : libraryMinRating),
            page: String(page),
            limit: '40',
          })
          if (onlyNew) params.set('hideInstalled', '1')
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

      const installRemote = async (entry, options = {}) => {
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
          showToast((options.auto ? t('autoInstalled') : t('installed')) + ' · ' + entry.name)
          await load(state.sessionId, true)
        } catch (err) {
          const raw = err instanceof Error ? err.message : String(err)
          const friendly = /fetch failed|ENOTFOUND|ECONN|TLS|network/i.test(raw) ? t('installNetworkHint') : raw
          setRemoteInstall({ name: entry.name, status: 'error', error: friendly })
          showToast(t('installFailed') + ' · ' + entry.name, 'error')
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
          showToast(t(doneKey) + summary)
          await checkUpdates(true)
          await load(state.sessionId, true)
        } catch (err) {
          setUpdateError(t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)))
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
          showToast(t('exportOk'))
        } catch (err) {
          setXpStatus({ kind: 'error', text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)) })
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
          setXpStatus({ kind: 'error', text: t('importInvalid') + ': ' + (err instanceof Error ? err.message : String(err)) })
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
          showToast(t('importOk'))
          await load(state.sessionId, true)
        } catch (err) {
          setXpStatus({ kind: 'error', text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)) })
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
          showToast(t(doneKeys[action]))
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

      const changeExplorationRate = async (rate) => {
        if (quotaBusy) return
        const next = Number(rate)
        if (!Number.isFinite(next)) return
        setQuotaBusy(true)
        setEvolutionNotice(null)
        try {
          const response = await fetch('/ronge-adaptive-skill-archive/evolution/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ explorationRate: next }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status)
          setEvolutionNotice({ kind: 'ok', text: t('quotaSaved') })
          showToast(t('quotaSaved'))
          await load(state.sessionId, true)
        } catch (err) {
          setEvolutionNotice({
            kind: 'error',
            text: t('actionFailed') + ': ' + (err instanceof Error ? err.message : String(err)),
          })
        } finally {
          setQuotaBusy(false)
        }
      }

      const changeView = (next) => {
        setView(next)
        if (next === 'discover' && remoteResults.length === 0) loadRemote('')
        if (next === 'tools' && toolsResults.length === 0) loadTools('')
        if (next === 'library' && libraryResults.length === 0) loadLibrary(1, false)
      }

      const submitCreate = async (event) => {
        event.preventDefault()
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

      const renderRemotePreview = () => {
        if (!remotePreview) return null
        const entry = remotePreview.entry || {}
        return h(
          'div',
          { className: 'sf-preview' },
          h(
            'div',
            { className: 'sf-preview-head' },
            h(
              'div',
              { className: 'sf-preview-title' },
              h('strong', null, entry.name || ''),
              h('span', { className: 'sf-preview-source' }, entry.repo || t('source')),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'sf-icon-btn',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => setRemotePreview(null),
              },
              h(IconClose, { size: 14 }),
            ),
          ),
          remotePreview.loading
            ? h(SkeletonList, { rows: 3, kind: 'row' })
            : remotePreview.error
              ? EmptyState({
                  className: 'sf-error',
                  icon: h(IconAlert, { size: 20 }),
                  title: t('error'),
                  hint: remotePreview.error,
                })
              : h('pre', { className: 'sf-preview-code' }, String(remotePreview.content || '').slice(0, 6000)),
          badgeRow(
            [
              trustBadge(t, remotePreview.trust || entry.trust),
              securityBadge(t, remotePreview.security),
              licenseBadge(t, remotePreview.license),
            ],
            'sf-meta-row sf-preview-meta',
          ),
          h(
            'div',
            { className: 'sf-preview-actions' },
            h(
              'button',
              { type: 'button', className: 'sf-primary', onClick: () => installRemote(entry) },
              h(IconPlus, { size: 13 }),
              h('span', null, t('install')),
            ),
          ),
        )
      }

      const renderRemoteCard = (entry) =>
        h(
          'div',
          { className: 'sf-remote-card', key: entry.url || entry.repo + '::' + entry.path || entry.name },
          h(
            'div',
            { className: 'sf-remote-head' },
            h('strong', { className: 'sf-name' }, entry.name),
            h('span', { className: 'sf-source' }, entry.trust || entry.sourceLabel || t('source')),
          ),
          h('p', { className: 'sf-desc' }, entry.description || entry.intro || ''),
          h('div', { className: 'sf-remote-meta' }, (entry.repo || '') + (entry.path ? ' · ' + entry.path : '')),
          h(
            'div',
            { className: 'sf-remote-actions' },
            h(
              'button',
              { type: 'button', className: 'sf-secondary', onClick: () => openRemotePreview(entry) },
              t('preview'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'sf-primary',
                disabled: Boolean(entry.installed),
                onClick: () => installRemote(entry),
              },
              entry.installed ? t('installed') : t('install'),
            ),
          ),
        )

      const renderLibraryCard = (entry) =>
        h(
          'div',
          { className: 'sf-remote-card sf-library-card', key: entry.repo + '::' + entry.path },
          h(
            'div',
            { className: 'sf-remote-head' },
            h('strong', { className: 'sf-name' }, entry.name),
            h(
              'span',
              { className: 'sf-source sf-rating', title: t('starsAria') },
              '★ ' + entry.rating + ' · ' + (entry.categoryLabel || entry.category),
            ),
            entry.installed
              ? h('span', { className: 'sf-source sf-installed-badge' }, t('installedBadge'))
              : null,
          ),
          h('p', { className: 'sf-desc' }, entry.intro || entry.description || ''),
          h('div', { className: 'sf-remote-meta' }, (entry.repo || '') + (entry.path ? ' · ' + entry.path : '')),
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
                disabled: Boolean(entry.installed),
                onClick: () => installRemote({ ...entry, url: entry.rawUrl || entry.url }),
              },
              entry.installed ? t('installed') : t('install'),
            ),
          ),
        )

      const renderLibrary = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h(
              'button',
              {
                type: 'button',
                className: 'sf-icon-btn',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => setView('skills'),
              },
              h(IconArrowLeft, { size: 16 }),
            ),
            h(
              'div',
              { className: 'sf-subhead-main' },
              h('strong', { className: 'sf-subhead-title' }, t('tabLibrary')),
              h('span', { className: 'sf-subhead-hint' }, t('libraryHint')),
            ),
            libraryMeta
              ? h('span', { className: 'sf-count' }, formatNumber(libraryMeta.total) + ' ' + t('count'))
              : null,
          ),
          h(
            'div',
            { className: 'sf-subfilters' },
            h(
              'div',
              { className: 'sf-toolbar' },
              h(
                'div',
                { className: 'sf-search' },
                h('span', { className: 'sf-search-icon' }, h(IconSearch, { size: 15 })),
                h('input', {
                  className: 'sf-input',
                  type: 'search',
                  value: libraryQuery,
                  placeholder: t('searchRemote'),
                  'aria-label': t('searchRemote'),
                  onChange: (event) => setLibraryQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') loadLibrary(1, false)
                  },
                }),
              ),
              h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadLibrary(1, false) }, t('searchBtn')),
            ),
            h(
              'div',
              { className: 'sf-chiprow' },
              h(
                'button',
                {
                  type: 'button',
                  className: libraryOnlyNew ? 'sf-chip sf-chip-active' : 'sf-chip',
                  onClick: () => {
                    setLibraryOnlyNew(true)
                    loadLibrary(1, false, { onlyNew: true })
                  },
                },
                t('onlyNew'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: libraryOnlyNew ? 'sf-chip' : 'sf-chip sf-chip-active',
                  onClick: () => {
                    setLibraryOnlyNew(false)
                    loadLibrary(1, false, { onlyNew: false })
                  },
                },
                t('allSkills'),
              ),
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
              { className: 'sf-chiprow' },
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
          ),
          h(
            'div',
            { className: 'sf-subscroll sf-scroll' },
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
            libraryLoading && libraryResults.length === 0 ? h(SkeletonList, { rows: 4 }) : null,
            libraryError
              ? EmptyState({
                  className: 'sf-error',
                  icon: h(IconAlert, { size: 20 }),
                  title: t('error'),
                  hint: libraryError,
                  action: h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadLibrary(libraryPage, false) }, t('retry')),
                })
              : null,
            !libraryLoading && !libraryError && libraryResults.length === 0
              ? EmptyState({
                  icon: h(IconLibrary, { size: 20 }),
                  title: t('noLibrary'),
                  hint: t('libraryHint'),
                })
              : null,
            h('div', { className: 'sf-list' }, libraryResults.map(renderLibraryCard), renderRemotePreview()),
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
            h(
              'span',
              { className: 'sf-updates-title' },
              h(IconPulse, { size: 13 }),
              h('span', null, items.length ? items.length + ' ' + t('updatesFound') : t('noUpdates')),
            ),
            items.length
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-secondary sf-btn-sm',
                    disabled: Boolean(updateBusy),
                    onClick: () => performUpdateAction('all'),
                  },
                  busyAll ? t('updating') : t('updateAll'),
                )
              : null,
          ),
          updateError ? h('div', { className: 'sf-update-error sf-error' }, updateError) : null,
          updateNotice ? h('div', { className: 'sf-update-ok', role: 'status' }, updateNotice) : null,
          items.slice(0, 12).map((item, index) => {
            const entry = item && typeof item === 'object' ? item : {}
            const name = entry.name ? String(entry.name) : ''
            const diff = entry.diff && typeof entry.diff === 'object' ? entry.diff : null
            const added = diff && Number.isFinite(Number(diff.added)) ? Number(diff.added) : null
            const removed = diff && Number.isFinite(Number(diff.removed)) ? Number(diff.removed) : null
            const lines =
              diff && Array.isArray(diff.lines)
                ? diff.lines.filter((line) => line && (line.type === '+' || line.type === '-')).slice(0, 4)
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
                    lines.map((line, lineIndex) =>
                      h(
                        'div',
                        {
                          className: line.type === '+' ? 'sf-diff-line sf-diff-add' : 'sf-diff-line sf-diff-del',
                          key: lineIndex,
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
                    className: 'sf-secondary sf-btn-sm',
                    disabled: Boolean(updateBusy),
                    onClick: () => performUpdateAction('update', name),
                  },
                  busy && updateBusy.kind === 'update' ? t('updating') : t('update'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-secondary sf-btn-sm',
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

      const renderUpdatesView = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h(
              'button',
              {
                type: 'button',
                className: 'sf-icon-btn',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => setView('skills'),
              },
              h(IconArrowLeft, { size: 16 }),
            ),
            h(
              'div',
              { className: 'sf-subhead-main' },
              h('strong', { className: 'sf-subhead-title' }, t('updateTitle')),
              h('span', { className: 'sf-subhead-hint' }, t('updateHint')),
            ),
          ),
          h(
            'div',
            { className: 'sf-subfilters' },
            h(
              'div',
              { className: 'sf-subrow' },
              h(
                'button',
                { type: 'button', className: 'sf-secondary sf-btn-sm', onClick: () => checkUpdates() },
                h(IconRefresh, { size: 13 }),
                h('span', null, t('checkUpdates')),
              ),
              updates
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-secondary sf-btn-sm',
                      disabled: Boolean(updateBusy),
                      onClick: () => performUpdateAction('all'),
                    },
                    t('updateAll'),
                  )
                : null,
            ),
          ),
          h(
            'div',
            { className: 'sf-subscroll sf-scroll' },
            updateError ? h('div', { className: 'sf-update-error sf-error' }, updateError) : null,
            updates ? renderUpdates() : EmptyState({
              icon: h(IconPulse, { size: 20 }),
              title: t('updateTitle'),
              hint: t('updateEmpty'),
              action: h(
                'button',
                { type: 'button', className: 'sf-secondary', onClick: () => checkUpdates() },
                t('checkUpdates'),
              ),
            }),
          ),
        )

      const renderFeedback = () => {
        if (!experience || !experience.recent || !experience.recent[0]) return null
        const recent = experience.recent[0]
        if (!recent.outcome && recent.rating === undefined) return null
        return h(
          'div',
          { className: 'sf-feedback' },
          h(
            'span',
            { className: 'sf-feedback-outcome', title: String(recent.outcome || '') },
            h('span', { className: 'sf-feedback-label' }, t('lastOutcome')),
            String(recent.outcome || '').slice(0, 110),
          ),
          h(
            'span',
            { className: 'sf-feedback-actions' },
            h(
              'button',
              {
                type: 'button',
                className: recent.rating === 'good' ? 'sf-fb sf-fb-active' : 'sf-fb',
                disabled: feedbackBusy,
                'aria-label': t('goodAria'),
                onClick: () => sendFeedback(recent.id, 'good'),
              },
              '👍 ' + t('good'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: recent.rating === 'bad' ? 'sf-fb sf-fb-active' : 'sf-fb',
                disabled: feedbackBusy,
                'aria-label': t('badAria'),
                onClick: () => sendFeedback(recent.id, 'bad'),
              },
              '👎 ' + t('bad'),
            ),
          ),
        )
      }

      const renderExperience = () => {
        if (!experience) return null
        const topSkills =
          Array.isArray(experience.topSkills) ? experience.topSkills.filter((stat) => stat && typeof stat === 'object') : []
        const totalUses = topSkills.reduce((sum, stat) => sum + (Number(stat.uses) || 0), 0)
        const successValues = topSkills.map((stat) => Number(stat.successRate)).filter((value) => Number.isFinite(value))
        const avgSuccess = successValues.length
          ? successValues.reduce((sum, value) => sum + value, 0) / successValues.length
          : null
        const durations = topSkills.map((stat) => Number(stat.avgDurationMs)).filter((value) => Number.isFinite(value))
        const avgDuration = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null
        const health = experience.health && typeof experience.health === 'object' ? experience.health : null
        const tracked = health && Number.isFinite(Number(health.installed)) ? Number(health.installed) : topSkills.length
        const healthGroups = [
          ['healthFailing', 'failing', 'danger'],
          ['healthStale', 'stale', 'warn'],
          ['healthLicenseUnknown', 'licenseUnknown', 'warn'],
          ['healthNeverUsed', 'neverUsed', 'idle'],
        ]
        const healthRows = health
          ? healthGroups
              .map(([key, field, tone]) => {
                const list = Array.isArray(health[field]) ? health[field] : []
                const names = list.map(healthEntryName).filter(Boolean).slice(0, 5)
                if (!names.length) return null
                return h(
                  'div',
                  { className: 'sf-health-row sf-health-' + tone, key: field },
                  h('span', { className: 'sf-health-dot' }),
                  h('span', { className: 'sf-health-label' }, t(key) + ' ' + list.length),
                  h('span', { className: 'sf-health-names' }, names.join(' · ')),
                )
              })
              .filter(Boolean)
          : []
        const successTone =
          avgSuccess === null ? '' : avgSuccess >= 0.7 ? ' sf-tone-ok' : avgSuccess <= 0.4 ? ' sf-tone-bad' : ''
        const statTiles = [
          { label: t('statEntries'), value: formatNumber(experience.totalEntries) },
          { label: t('statSkills'), value: formatNumber(tracked), hint: t('totalUses') + ' ' + formatNumber(totalUses) },
          { label: t('statSuccess'), value: avgSuccess === null ? '—' : formatPercent(avgSuccess), tone: successTone },
          { label: t('statDuration'), value: formatDuration(avgDuration) },
        ]
        return h(
          'section',
          { className: 'sf-section sf-xp-section', title: experience.path || '' },
          h(SectionHead, {
            icon: h(IconChart, { size: 14 }),
            title: t('experience'),
            hint: t('experienceOverview'),
            badge: Number.isFinite(Number(experience.totalEntries)) ? formatNumber(experience.totalEntries) : '',
            actions: h(
              React.Fragment,
              null,
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-secondary sf-btn-sm',
                  disabled: xpBusy === 'export',
                  onClick: () => exportExperience(),
                },
                xpBusy === 'export' ? t('exportBusy') : t('exportExperience'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-secondary sf-btn-sm',
                  disabled: xpBusy === 'import',
                  onClick: () => importExperience(),
                },
                xpBusy === 'import' ? t('importBusy') : t('importExperience'),
              ),
            ),
          }),
          h(
            'div',
            { className: 'sf-stat-grid' },
            statTiles.map((tile) =>
              h(
                'div',
                { className: 'sf-stat', key: tile.label },
                h('span', { className: 'sf-stat-label' }, tile.label),
                h('strong', { className: 'sf-stat-value' + (tile.tone || '') }, tile.value),
                tile.hint ? h('span', { className: 'sf-stat-hint' }, tile.hint) : null,
              ),
            ),
          ),
          topSkills.length
            ? h(
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
                topSkills.slice(0, 8).map((stat) => {
                  const rate = Number(stat.successRate)
                  const tone = Number.isFinite(rate) ? (rate >= 0.7 ? 'sf-tone-ok' : rate <= 0.4 ? 'sf-tone-bad' : 'sf-tone-mid') : ''
                  return h(
                    'div',
                    { className: 'sf-xp-row', key: stat.name },
                    h('code', { className: 'sf-xp-name' }, stat.name),
                    h('span', null, stat.uses === undefined || stat.uses === null ? '—' : String(stat.uses)),
                    h('span', { className: tone }, formatPercent(stat.successRate)),
                    h('span', null, formatDuration(stat.avgDurationMs)),
                  )
                }),
              )
            : h(
                'div',
                { className: 'sf-xp-row sf-xp-row-head' },
                h('span', null, t('tabSkills')),
                h('span', null, t('usesLabel')),
                h('span', null, t('successRate')),
                h('span', null, t('avgDuration')),
              ),
          renderFeedback(),
          health
            ? h(
                'div',
                { className: 'sf-health' },
                h(
                  'div',
                  { className: 'sf-health-title' },
                  h(IconShield, { size: 13 }),
                  h('span', null, t('experienceHealth')),
                ),
                healthRows.length
                  ? healthRows
                  : h(
                      'div',
                      { className: 'sf-health-row sf-health-ok' },
                      h('span', { className: 'sf-health-dot' }),
                      h('span', { className: 'sf-health-label' }, t('healthOk')),
                    ),
              )
            : null,
          xpStatus
            ? h(
                'div',
                {
                  className: xpStatus.kind === 'error' ? 'sf-xp-status sf-error' : 'sf-xp-status sf-ok',
                  role: 'status',
                },
                xpStatus.kind === 'error' ? h(IconAlert, { size: 12 }) : h(IconCheck, { size: 12 }),
                h('span', null, xpStatus.text),
              )
            : null,
          !topSkills.length && !healthRows.length
            ? h('div', { className: 'sf-subhint' }, t('noExperience'))
            : null,
        )
      }

      const renderEvolution = () => {
        if (!evolution) return null
        const weights = evolution.weights && typeof evolution.weights === 'object' ? evolution.weights : {}
        const bounds = evolution.bounds && typeof evolution.bounds === 'object' ? evolution.bounds : {}
        const contentLabels = evolution.contentLabels && typeof evolution.contentLabels === 'object' ? evolution.contentLabels : {}
        const labelFor = (key) => {
          if (contentLabels[key]) return String(contentLabels[key])
          const fallback = { token: 'weightToken', name: 'weightName', category: 'weightCategory', experience: 'weightExperience' }
          return t(fallback[key] || key)
        }
        const weightKeys = ['token', 'name', 'category', 'experience'].filter((key) =>
          Number.isFinite(Number(weights[key])),
        )
        const stats = evolution.stats && typeof evolution.stats === 'object' ? evolution.stats : {}
        const rate = Number.isFinite(Number(stats.successRate)) ? Math.round(Number(stats.successRate) * 100) : null
        const sinceEval = Number.isFinite(Number(evolution.observationsSinceEval)) ? Number(evolution.observationsSinceEval) : 0
        const history = Array.isArray(evolution.recentHistory) ? evolution.recentHistory : []
        const sortedHistory = history
          .slice()
          .sort((left, right) => String((right && right.at) || '').localeCompare(String((left && left.at) || '')))
        const changeRows = sortedHistory.slice(0, 3).flatMap((entry) =>
          (Array.isArray(entry.changes) ? entry.changes : []).slice(0, 4).map((change, index) => ({
            key: 'evolution-' + String(entry.at) + '-' + index,
            label:
              String(change.label || change.weight || '') +
              ' ' +
              String(change.from === undefined ? '—' : change.from) +
              ' → ' +
              String(change.to === undefined ? '—' : change.to),
            reason: change.reason || '',
            at: entry.at,
          })),
        )
        const hasQuota = Number.isFinite(Number(evolution.explorationRate)) && Number(evolution.explorationRate) >= 0
        const explorationRate = hasQuota ? Number(evolution.explorationRate) : 0
        const explorationOptions = [0, 0.1, 0.2]
        const quotaChoice = explorationOptions.reduce(
          (best, option) => (Math.abs(option - explorationRate) < Math.abs(best - explorationRate) ? option : best),
          explorationOptions[0],
        )
        const categoryWeights =
          evolution.categoryWeights && typeof evolution.categoryWeights === 'object' ? evolution.categoryWeights : null
        const categoryLabels =
          evolution.categoryLabels && typeof evolution.categoryLabels === 'object' ? evolution.categoryLabels : {}
        const categoryBounds = Array.isArray(evolution.categoryBounds) ? evolution.categoryBounds : [0.5, 2]
        const byCategory = stats.byCategory && typeof stats.byCategory === 'object' ? stats.byCategory : null
        const categoryKeys = categoryWeights
          ? Object.keys(categoryWeights).filter((key) => Number.isFinite(Number(categoryWeights[key])))
          : []
        const learning = evolution.learning && typeof evolution.learning === 'object' ? evolution.learning : null
        const explorationStats = stats.exploration && typeof stats.exploration === 'object' ? stats.exploration : null
        const learningTiles = []
        const servedValue =
          learning && Number.isFinite(Number(learning.exploredServed))
            ? Number(learning.exploredServed)
            : explorationStats && Number.isFinite(Number(explorationStats.served))
              ? Number(explorationStats.served)
              : null
        const feedbackValue =
          learning && Number.isFinite(Number(learning.exploredRecommendations))
            ? Number(learning.exploredRecommendations)
            : explorationStats && Number.isFinite(Number(explorationStats.attempts))
              ? Number(explorationStats.attempts)
              : null
        const adoptedValue =
          learning && Number.isFinite(Number(learning.explorationAdopted))
            ? Number(learning.explorationAdopted)
            : explorationStats && Number.isFinite(Number(explorationStats.adopted))
              ? Number(explorationStats.adopted)
              : null
        if (learning) {
          if (Number.isFinite(Number(learning.skillsTracked)))
            learningTiles.push({ label: t('learningSkills'), value: formatNumber(learning.skillsTracked) })
          if (Number.isFinite(Number(learning.avgAffinity)))
            learningTiles.push({ label: t('learningAffinity'), value: formatAffinity(learning.avgAffinity) })
          if (feedbackValue !== null) learningTiles.push({ label: t('learningExplored'), value: formatNumber(feedbackValue) })
          if (adoptedValue !== null) learningTiles.push({ label: t('learningAdopted'), value: formatNumber(adoptedValue) })
        }
        const learningNote =
          servedValue !== null || feedbackValue !== null || adoptedValue !== null
            ? (servedValue !== null ? t('learningServed') + ' ' + formatNumber(servedValue) : '') +
              (feedbackValue !== null ? (servedValue !== null ? ' · ' : '') + t('learningExplored') + ' ' + formatNumber(feedbackValue) : '') +
              (adoptedValue !== null ? (servedValue !== null || feedbackValue !== null ? ' · ' : '') + t('learningAdopted') + ' ' + formatNumber(adoptedValue) : '')
            : ''
        const explorationGood = explorationStats && Number.isFinite(Number(explorationStats.good)) ? Number(explorationStats.good) : null
        const explorationBad = explorationStats && Number.isFinite(Number(explorationStats.bad)) ? Number(explorationStats.bad) : null

        return h(
          'section',
          { className: 'sf-section sf-evolution', title: evolution.path || '' },
          h(SectionHead, {
            icon: h(IconSliders, { size: 14 }),
            title: t('evolution'),
            hint: t('evolutionHint'),
          }),
          h(
            'div',
            { className: 'sf-stat-grid sf-stat-grid-3' },
            h(
              'div',
              { className: 'sf-stat' },
              h('span', { className: 'sf-stat-label' }, t('evolutionRate')),
              h('strong', { className: 'sf-stat-value sf-tone-ok' }, rate === null ? '—' : rate + '%'),
              h('span', { className: 'sf-stat-hint' }, t('evolutionObs') + ' ' + formatNumber(sinceEval)),
            ),
            h(
              'div',
              { className: 'sf-stat' },
              h('span', { className: 'sf-stat-label' }, t('evolutionHistory')),
              h('strong', { className: 'sf-stat-value' }, formatNumber(changeRows.length)),
              h(
                'span',
                { className: 'sf-stat-hint' },
                history.length ? formatNumber(history.length) + ' ' + t('historyCount') : t('evolutionNone'),
              ),
            ),
            h(
              'div',
              { className: 'sf-stat' },
              h('span', { className: 'sf-stat-label' }, hasQuota ? t('exploration') : t('evolutionWeights')),
              h(
                'strong',
                { className: 'sf-stat-value' },
                hasQuota ? Math.round(explorationRate * 100) + '%' : formatNumber(weightKeys.length),
              ),
              hasQuota
                ? h(
                    'span',
                    { className: 'sf-stat-hint' },
                    adoptedValue !== null
                      ? t('learningAdopted') + ' ' + formatNumber(adoptedValue)
                      : t('exploration'),
                  )
                : null,
            ),
          ),
          h(
            'div',
            { className: 'sf-evo-block' },
            h(
              'div',
              { className: 'sf-evo-block-head' },
              h('span', { className: 'sf-evo-block-title' }, t('evolutionWeights')),
              h('span', { className: 'sf-evo-note' }, t('weightsHint')),
            ),
            h(
              'div',
              { className: 'sf-weight-list' },
              weightKeys.map((key) => {
                const range = Array.isArray(bounds[key]) ? bounds[key] : [0, Math.max(Number(weights[key]) * 1.5, 1)]
                const percent = percentBetween(weights[key], range[0], range[1])
                return h(
                  'div',
                  { className: 'sf-weight', key: key },
                  h(
                    'div',
                    { className: 'sf-weight-head' },
                    h('span', { className: 'sf-weight-name' }, labelFor(key) + ' ×' + String(weights[key])),
                    h('span', { className: 'sf-weight-range' }, String(range[0]) + '–' + String(range[1])),
                  ),
                  h(ProgressBar, { percent, tone: 'accent', label: labelFor(key) }),
                )
              }),
            ),
          ),
          hasQuota
            ? h(
                'div',
                { className: 'sf-evo-block sf-quota' },
                h(
                  'div',
                  { className: 'sf-evo-block-head' },
                  h('span', { className: 'sf-evo-block-title' }, t('exploration')),
                  h('span', { className: 'sf-quota-value' }, Math.round(explorationRate * 100) + '%'),
                ),
                h('p', { className: 'sf-evo-hint' }, t('explorationHint')),
                h(
                  'div',
                  { className: 'sf-quota-row' },
                  h(Segmented, {
                    label: t('quotaAria'),
                    value: quotaChoice,
                    busy: quotaBusy,
                    onChange: (value) => changeExplorationRate(value),
                    options: explorationOptions.map((value) => ({ value, label: Math.round(value * 100) + '%' })),
                  }),
                  explorationStats
                    ? h(
                        'span',
                        { className: 'sf-quota-stats' },
                        (Number.isFinite(Number(explorationStats.attempts))
                          ? t('exploreAttempts') + ' ' + formatNumber(explorationStats.attempts)
                          : '') +
                          (Number.isFinite(Number(explorationStats.adopted))
                            ? ' · ' + t('exploreAdopted') + ' ' + formatNumber(explorationStats.adopted)
                            : '') +
                          (explorationGood !== null ? ' · 👍 ' + explorationGood : '') +
                          (explorationBad !== null ? ' · 👎 ' + explorationBad : ''),
                      )
                    : null,
                ),
              )
            : null,
          categoryKeys.length
            ? h(
                'div',
                { className: 'sf-evo-block' },
                h(
                  'div',
                  { className: 'sf-evo-block-head' },
                  h('span', { className: 'sf-evo-block-title' }, t('evolutionCategories')),
                  h(
                    'span',
                    { className: 'sf-evo-note' },
                    Array.isArray(evolution.categoryBounds)
                      ? String(categoryBounds[0]) + '–' + String(categoryBounds[1])
                      : String(categoryBounds[0]) + '–' + String(categoryBounds[1]),
                  ),
                ),
                h(
                  'div',
                  { className: 'sf-weight-list' },
                  categoryKeys.map((key) => {
                    const value = Number(categoryWeights[key])
                    const percent = percentBetween(value, categoryBounds[0], categoryBounds[1])
                    const counts = byCategory && byCategory[key] && typeof byCategory[key] === 'object' ? byCategory[key] : null
                    const feedback =
                      counts && (Number.isFinite(Number(counts.good)) || Number.isFinite(Number(counts.bad)))
                        ? ' 👍' + formatNumber(counts.good || 0) + ' · 👎' + formatNumber(counts.bad || 0)
                        : ''
                    return h(
                      'div',
                      { className: 'sf-weight', key: key },
                      h(
                        'div',
                        { className: 'sf-weight-head' },
                        h(
                          'span',
                          { className: 'sf-weight-name' },
                          (categoryLabels[key] || categoryLabel(t, key)) + ' ×' + String(categoryWeights[key]),
                        ),
                        h('span', { className: 'sf-weight-range' }, feedback),
                      ),
                      h(ProgressBar, { percent, tone: 'calm', label: categoryLabels[key] || categoryLabel(t, key) }),
                    )
                  }),
                ),
              )
            : null,
          learningTiles.length
            ? h(
                'div',
                { className: 'sf-evo-block' },
                h(
                  'div',
                  { className: 'sf-evo-block-head' },
                  h('span', { className: 'sf-evo-block-title' }, t('evolutionLearning')),
                ),
                h(
                  'div',
                  { className: 'sf-learn-grid' },
                  learningTiles.map((tile) =>
                    h(
                      'div',
                      { className: 'sf-learn', key: tile.label },
                      h('span', { className: 'sf-learn-label' }, tile.label),
                      h('strong', { className: 'sf-learn-value' }, tile.value),
                    ),
                  ),
                ),
                learningNote ? h('div', { className: 'sf-learn-note' }, learningNote) : null,
              )
            : null,
          h(
            'div',
            { className: 'sf-evo-block' },
            h(
              'div',
              { className: 'sf-evo-block-head' },
              h('span', { className: 'sf-evo-block-title' }, t('evolutionHistory')),
            ),
            changeRows.length
              ? h(
                  'div',
                  { className: 'sf-timeline' },
                  changeRows.map((row) =>
                    h(
                      'div',
                      { className: 'sf-timeline-row', key: row.key },
                      h('span', { className: 'sf-timeline-dot' }),
                      h(
                        'div',
                        { className: 'sf-timeline-body' },
                        h(
                          'div',
                          { className: 'sf-timeline-head' },
                          h('span', { className: 'sf-timeline-label' }, row.label),
                          row.at ? h('span', { className: 'sf-timeline-time' }, formatTime(row.at)) : null,
                        ),
                        row.reason ? h('div', { className: 'sf-timeline-reason' }, row.reason) : null,
                      ),
                    ),
                  ),
                )
              : h('div', { className: 'sf-timeline-empty' }, t('evolutionNone')),
          ),
          h(
            'div',
            { className: 'sf-evo-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'sf-primary sf-btn-sm',
                disabled: Boolean(evolutionBusy),
                onClick: () => runEvolutionAction('evaluate'),
              },
              h(IconSparkle, { size: 13 }),
              h('span', null, evolutionBusy === 'evaluate' ? t('evolutionBusy') : t('evaluateEvolution')),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'sf-secondary sf-btn-sm',
                disabled: Boolean(evolutionBusy) || !evolution.canRollback,
                onClick: () => runEvolutionAction('rollback'),
              },
              t('rollbackEvolution'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'sf-secondary sf-btn-sm',
                disabled: Boolean(evolutionBusy),
                onClick: () => runEvolutionAction('reset'),
              },
              t('resetEvolution'),
            ),
          ),
          evolutionNotice
            ? h(
                'div',
                {
                  className: evolutionNotice.kind === 'error' ? 'sf-xp-status sf-error' : 'sf-xp-status sf-ok',
                  role: 'status',
                },
                evolutionNotice.kind === 'error' ? h(IconAlert, { size: 12 }) : h(IconCheck, { size: 12 }),
                h('span', null, evolutionNotice.text),
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
            h(
              'button',
              {
                type: 'button',
                className: 'sf-icon-btn',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => setView('skills'),
              },
              h(IconArrowLeft, { size: 16 }),
            ),
            h(
              'div',
              { className: 'sf-subhead-main' },
              h('strong', { className: 'sf-subhead-title' }, t('discoverTitle')),
              h('span', { className: 'sf-subhead-hint' }, t('remoteHint')),
            ),
          ),
          h(
            'div',
            { className: 'sf-subfilters' },
            h(
              'div',
              { className: 'sf-toolbar' },
              h(
                'div',
                { className: 'sf-search' },
                h('span', { className: 'sf-search-icon' }, h(IconSearch, { size: 15 })),
                h('input', {
                  className: 'sf-input',
                  type: 'search',
                  value: remoteQuery,
                  placeholder: t('searchRemote'),
                  'aria-label': t('searchRemote'),
                  onChange: (event) => setRemoteQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') loadRemote(remoteQuery)
                  },
                }),
              ),
              h(
                'button',
                { type: 'button', className: 'sf-secondary', onClick: () => loadRemote(remoteQuery) },
                t('searchBtn'),
              ),
            ),
            h(
              'div',
              { className: 'sf-subrow' },
              h(
                'button',
                { type: 'button', className: 'sf-secondary sf-btn-sm', onClick: () => loadRemote(remoteQuery) },
                h(IconRefresh, { size: 13 }),
                h('span', null, t('refreshIndex')),
              ),
              h(
                'button',
                { type: 'button', className: 'sf-secondary sf-btn-sm', onClick: () => checkUpdates() },
                h(IconPulse, { size: 13 }),
                h('span', null, t('checkUpdates')),
              ),
            ),
          ),
          h(
            'div',
            { className: 'sf-subscroll sf-scroll' },
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
            remoteLoading && remoteResults.length === 0 ? h(SkeletonList, { rows: 4 }) : null,
            remoteError
              ? EmptyState({
                  className: 'sf-error',
                  icon: h(IconAlert, { size: 20 }),
                  title: t('error'),
                  hint: remoteError,
                  action: h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadRemote(remoteQuery) }, t('retry')),
                })
              : null,
            !remoteLoading && !remoteError && remoteResults.length === 0
              ? EmptyState({ icon: h(IconGlobe, { size: 20 }), title: t('noRemote'), hint: t('remoteHint') })
              : null,
            h('div', { className: 'sf-list' }, remoteResults.map(renderRemoteCard), renderRemotePreview()),
          ),
        )

      const renderTools = () =>
        h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'sf-subhead' },
            h(
              'button',
              {
                type: 'button',
                className: 'sf-icon-btn',
                'aria-label': t('close'),
                title: t('close'),
                onClick: () => setView('skills'),
              },
              h(IconArrowLeft, { size: 16 }),
            ),
            h(
              'div',
              { className: 'sf-subhead-main' },
              h('strong', { className: 'sf-subhead-title' }, t('toolsTitle')),
              h('span', { className: 'sf-subhead-hint' }, t('toolsHint')),
            ),
          ),
          h(
            'div',
            { className: 'sf-subfilters' },
            h(
              'div',
              { className: 'sf-toolbar' },
              h(
                'div',
                { className: 'sf-search' },
                h('span', { className: 'sf-search-icon' }, h(IconSearch, { size: 15 })),
                h('input', {
                  className: 'sf-input',
                  type: 'search',
                  value: toolsQuery,
                  placeholder: t('searchTools'),
                  'aria-label': t('searchTools'),
                  onChange: (event) => setToolsQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') loadTools(toolsQuery)
                  },
                }),
              ),
              h(
                'button',
                { type: 'button', className: 'sf-secondary', onClick: () => loadTools(toolsQuery) },
                t('searchBtn'),
              ),
            ),
          ),
          h(
            'div',
            { className: 'sf-subscroll sf-scroll' },
            toolsLoading && toolsResults.length === 0 ? h(SkeletonList, { rows: 4 }) : null,
            toolsError
              ? EmptyState({
                  className: 'sf-error',
                  icon: h(IconAlert, { size: 20 }),
                  title: t('error'),
                  hint: toolsError,
                  action: h('button', { type: 'button', className: 'sf-secondary', onClick: () => loadTools(toolsQuery) }, t('retry')),
                })
              : null,
            !toolsLoading && !toolsError && toolsResults.length === 0
              ? EmptyState({ icon: h(IconTools, { size: 20 }), title: t('noTools'), hint: t('toolsHint') })
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
          ),
        )

      const renderRecoItem = (item, index) => {
        const detail = Array.isArray(item.reasonsDetail)
          ? item.reasonsDetail.filter(
              (entry) =>
                entry &&
                typeof entry.label === 'string' &&
                entry.label.trim() &&
                entry.kind !== 'explore',
            )
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
            className: item.exploration ? 'sf-reco-item sf-reco-explore' : 'sf-reco-item',
            'aria-label': item.name,
            onClick: () => revealSkill(item.name),
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                revealSkill(item.name)
              }
            },
          },
          h('span', { className: 'sf-reco-rank' }, String(index + 1)),
          h(
            'div',
            { className: 'sf-reco-main' },
            h(
              'div',
              { className: 'sf-reco-title' },
              h('code', { className: 'sf-reco-name' }, item.name),
              item.exploration
                ? h(
                    'span',
                    { className: 'sf-reco-badge sf-reco-badge-explore', title: t('exploration') },
                    h(IconSparkle, { size: 11 }),
                    h('span', null, t('explorationBadge')),
                  )
                : null,
              h(
                'span',
                { className: 'sf-reco-score', title: t('recommend') + ' ' + formatScore(item.score) },
                formatScore(item.score),
              ),
            ),
            detail.length
              ? h(
                  'div',
                  { className: 'sf-reco-badges' },
                  detail.slice(0, 3).map((reason, reasonIndex) =>
                    h(
                      'span',
                      {
                        key: String(reason.kind || 'reason') + ':' + reasonIndex,
                        className: 'sf-reco-badge sf-reco-badge-' + String(reason.kind || 'reason'),
                        title: reason.detail ? String(reason.detail) : '',
                      },
                      String(reason.label),
                    ),
                  ),
                )
              : (item.reasons || []).length
                ? h('span', { className: 'sf-reco-reasons' }, (item.reasons || []).join(' · '))
                : null,
            h('p', { className: 'sf-reco-intro' }, item.intro || item.description || ''),
            h(
              'div',
              { className: 'sf-reco-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-reco-btn sf-reco-btn-primary',
                  disabled: busy,
                  title: t('copySkillAria'),
                  'aria-label': t('copySkillAria') + ': ' + item.name,
                  onClick: (event) => {
                    event.stopPropagation()
                    copyCommand(item.name, topReasonKind(item))
                  },
                },
                copied === item.name ? h(IconCheck, { size: 12 }) : h(IconCopy, { size: 12 }),
                h(
                  'span',
                  null,
                  (copied === item.name ? t('copied') : t('copySkill')) +
                    (counts && Number.isFinite(Number(counts.adopt)) && Number(counts.adopt) > 0
                      ? ' ' + Number(counts.adopt)
                      : ''),
                ),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'sf-reco-btn',
                  disabled: busy,
                  'aria-label': t('goodAria'),
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
                  'aria-label': t('badAria'),
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
          ),
        )
      }

      const comboLabel = (value) =>
        !value ? '' : value.source === 'active' ? t('comboActive') : value.source === 'recent' ? t('comboRecent') : t('comboRecommended')

      const renderCombo = () => {
        if (!combo) return null
        const names = Array.isArray(combo.names) && combo.names.length ? combo.names : combo.skills.map((item) => item.name)
        const rating =
          combo.rating !== null && combo.rating !== undefined && Number.isFinite(Number(combo.rating))
            ? Number(combo.rating)
            : null
        const localRate =
          combo.localRate !== null && combo.localRate !== undefined && Number.isFinite(Number(combo.localRate))
            ? Number(combo.localRate)
            : null
        return h(
          'section',
          { className: 'sf-combo sf-combo-' + (combo.source || 'recommended'), 'aria-label': t('comboTitle') },
          h('span', { className: 'sf-combo-dot' }),
          h(
            'div',
            { className: 'sf-combo-body' },
            h(
              'div',
              { className: 'sf-combo-row' },
              h('span', { className: 'sf-combo-label' }, t('comboTitle')),
              h('span', { className: 'sf-combo-kind' }, comboLabel(combo)),
              h(
                'span',
                { className: 'sf-combo-rating', title: t('comboRating') },
                rating !== null
                  ? '★ ' + rating.toFixed(1)
                  : localRate !== null
                    ? t('comboLocalRate') + ' ' + localRate + '%'
                    : '★ —',
              ),
              h('span', { className: 'sf-combo-names' }, names.join(' × ')),
            ),
            h(
              'div',
              { className: 'sf-combo-why' },
              h('span', { className: 'sf-combo-why-label' }, t('comboWhy')),
              h('span', { className: 'sf-combo-why-text' }, String(combo.why || '')),
            ),
          ),
        )
      }

      const toggleAutoInstall = () => {
        const next = !autoInstallBetter
        setAutoInstallBetter(next)
        try {
          window.localStorage.setItem('ronge.autoInstallBetter', next ? '1' : '0')
        } catch {
          // Preference is best-effort.
        }
      }

      const installStateFor = (entry) =>
        remoteInstall && remoteInstall.name === entry.name ? remoteInstall : null

      const installButton = (entry, label) => {
        const state = installStateFor(entry)
        const busy = state && state.status === 'installing'
        const done = state && state.status === 'installed'
        return h(
          'button',
          {
            type: 'button',
            className: 'sf-primary',
            disabled: Boolean(busy || done),
            onClick: () => installRemote({ name: entry.name, url: entry.rawUrl || entry.url, trust: entry.trust }),
          },
          busy ? t('installing') : done ? t('installed') : label,
        )
      }

      const installStatusLine = (entry) => {
        const state = installStateFor(entry)
        if (!state || state.status === 'installing') return null
        if (state.status === 'error') {
          return h('div', { className: 'sf-install-error' }, t('installFailed') + ': ' + String(state.error || ''))
        }
        if (state.status === 'installed') {
          return h('div', { className: 'sf-install-ok' }, t('installed') + ' ' + String(state.path || ''))
        }
        return null
      }

      const renderBetter = () => {
        if (!betterOptions.length) return null
        return h(
          'section',
          { className: 'sf-better' },
          h(SectionHead, {
            icon: h(IconSparkle, { size: 14 }),
            title: t('betterTitle'),
            hint: t('betterHint'),
            badge: String(betterOptions.length),
            actions: h(
              'button',
              {
                type: 'button',
                className: autoInstallBetter ? 'sf-chip sf-chip-active' : 'sf-chip',
                'aria-pressed': autoInstallBetter,
                onClick: toggleAutoInstall,
              },
              t('autoInstallBetter'),
            ),
          }),
          h(
            'div',
            { className: 'sf-better-list' },
            betterOptions.map((entry) =>
              h(
                'div',
                { className: 'sf-better-card', key: entry.name },
                h(
                  'div',
                  { className: 'sf-better-head' },
                  h('strong', { className: 'sf-name' }, entry.name),
                  h('span', { className: 'sf-rating' }, '★ ' + entry.rating + ' · ' + (entry.categoryLabel || entry.category)),
                ),
                h('p', { className: 'sf-desc' }, entry.intro || entry.description || ''),
                Array.isArray(entry.matched) && entry.matched.length
                  ? h(
                      'div',
                      { className: 'sf-better-matched' },
                      t('betterMatched') + ': ' + entry.matched.slice(0, 5).join(' · '),
                    )
                  : null,
                h('div', { className: 'sf-better-why' }, t('betterWhy') + ': ' + String(entry.whyBetter || '')),
                installStatusLine(entry),
                h(
                  'div',
                  { className: 'sf-better-actions' },
                  installButton(entry, t('installUse')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-secondary',
                      onClick: () => setIgnoredBetter((current) => current.concat(entry.name)),
                    },
                    t('ignore'),
                  ),
                ),
              ),
            ),
          ),
        )
      }

      const renderDiscoveries = () => {
        if (!discoveries.length) return null
        return h(
          'section',
          { className: 'sf-discoveries' },
          h(SectionHead, {
            icon: h(IconLibrary, { size: 14 }),
            title: t('newFromLibrary'),
            hint: t('newFromLibraryHint'),
            badge: String(discoveries.length),
          }),
          h(
            'div',
            { className: 'sf-discovery-list' },
            discoveries.map((entry) =>
              h(
                'div',
                { className: 'sf-discovery-card', key: entry.name },
                h(
                  'div',
                  { className: 'sf-discovery-head' },
                  h('strong', { className: 'sf-name' }, entry.name),
                  h(
                    'span',
                    { className: 'sf-source sf-rating' },
                    '★ ' + entry.rating + ' · ' + (entry.categoryLabel || entry.category || ''),
                  ),
                ),
                h('p', { className: 'sf-desc' }, entry.intro || entry.description || ''),
                Array.isArray(entry.matched) && entry.matched.length
                  ? h(
                      'div',
                      { className: 'sf-better-matched' },
                      t('betterMatched') + ': ' + entry.matched.slice(0, 5).join(' · '),
                    )
                  : null,
                installStatusLine(entry),
                h(
                  'div',
                  { className: 'sf-discovery-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-secondary',
                      onClick: () => openRemotePreview({ ...entry, url: entry.rawUrl || entry.url }),
                    },
                    t('preview'),
                  ),
                  installButton(entry, t('install')),
                ),
              ),
            ),
          ),
        )
      }

      const renderRecommendations = () =>
        h(
          'section',
          { className: 'sf-reco' },
          h(SectionHead, {
            icon: h(IconSparkle, { size: 14 }),
            title: t('recommend'),
            hint: t('recommendHint'),
            badge: recommendations.length ? String(recommendations.length) : '',
          }),
          data && (data.contextPreview || data.contextWindow)
            ? h(
                'div',
                { className: 'sf-reco-context' },
                h('span', { className: 'sf-reco-context-label' }, t('basedOn')),
                h('span', { className: 'sf-reco-context-text' }, String(data.contextPreview || '')),
                data.contextWindow
                  ? h(
                      'span',
                      { className: 'sf-reco-context-meta' },
                      t('recentMessages') +
                        ' ' +
                        String(data.contextWindow.messages || 0) +
                        ' · ' +
                        t('projectFiles') +
                        ' ' +
                        String(data.contextWindow.files || 0) +
                        (Array.isArray(data.contextWindow.snippets) && data.contextWindow.snippets.length
                          ? ' · ' + t('projectDocs') + ' ' + data.contextWindow.snippets.length
                          : ''),
                    )
                  : null,
              )
            : null,
          recommendations.length
            ? h('div', { className: 'sf-reco-list' }, recommendations.map((item, index) => renderRecoItem(item, index)))
            : EmptyState({
                icon: h(IconSparkle, { size: 18 }),
                title: t('noRecommend'),
                action: h(
                  'button',
                  { type: 'button', className: 'sf-secondary sf-btn-sm', onClick: () => load(state.sessionId) },
                  t('refresh'),
                ),
              }),
        )

      const renderActive = () =>
        shownSkills.length
          ? h(
              'div',
              { className: 'sf-active' },
              h(
                'span',
                { className: 'sf-active-label' },
                h('span', { className: 'sf-active-pulse' }),
                activeSkills.length ? t('activeNow') : t('recentUsed'),
              ),
              h(
                'div',
                { className: 'sf-active-chips' },
                shownSkills.slice(0, 8).map((skill) =>
                  h('span', { key: skill.name, className: 'sf-active-chip' }, skill.name),
                ),
              ),
            )
          : null

      const renderCatalog = () =>
        h(
          'section',
          { className: 'sf-catalog' },
          h(SectionHead, {
            icon: h(IconSkills, { size: 14 }),
            title: t('skillCatalog'),
            hint: filtered.length + ' ' + t('count'),
            actions:
              normalized
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-secondary sf-btn-sm',
                      onClick: () => setQuery(''),
                    },
                    t('all'),
                  )
                : null,
          }),
          normalized && filtered.length
            ? h('div', { className: 'sf-filter-note' }, normalized + ' · ' + filtered.length + ' ' + t('count'))
            : null,
          groups.length
            ? groups.map((group) =>
                h(
                  'div',
                  { className: 'sf-group', key: group.key },
                  h(
                    'div',
                    { className: 'sf-group-head' },
                    h('span', { className: 'sf-group-icon' }, h(CategoryIcon, { category: group.key, size: 13 })),
                    h('span', { className: 'sf-group-label' }, group.label),
                    h('span', { className: 'sf-group-count' }, String(group.items.length)),
                  ),
                  group.items.map((skill) =>
                    h(SkillCard, {
                      key: skill.name,
                      skill,
                      t,
                      expanded: expanded === skill.name,
                      copied: copied === skill.name,
                      onToggle: () => setExpanded((current) => (current === skill.name ? null : skill.name)),
                      onCopy: copyName,
                    }),
                  ),
                ),
              )
            : EmptyState({
                icon: h(IconSearch, { size: 20 }),
                title: t('empty'),
                hint: normalized ? normalized : undefined,
                action: normalized
                  ? h(
                      'button',
                      { type: 'button', className: 'sf-secondary sf-btn-sm', onClick: () => setQuery('') },
                      t('all'),
                    )
                  : null,
              }),
        )

      const scopeKey = data && data.scope
        ? String(data.scope).indexOf('session') === 0
          ? 'scopeSession'
          : String(data.scope).indexOf('scan') === 0
            ? 'scopeScan'
            : 'scopeGlobal'
        : null

      const tabs = [
        { value: 'skills', label: t('tabSkills'), icon: IconSkills },
        { value: 'library', label: t('tabLibrary'), icon: IconLibrary },
        { value: 'discover', label: t('tabUpdates'), icon: IconPulse },
      ]
      const onTabsKeyDown = (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
        event.preventDefault()
        const order = tabs.map((tab) => tab.value)
        const current = Math.max(0, order.indexOf(view))
        const step = event.key === 'ArrowRight' ? 1 : -1
        const next = (current + step + order.length) % order.length
        changeView(order[next])
        const buttons = event.currentTarget.querySelectorAll('.sf-tab')
        if (buttons[next] && typeof buttons[next].focus === 'function') buttons[next].focus()
      }

      const busy = Boolean(loading && !data)
      const showError = Boolean(error && !data)

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h('div', { className: 'sf-backdrop', onClick: close, 'aria-hidden': true }),
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
                { className: 'sf-brand' },
                h('span', { className: 'sf-mark' }, h(IconSkills, { size: 19 })),
                h(
                  'div',
                  { className: 'sf-brand-text' },
                  h('div', { className: 'sf-title-row' }, h('strong', { className: 'sf-title' }, t('title'))),
                  h('div', { className: 'sf-subtitle' }, t('subtitle')),
                ),
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
                  h(IconRefresh, { size: 15 }),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sf-icon-btn sf-icon-btn-close',
                    title: t('close'),
                    'aria-label': t('close'),
                    onClick: close,
                  },
                  h(IconClose, { size: 16 }),
                ),
              ),
            ),
            renderCombo(),
            h(
              'nav',
              { className: 'sf-tabs', role: 'tablist', 'aria-label': t('tabsAria'), onKeyDown: onTabsKeyDown },
              tabs.map((tab) => {
                const active = view === tab.value
                const TabIcon = tab.icon
                return h(
                  'button',
                  {
                    type: 'button',
                    key: tab.value,
                    role: 'tab',
                    id: 'sf-tab-' + tab.value,
                    'aria-selected': active,
                    'aria-controls': 'sf-panel',
                    tabIndex: active ? 0 : -1,
                    className: active ? 'sf-tab sf-tab-active' : 'sf-tab',
                    onClick: () => changeView(tab.value),
                  },
                  h(TabIcon, { size: 14 }),
                  h('span', { className: 'sf-tab-label' }, tab.label),
                )
              }),
            ),
            h(
              'div',
              { className: 'sf-controls' },
              h(
                'div',
                { className: 'sf-toolbar' },
                h(
                  'div',
                  { className: 'sf-search' },
                  h('span', { className: 'sf-search-icon' }, h(IconSearch, { size: 15 })),
                  h('input', {
                    ref: searchRef,
                    className: 'sf-input',
                    type: 'search',
                    value: query,
                    placeholder: t('search'),
                    'aria-label': t('searchAria'),
                    onChange: (event) => setQuery(event.target.value),
                  }),
                ),
                h('span', { className: 'sf-count' }, filtered.length + ' ' + t('count')),
              ),
              h(
                'div',
                { className: 'sf-modebar' },
                h('span', { className: 'sf-mode-label' }, t('mode')),
                h(Segmented, {
                  label: t('modeAria'),
                  value: currentMode === 'off' ? null : currentMode,
                  busy: modeBusy,
                  onChange: changeMode,
                  options: [
                    { value: 'plan', label: t('planMode'), title: t('planHint') },
                    { value: 'immersive', label: t('immersiveMode'), title: t('immersiveHint') },
                  ],
                }),
                h(
                  'span',
                  { className: 'sf-mode-hint' },
                  currentMode === 'plan'
                    ? t('planHint')
                    : currentMode === 'immersive'
                      ? t('immersiveHint')
                      : '',
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
                        h(IconSparkle, { size: 11 }),
                        h('span', null, copied === item.name ? t('copied') : item.name),
                      ),
                    ),
                  )
                : null,
            ),
            h(
              'div',
              {
                className: 'sf-scroll',
                id: 'sf-panel',
                role: 'tabpanel',
                'aria-label': t('listAria'),
                'aria-labelledby': 'sf-tab-' + view,
                'aria-busy': busy,
              },
              busy
                ? h(
                    React.Fragment,
                    null,
                    h(
                      'div',
                      { className: 'sf-section sf-reco-skeleton' },
                      h('span', { className: 'sf-skeleton sf-skeleton-line', style: { width: '38%' } }),
                      h(SkeletonList, { rows: 2 }),
                    ),
                    h('div', { className: 'sf-section' }, h(SkeletonList, { rows: 4 })),
                  )
                : null,
              showError
                ? h(
                    'div',
                    { className: 'sf-section' },
                    EmptyState({
                      className: 'sf-error',
                      icon: h(IconAlert, { size: 22 }),
                      title: t('error'),
                      hint: error,
                      action: h(
                        'button',
                        { type: 'button', className: 'sf-primary', onClick: () => load(state.sessionId) },
                        t('retry'),
                      ),
                    }),
                  )
                : null,
              !busy && !showError
                ? h(
                    React.Fragment,
                    null,
                    renderActive(),
                    renderRecommendations(),
                    renderBetter(),
                    renderDiscoveries(),
                    renderCatalog(),
                    renderExperience(),
                    renderEvolution(),
                    renderRemotePreview(),
                  )
                : null,
            ),
            h(
              'footer',
              { className: 'sf-foot' },
              showCreate
                ? null
                : h(
                    'div',
                    { className: 'sf-meta' },
                    scopeKey ? h('span', { className: 'sf-meta-scope' }, t(scopeKey)) : h('span', null),
                    data && data.generatedAt
                      ? h('span', null, t('generated') + ' ' + formatTime(data.generatedAt))
                      : null,
                  ),
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
                      h(
                        'button',
                        { type: 'submit', className: 'sf-primary', disabled: createBusy },
                        createBusy ? t('creating') : t('createBtn'),
                      ),
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
                    h(IconPlus, { size: 14 }),
                    h('span', null, t('create')),
                  ),
            ),
            toast
              ? h(
                  'div',
                  { className: 'sf-toast sf-toast-' + toast.kind, role: 'status', 'aria-live': 'polite' },
                  toast.kind === 'error' ? h(IconAlert, { size: 14 }) : h(IconCheck, { size: 14 }),
                  h('span', null, toast.text),
                )
              : null,
            view !== 'skills'
              ? h(
                  'div',
                  { className: 'sf-subview' },
                  view === 'discover' ? renderUpdatesView() : renderLibrary(),
                )
              : null,
          ),
        ),
      )
    }

    const CSS = `
.sf-trigger{position:relative;display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 11px;border:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);color:var(--dsw-alias-label-secondary);border-radius:999px;cursor:pointer;font:inherit;font-size:12px;font-weight:500;line-height:1;transition:background var(--sf-dur) ease,color var(--sf-dur) ease,border-color var(--sf-dur) ease,transform var(--sf-dur) ease}
.sf-trigger:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);border-color:var(--dsw-alias-border-l2)}
.sf-trigger:active{transform:scale(.98)}
.sf-trigger-open{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.sf-trigger:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:2px}
.sf-trigger-label{white-space:nowrap}
.sf-backdrop{position:fixed;inset:0;z-index:70;background:var(--dsw-alias-bg-mask-1);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);pointer-events:auto;animation:sf-fade-in 180ms ease-out}
.sf-drawer{--sf-space-1:4px;--sf-space-2:8px;--sf-space-3:12px;--sf-space-4:16px;--sf-space-5:24px;--sf-radius-sm:8px;--sf-radius-md:12px;--sf-radius-lg:16px;--sf-radius-pill:999px;--sf-font-1:10px;--sf-font-2:10.5px;--sf-font-3:12px;--sf-font-4:12.5px;--sf-font-5:14.5px;--sf-font-6:17px;--sf-dur-fast:140ms;--sf-dur:160ms;--sf-dur-slow:220ms;--sf-ease:cubic-bezier(.2,.7,.2,1);--sf-shadow-1:0 1px 2px rgba(15,17,21,.06);--sf-shadow-2:0 3px 10px -4px rgba(15,17,21,.16),0 1px 2px rgba(15,17,21,.05);--sf-shadow-pop:0 16px 48px -12px rgba(0,0,0,.4);--sf-tint-1:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);--sf-tint-2:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);--sf-tint-3:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);--sf-line:var(--dsw-alias-border-l1);--sf-line-strong:var(--dsw-alias-border-l2);--sf-ink:var(--dsw-alias-label-primary);--sf-ink-2:var(--dsw-alias-label-secondary);--sf-ink-3:var(--dsw-alias-label-tertiary);--sf-accent:var(--dsw-alias-link);--sf-warn:var(--dsw-alias-state-warn-primary);--sf-success:var(--dsw-alias-state-success-primary);--sf-danger:var(--dsw-alias-state-error-primary);position:fixed;top:0;right:0;bottom:0;z-index:71;display:flex;flex-direction:column;width:min(460px,96vw);overflow:hidden;background-color:var(--dsw-alias-bg-layer-1);background-image:radial-gradient(120% 55% at 100% 0%,color-mix(in srgb,var(--dsw-alias-link) 9%,transparent) 0%,transparent 58%);border-left:1px solid var(--sf-line);box-shadow:-24px 0 60px -24px rgba(0,0,0,.4);color:var(--sf-ink);font-size:12px;line-height:1.5;text-align:left;pointer-events:auto;animation:sf-slide-in 220ms cubic-bezier(.2,.7,.2,1)}
body[data-ds-dark-theme] .sf-drawer{box-shadow:-24px 0 70px -26px rgba(0,0,0,.75)}
.sf-head{flex:none;display:flex;align-items:flex-start;gap:var(--sf-space-3);padding:var(--sf-space-4) var(--sf-space-4) var(--sf-space-2)}
.sf-brand{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
.sf-mark{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:linear-gradient(155deg,color-mix(in srgb,var(--dsw-alias-link) 30%,transparent),transparent 62%),color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);border:1px solid var(--sf-line);color:var(--sf-ink);box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 26%,transparent),0 1px 2px rgba(15,17,21,.08)}
body[data-ds-dark-theme] .sf-mark{box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 1px 2px rgba(0,0,0,.35)}
.sf-brand-text{min-width:0;flex:1}
.sf-title-row{display:flex;align-items:center;gap:8px}
.sf-title{font-size:14.5px;font-weight:650;line-height:1.35;letter-spacing:-.01em;color:var(--sf-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-subtitle{margin-top:3px;color:var(--sf-ink-3);font-size:11px;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-head-actions{display:flex;gap:4px;flex:none;margin-top:-3px}
.sf-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--sf-ink-2);cursor:pointer;transition:background 140ms ease,color 140ms ease,transform 140ms ease}
.sf-icon-btn:hover{background:var(--sf-tint-2);color:var(--sf-ink)}
.sf-icon-btn:active{transform:scale(.95)}
.sf-icon-btn:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-icon-btn-close:hover{color:var(--sf-danger);background:color-mix(in srgb,var(--sf-danger) 11%,transparent)}
.sf-tabs{flex:none;display:flex;gap:2px;margin:var(--sf-space-2) var(--sf-space-4) 0;padding:var(--sf-space-1);border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:var(--sf-tint-1)}
.sf-tab{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;min-width:0;padding:0 4px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:background 160ms ease,color 160ms ease,box-shadow 160ms ease}
.sf-tab:hover{color:var(--sf-ink);background:var(--sf-tint-2)}
.sf-tab-active{background:var(--sf-tint-3);color:var(--sf-ink);font-weight:600;box-shadow:inset 0 0 0 1px var(--sf-line),0 1px 2px rgba(15,17,21,.07)}
.sf-tab-active svg{color:var(--sf-accent)}
.sf-tab:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-tab-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-controls{flex:none;display:flex;flex-direction:column;gap:var(--sf-space-2);padding:var(--sf-space-3) var(--sf-space-4) var(--sf-space-2)}
.sf-toolbar{display:flex;align-items:center;gap:8px}
.sf-search{position:relative;display:flex;align-items:center;flex:1;min-width:0}
.sf-search-icon{position:absolute;left:11px;display:flex;color:var(--sf-ink-3);pointer-events:none;transition:color 140ms ease}
.sf-search:focus-within .sf-search-icon{color:var(--sf-accent)}
.sf-input{flex:1;min-width:0;height:36px;padding:0 12px;border:1px solid var(--sf-line);border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);color:var(--sf-ink);font:inherit;font-size:12.5px;line-height:1.4;outline:none;transition:border-color 140ms ease,background 140ms ease,box-shadow 140ms ease}
.sf-search .sf-input{padding-left:34px}
.sf-input::placeholder{color:var(--sf-ink-3)}
.sf-input:hover{border-color:var(--sf-line-strong)}
.sf-input:focus{background:var(--dsw-alias-bg-layer-1);border-color:var(--sf-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-accent) 17%,transparent)}
.sf-textarea{height:58px;padding:8px 10px;resize:vertical;font-size:11.5px;line-height:1.5}
.sf-count{flex:none;display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:999px;background:var(--sf-tint-2);color:var(--sf-ink-2);font-size:10.5px;font-variant-numeric:tabular-nums;white-space:nowrap}
.sf-modebar{display:flex;align-items:center;gap:8px;min-width:0}
.sf-mode-label{flex:none;color:var(--sf-ink-3);font-size:10.5px;letter-spacing:.02em;white-space:nowrap}
.sf-mode-hint{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sf-ink-3);font-size:10.5px}
.sf-seg{display:inline-flex;flex:none;gap:2px;padding:3px;border:1px solid var(--sf-line);border-radius:11px;background:var(--sf-tint-1)}
.sf-seg-sm .sf-seg-btn{height:28px;min-width:46px;font-size:11px}
.sf-seg-btn{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:30px;padding:0 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:11.5px;font-weight:500;cursor:pointer;transition:background 150ms ease,color 150ms ease,box-shadow 150ms ease}
.sf-seg-btn:hover{color:var(--sf-ink);background:var(--sf-tint-2)}
.sf-seg-btn:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-seg-btn:disabled{opacity:.55;cursor:default}
.sf-seg-active{background:var(--sf-tint-3);color:var(--sf-ink);box-shadow:inset 0 0 0 1px var(--sf-line)}
.sf-suggest{display:flex;align-items:center;gap:6px;min-width:0}
.sf-chip{position:relative;display:inline-flex;align-items:center;gap:5px;height:30px;max-width:46%;padding:0 10px;border:1px solid var(--sf-line);border-radius:999px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:11px;cursor:pointer;transition:background 140ms ease,color 140ms ease,border-color 140ms ease}
.sf-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sf-chip svg{flex:none;color:var(--sf-accent);opacity:.9}
.sf-chip:hover{color:var(--sf-ink);border-color:var(--sf-line-strong);background:var(--sf-tint-2)}
.sf-chip-active{color:var(--sf-ink);border-color:color-mix(in srgb,var(--sf-accent) 55%,transparent);background:color-mix(in srgb,var(--sf-accent) 12%,transparent)}
.sf-chip:disabled{opacity:.55;cursor:default}
.sf-chip:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:var(--sf-space-1) var(--sf-space-4) var(--sf-space-2);scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-hover-l1) transparent}
.sf-scroll::-webkit-scrollbar{width:8px;height:8px}
.sf-scroll::-webkit-scrollbar-track{background:transparent}
.sf-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-hover-l1);border:2px solid transparent;border-radius:999px;background-clip:content-box}
.sf-section{margin:0 0 var(--sf-space-3);padding:var(--sf-space-3);border:1px solid var(--sf-line);border-radius:var(--sf-radius-lg);background:color-mix(in srgb,var(--dsw-alias-label-primary) 2.5%,transparent);box-shadow:0 1px 0 color-mix(in srgb,#fff 50%,transparent) inset}
body[data-ds-dark-theme] .sf-section{box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.sf-sec-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
.sf-sec-title{display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-width:0}
.sf-sec-icon{display:inline-flex;color:var(--sf-accent)}
.sf-sec-name{font-size:12.5px;font-weight:650;color:var(--sf-ink);letter-spacing:-.005em}
.sf-sec-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--sf-tint-2);color:var(--sf-ink-2);font-size:10px;font-variant-numeric:tabular-nums}
.sf-sec-hint{color:var(--sf-ink-3);font-size:10.5px;font-weight:400;line-height:1.4}
.sf-sec-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px;flex:none}
.sf-primary,.sf-secondary{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:36px;padding:0 13px;border-radius:10px;font:inherit;font-size:12px;font-weight:550;line-height:1;white-space:nowrap;cursor:pointer;transition:background 150ms ease,border-color 150ms ease,color 150ms ease,box-shadow 150ms ease,transform 150ms ease}
.sf-primary{border:1px solid var(--dsw-alias-button-primary-fill);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);box-shadow:0 1px 2px rgba(15,17,21,.14)}
.sf-primary:hover{background:var(--dsw-alias-button-primary-hover);border-color:var(--dsw-alias-button-primary-hover)}
.sf-primary:active{transform:translateY(1px)}
.sf-secondary{border:1px solid var(--sf-line);background:transparent;color:var(--sf-ink)}
.sf-secondary:hover{background:var(--sf-tint-2);border-color:var(--sf-line-strong)}
.sf-secondary:active{transform:translateY(1px)}
.sf-primary:disabled,.sf-secondary:disabled{opacity:.5;cursor:default;transform:none}
.sf-primary:focus-visible,.sf-secondary:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-btn-sm{position:relative;height:30px;padding:0 10px;border-radius:8px;font-size:11px}
.sf-badge{display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border:1px solid var(--sf-line);border-radius:7px;background:transparent;color:var(--sf-ink-3);font-size:9px;line-height:1.6;white-space:nowrap}
.sf-badge.sf-sec{font-weight:600}
.sf-badge.sf-sec-low{color:var(--sf-success);border-color:color-mix(in srgb,var(--sf-success) 30%,transparent)}
.sf-badge.sf-sec-medium{color:var(--sf-warn);border-color:color-mix(in srgb,var(--sf-warn) 32%,transparent)}
.sf-badge.sf-sec-high{color:var(--sf-danger);border-color:color-mix(in srgb,var(--sf-danger) 32%,transparent);background:color-mix(in srgb,var(--sf-danger) 8%,transparent)}
.sf-badge.sf-trust-official,.sf-badge.sf-trust-verified{color:var(--sf-accent);border-color:color-mix(in srgb,var(--sf-accent) 30%,transparent)}
.sf-badge.sf-trust-local{color:var(--sf-warn);border-color:color-mix(in srgb,var(--sf-warn) 26%,transparent)}
.sf-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-top:6px}
.sf-chip::after,.sf-reco-btn::after,.sf-fb::after,.sf-copy::after,.sf-btn-sm::after,.sf-trigger::after{content:'';position:absolute;inset:-3px;border-radius:inherit}
.sf-reco{background-image:linear-gradient(155deg,color-mix(in srgb,var(--sf-accent) 8%,transparent),transparent 62%);border-color:color-mix(in srgb,var(--sf-accent) 17%,var(--sf-line))}
.sf-reco-context{display:flex;align-items:flex-start;gap:5px;margin:-1px 0 8px;padding:7px 9px;border-radius:9px;background:var(--sf-tint-1);color:var(--sf-ink-3);font-size:10px;line-height:1.45}
.sf-reco-context-label{flex:none;color:var(--sf-accent);font-weight:600}
.sf-reco-context-text{min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.sf-reco-list{display:flex;flex-direction:column;gap:7px}
.sf-reco-item{display:flex;gap:9px;padding:9px 10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:border-color var(--sf-dur) ease,box-shadow var(--sf-dur) ease,transform var(--sf-dur) ease}
.sf-reco-item:hover{border-color:var(--sf-line-strong);box-shadow:0 3px 10px -4px rgba(15,17,21,.16);transform:translateY(-1px)}
.sf-reco-item:active{transform:translateY(0)}
.sf-reco-item:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-reco-explore{border-style:dashed;border-color:color-mix(in srgb,var(--sf-accent) 38%,var(--sf-line))}
.sf-reco-rank{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-top:1px;border-radius:7px;background:var(--sf-tint-2);color:var(--sf-ink-2);font-size:10.5px;font-weight:650;font-variant-numeric:tabular-nums}
.sf-reco-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.sf-reco-title{display:flex;align-items:center;gap:6px;min-width:0}
.sf-reco-name{min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;line-height:1.4;color:var(--sf-ink);overflow-wrap:anywhere}
.sf-reco-score{flex:none;margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 5px;border-radius:6px;background:color-mix(in srgb,var(--sf-accent) 12%,transparent);color:var(--sf-accent);font-size:10px;font-weight:600;font-variant-numeric:tabular-nums}
.sf-reco-badges{display:flex;flex-wrap:wrap;gap:4px}
.sf-reco-badge{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border:1px solid var(--sf-line);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent);color:var(--sf-ink-2);font-size:9.5px;line-height:1.5;white-space:nowrap}
.sf-reco-badge::before{content:'';flex:none;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.4}
.sf-reco-badge-name::before{background:var(--sf-accent);opacity:.9}
.sf-reco-badge-experience::before{background:var(--sf-success);opacity:.9}
.sf-reco-badge-category::before{background:var(--sf-warn);opacity:.9}
.sf-reco-badge-explore{order:-1;border-color:color-mix(in srgb,var(--sf-accent) 42%,transparent);background:color-mix(in srgb,var(--sf-accent) 10%,transparent);color:var(--sf-accent)}
.sf-reco-badge-explore::before{display:none}
.sf-reco-reasons{font-size:10px;color:var(--sf-ink-3);line-height:1.4;overflow-wrap:anywhere}
.sf-reco-intro{margin:0;color:var(--sf-ink-2);font-size:10.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-reco-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:1px}
.sf-reco-btn{position:relative;display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 9px;border:1px solid var(--sf-line);border-radius:999px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:10.5px;cursor:pointer;white-space:nowrap;transition:background 140ms ease,color 140ms ease,border-color 140ms ease}
.sf-reco-btn:hover{color:var(--sf-ink);border-color:var(--sf-line-strong);background:var(--sf-tint-2)}
.sf-reco-btn-primary{color:var(--sf-ink);border-color:var(--sf-line-strong);background:var(--sf-tint-1)}
.sf-reco-btn:disabled{opacity:.5;cursor:default}
.sf-reco-btn:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-active{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:2px 0 10px;padding:7px 10px;border:1px solid color-mix(in srgb,var(--sf-success) 22%,transparent);border-radius:12px;background:color-mix(in srgb,var(--sf-success) 8%,transparent)}
.sf-active-label{display:inline-flex;align-items:center;gap:6px;flex:none;color:var(--sf-success);font-size:10.5px;font-weight:600}
.sf-active-pulse{width:6px;height:6px;border-radius:50%;background:var(--sf-success);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-success) 20%,transparent);animation:sf-pulse 2.4s ease-in-out infinite}
.sf-active-chips{display:flex;flex-wrap:wrap;gap:5px;min-width:0}
.sf-active-chip{padding:1px 7px;border:1px solid color-mix(in srgb,var(--sf-success) 25%,transparent);border-radius:999px;background:var(--dsw-alias-bg-layer-1);color:var(--sf-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.6}
.sf-catalog{margin:0 0 4px}
.sf-catalog .sf-sec-head{margin-bottom:6px}
.sf-filter-note{margin:-2px 0 7px;color:var(--sf-ink-3);font-size:10px}
.sf-group{margin-bottom:9px}
.sf-group-head{display:flex;align-items:center;gap:6px;padding:2px 2px 6px}
.sf-group-icon{display:flex;color:var(--sf-ink-3)}
.sf-group-label{font-size:11px;font-weight:600;color:var(--sf-ink-2);letter-spacing:.01em}
.sf-group-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--sf-tint-2);color:var(--sf-ink-3);font-size:9px;font-weight:600;font-variant-numeric:tabular-nums}
.sf-card{position:relative;margin:0 0 7px;padding:10px 11px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:border-color var(--sf-dur) ease,box-shadow var(--sf-dur) ease,transform var(--sf-dur) ease}
.sf-card:hover{border-color:var(--sf-line-strong);box-shadow:0 3px 10px -4px rgba(15,17,21,.16),0 1px 2px rgba(15,17,21,.05);transform:translateY(-1px)}
.sf-card:active{transform:translateY(0)}
.sf-card:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-card-open{border-color:color-mix(in srgb,var(--sf-accent) 45%,var(--sf-line));box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-accent) 9%,transparent)}
.sf-card-head{display:flex;align-items:center;gap:8px}
.sf-card-icon{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:color-mix(in srgb,var(--sf-accent) 10%,transparent);color:var(--sf-accent)}
.sf-card-title{display:flex;align-items:center;gap:7px;flex:1;min-width:0}
.sf-card-chevron{flex:none;display:flex;color:var(--sf-ink-3);transition:transform 170ms ease}
.sf-card-open .sf-card-chevron{transform:rotate(180deg)}
.sf-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;line-height:1.4;color:var(--sf-ink);overflow-wrap:anywhere}
.sf-source{flex:none;padding:1px 6px;border:1px solid var(--sf-line);border-radius:999px;background:var(--sf-tint-1);color:var(--sf-ink-3);font-size:9px;line-height:1.6;white-space:nowrap}
.sf-desc{margin:6px 0 0;color:var(--sf-ink-2);font-size:11.5px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-card-open .sf-desc{-webkit-line-clamp:unset;display:block}
.sf-when{margin:5px 0 0;color:var(--sf-ink-3);font-size:10.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.sf-card-open .sf-when{-webkit-line-clamp:unset;display:block}
.sf-when-label{margin-right:5px;color:var(--sf-accent);font-weight:600}
.sf-card-badges{margin-top:6px}
.sf-card-open > .sf-card-badges{display:none}
.sf-detail{margin-top:9px;padding-top:9px;border-top:1px dashed var(--sf-line);display:flex;flex-direction:column;gap:6px}
.sf-detail-head{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}
.sf-cat{display:inline-flex;align-items:center;padding:1px 7px;border-radius:7px;background:color-mix(in srgb,var(--sf-accent) 9%,transparent);color:var(--sf-accent);font-size:9.5px;line-height:1.6;white-space:nowrap}
.sf-path{display:flex;gap:6px;flex:1;min-width:0;overflow-wrap:anywhere}
.sf-detail-label{flex:none;color:var(--sf-ink-3);font-size:9.5px;line-height:1.6;text-transform:uppercase;letter-spacing:.04em}
.sf-path code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.6;color:var(--sf-ink-2);overflow-wrap:anywhere}
.sf-flags{display:flex;flex-wrap:wrap;align-items:center;gap:5px}
.sf-flag{padding:1px 6px;border:1px solid var(--sf-line);border-radius:6px;background:var(--sf-tint-1);color:var(--sf-ink-3);font-size:9px;line-height:1.6}
.sf-findings{display:flex;flex-direction:column;gap:3px;padding:7px 8px;border:1px solid color-mix(in srgb,var(--sf-warn) 22%,transparent);border-radius:8px;background:color-mix(in srgb,var(--sf-warn) 8%,transparent)}
.sf-findings-label{color:var(--sf-warn);font-size:9.5px;font-weight:600}
.sf-finding{font-size:9.5px;line-height:1.5;color:var(--sf-ink-2);overflow-wrap:anywhere}
.sf-finding-rule{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--sf-ink)}
.sf-finding-line{opacity:.85}
.sf-copy{position:relative;display:inline-flex;align-items:center;gap:4px;align-self:flex-start;height:30px;margin-top:7px;padding:0 8px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sf-ink-3);font:inherit;font-size:9.5px;cursor:pointer;transition:background 140ms ease,color 140ms ease,border-color 140ms ease}
.sf-copy:hover{color:var(--sf-accent);border-color:var(--sf-line);background:var(--sf-tint-1)}
.sf-copy:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-copy-done{color:var(--sf-success)}
.sf-stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}
.sf-stat-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sf-stat{display:flex;flex-direction:column;gap:1px;padding:9px 10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent)}
.sf-stat-label{color:var(--sf-ink-3);font-size:10px;line-height:1.4}
.sf-stat-value{font-size:17px;font-weight:650;line-height:1.25;letter-spacing:-.01em;color:var(--sf-ink);font-variant-numeric:tabular-nums}
.sf-stat-hint{color:var(--sf-ink-3);font-size:9.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-tone-ok{color:var(--sf-success)}
.sf-tone-mid{color:var(--sf-warn)}
.sf-tone-bad{color:var(--sf-danger)}
.sf-xp-table{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent)}
.sf-xp-row{display:grid;grid-template-columns:minmax(0,1fr) 44px 58px 64px;gap:6px;align-items:center;padding:7px 9px;border-top:1px solid var(--sf-line);color:var(--sf-ink-2);font-size:11px;line-height:1.45;font-variant-numeric:tabular-nums}
.sf-xp-row:first-child{border-top:0}
.sf-xp-row span{text-align:right;overflow-wrap:anywhere}
.sf-xp-row span:first-child{text-align:left}
.sf-xp-row-head{background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);color:var(--sf-ink-3);font-size:9px;font-weight:600;letter-spacing:.03em;text-transform:uppercase}
.sf-xp-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--sf-ink);overflow-wrap:anywhere}
.sf-feedback{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-top:10px;padding:9px 10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:var(--sf-tint-1)}
.sf-feedback-outcome{flex:1;min-width:0;color:var(--sf-ink-2);font-size:10.5px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-feedback-label{margin-right:4px;color:var(--sf-ink-3)}
.sf-feedback-actions{display:flex;flex:none;gap:5px}
.sf-fb{position:relative;display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 8px;border:1px solid var(--sf-line);border-radius:999px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:10.5px;white-space:nowrap;cursor:pointer;transition:background 140ms ease,color 140ms ease,border-color 140ms ease}
.sf-fb:hover{color:var(--sf-ink);border-color:var(--sf-line-strong);background:var(--sf-tint-2)}
.sf-fb:disabled{opacity:.5;cursor:default}
.sf-fb:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-fb-active{border-color:color-mix(in srgb,var(--sf-accent) 50%,transparent);background:color-mix(in srgb,var(--sf-accent) 12%,transparent);color:var(--sf-ink)}
.sf-health{margin-top:12px}
.sf-health-title{display:flex;align-items:center;gap:5px;margin-bottom:6px;color:var(--sf-ink-3);font-size:10.5px;font-weight:600}
.sf-health-row{display:flex;align-items:flex-start;gap:7px;margin-top:5px;padding:7px 9px;border:1px solid var(--sf-line);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 2.5%,transparent);font-size:10.5px;line-height:1.5}
.sf-health-dot{flex:none;width:6px;height:6px;margin-top:5px;border-radius:50%;background:var(--sf-ink-3)}
.sf-health-label{flex:none;color:var(--sf-ink-2);font-weight:500}
.sf-health-names{flex:1;min-width:0;color:var(--sf-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;overflow-wrap:anywhere}
.sf-health-danger .sf-health-dot{background:var(--sf-danger);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-danger) 16%,transparent)}
.sf-health-warn .sf-health-dot{background:var(--sf-warn);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-warn) 15%,transparent)}
.sf-health-ok .sf-health-dot{background:var(--sf-success)}
.sf-health-idle .sf-health-dot{background:var(--sf-ink-3)}
.sf-health-ok .sf-health-label{color:var(--sf-success)}
.sf-evo-block{margin-top:8px;padding:10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent)}
.sf-evo-block-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:7px}
.sf-evo-block-title{font-size:11.5px;font-weight:600;color:var(--sf-ink)}
.sf-evo-note{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sf-ink-3);font-size:9.5px}
.sf-weight-list{display:flex;flex-direction:column;gap:8px}
.sf-weight{display:flex;flex-direction:column;gap:4px}
.sf-weight-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.sf-weight-name{color:var(--sf-ink-2);font-size:10.5px;font-variant-numeric:tabular-nums}
.sf-weight-range{color:var(--sf-ink-3);font-size:9.5px;font-variant-numeric:tabular-nums}
.sf-bar{position:relative;height:6px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);overflow:hidden}
.sf-bar-fill{display:block;height:100%;border-radius:inherit;transition:width 360ms cubic-bezier(.2,.7,.2,1)}
.sf-bar-accent{background:linear-gradient(90deg,color-mix(in srgb,var(--sf-accent) 70%,var(--dsw-alias-label-primary)),var(--sf-accent))}
.sf-bar-calm{background:color-mix(in srgb,var(--sf-accent) 62%,transparent)}
.sf-quota-value{color:var(--sf-accent);font-size:12px;font-weight:650;font-variant-numeric:tabular-nums}
.sf-evo-hint{margin:0 0 8px;color:var(--sf-ink-3);font-size:10px;line-height:1.5}
.sf-quota-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.sf-quota-stats{min-width:0;color:var(--sf-ink-3);font-size:9.5px;line-height:1.4}
.sf-learn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.sf-learn{display:flex;flex-direction:column;gap:1px;padding:7px 8px;border:1px solid var(--sf-line);border-radius:9px;background:var(--sf-tint-1)}
.sf-learn-label{color:var(--sf-ink-3);font-size:9.5px;line-height:1.4}
.sf-learn-value{color:var(--sf-ink);font-size:14px;font-weight:650;font-variant-numeric:tabular-nums}
.sf-learn-note{margin-top:7px;color:var(--sf-ink-3);font-size:9.5px;line-height:1.5}
.sf-timeline{display:flex;flex-direction:column;gap:8px}
.sf-timeline-row{display:flex;gap:8px;padding-left:2px}
.sf-timeline-dot{flex:none;width:6px;height:6px;margin-top:5px;border-radius:50%;background:var(--sf-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-accent) 15%,transparent)}
.sf-timeline-body{flex:1;min-width:0}
.sf-timeline-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.sf-timeline-label{color:var(--sf-ink);font-size:10.5px;line-height:1.4;overflow-wrap:anywhere}
.sf-timeline-time{flex:none;color:var(--sf-ink-3);font-size:9px;white-space:nowrap}
.sf-timeline-reason{margin-top:1px;color:var(--sf-ink-3);font-size:9.5px;line-height:1.4;overflow-wrap:anywhere}
.sf-timeline-empty{color:var(--sf-ink-3);font-size:10px;line-height:1.5}
.sf-evo-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.sf-xp-status{display:flex;align-items:flex-start;gap:6px;margin-top:10px;padding:7px 9px;border-radius:9px;font-size:10.5px;line-height:1.5;overflow-wrap:anywhere}
.sf-xp-status svg{flex:none;margin-top:2px}
.sf-xp-status.sf-ok{background:color-mix(in srgb,var(--sf-success) 12%,transparent);color:var(--sf-success)}
.sf-xp-status.sf-error{background:color-mix(in srgb,var(--sf-danger) 11%,transparent);color:var(--sf-danger)}
.sf-subhint{padding:0 2px;color:var(--sf-ink-3);font-size:10px;line-height:1.5}
.sf-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:26px 14px;border:1px dashed var(--sf-line-strong);border-radius:var(--sf-radius-md);background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent);color:var(--sf-ink-3);font-size:11px;line-height:1.55;text-align:center}
.sf-empty-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--sf-tint-2);color:var(--sf-ink-3)}
.sf-empty-title{font-size:12px;font-weight:600;color:var(--sf-ink-2)}
.sf-empty-hint{max-width:280px;color:var(--sf-ink-3);font-size:10.5px;overflow-wrap:anywhere}
.sf-empty-action{display:flex;gap:8px;margin-top:4px}
.sf-error{color:var(--sf-danger)}
.sf-empty.sf-error{border-color:color-mix(in srgb,var(--sf-danger) 30%,transparent)}
.sf-empty.sf-error .sf-empty-icon{color:var(--sf-danger);background:color-mix(in srgb,var(--sf-danger) 10%,transparent)}
.sf-error-detail{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;color:var(--sf-ink-3);overflow-wrap:anywhere}
.sf-skeleton-list{display:flex;flex-direction:column;gap:8px}
.sf-skeleton{position:relative;display:block;overflow:hidden;border-radius:7px;background:var(--dsw-alias-bg-skeleton)}
.sf-skeleton::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent),transparent);transform:translateX(-100%);animation:sf-shimmer 1.5s ease-in-out infinite}
.sf-skeleton-card{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--sf-line);border-radius:14px;background:var(--dsw-alias-bg-layer-2)}
.sf-skeleton-row{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--sf-line);border-radius:12px;background:var(--dsw-alias-bg-layer-2)}
.sf-skeleton-line{height:10px;border-radius:6px}
.sf-skeleton-line-soft{height:9px;opacity:.7}
.sf-skeleton-dot{flex:none;width:26px;height:26px;border-radius:8px}
.sf-skeleton-pill{width:56px;height:20px;margin-left:auto;border-radius:999px}
.sf-foot{flex:none;padding:var(--sf-space-2) var(--sf-space-4) var(--sf-space-3);border-top:1px solid var(--sf-line);background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent)}
.sf-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:var(--sf-ink-3);font-size:9.5px;line-height:1.5}
.sf-meta-scope{color:var(--sf-ink-2);font-weight:500}
.sf-new-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:36px;border:1px dashed var(--sf-line-strong);border-radius:11px;background:transparent;color:var(--sf-ink-2);font:inherit;font-size:11.5px;font-weight:500;cursor:pointer;transition:background 150ms ease,border-color 150ms ease,color 150ms ease}
.sf-new-btn:hover{color:var(--sf-accent);border-color:color-mix(in srgb,var(--sf-accent) 55%,transparent);background:color-mix(in srgb,var(--sf-accent) 7%,transparent)}
.sf-new-btn:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
.sf-create{display:flex;flex-direction:column;gap:7px;max-height:42vh;overflow-y:auto;padding-right:2px}
.sf-create-title{font-size:12.5px;font-weight:650;color:var(--sf-ink)}
.sf-create-hint{color:var(--sf-ink-3);font-size:9.5px;line-height:1.5}
.sf-create-actions{display:flex;gap:8px;margin-top:2px}
.sf-create-error{color:var(--sf-danger);font-size:10px;line-height:1.5}
.sf-create-ok{color:var(--sf-success);font-size:9.5px;line-height:1.5;overflow-wrap:anywhere}
.sf-toast{position:absolute;left:50%;bottom:80px;z-index:30;display:flex;align-items:center;gap:6px;max-width:calc(100% - 40px);padding:8px 13px;border-radius:999px;background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-toast-label);font-size:11px;line-height:1.4;box-shadow:0 10px 30px -10px rgba(0,0,0,.45);pointer-events:none;transform:translateX(-50%);animation:sf-toast-in 200ms cubic-bezier(.2,.7,.2,1)}
.sf-toast svg{flex:none}
.sf-toast span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sf-toast-ok svg{color:var(--dsw-alias-state-success-secondary)}
.sf-toast-error svg{color:var(--dsw-alias-state-error-secondary)}
.sf-subview{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;overflow:hidden;background-color:var(--dsw-alias-bg-layer-1);background-image:radial-gradient(120% 55% at 100% 0%,color-mix(in srgb,var(--dsw-alias-link) 8%,transparent),transparent 60%);animation:sf-fade-in 160ms ease-out}
.sf-subhead{flex:none;display:flex;align-items:center;gap:10px;padding:var(--sf-space-3) var(--sf-space-4) 10px;border-bottom:1px solid var(--sf-line)}
.sf-subhead .sf-icon-btn{flex:none}
.sf-subhead-main{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.sf-subhead-title{font-size:13px;font-weight:650;line-height:1.35;color:var(--sf-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-subhead-hint{color:var(--sf-ink-3);font-size:10px;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-subhead .sf-btn-sm{flex:none}
.sf-subfilters{flex:none;display:flex;flex-direction:column;gap:7px;padding:var(--sf-space-3) var(--sf-space-4);border-bottom:1px solid var(--sf-line);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 92%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.sf-subscroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:var(--sf-space-3) var(--sf-space-4) var(--sf-space-4);scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-hover-l1) transparent}
.sf-subscroll::-webkit-scrollbar{width:8px}
.sf-subscroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-hover-l1);border:2px solid transparent;border-radius:999px;background-clip:content-box}
.sf-chiprow{display:flex;align-items:center;flex-wrap:nowrap;gap:5px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:1px;scrollbar-width:none}
.sf-chiprow::-webkit-scrollbar{display:none}
.sf-chiprow .sf-chip{flex:none;max-width:none}
.sf-subrow{display:flex;flex-wrap:wrap;gap:6px}
.sf-remote-card{margin-bottom:8px;padding:11px 12px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-md);background:var(--dsw-alias-bg-layer-2);transition:border-color 160ms ease,box-shadow 160ms ease}
.sf-remote-card:hover{border-color:var(--sf-line-strong);box-shadow:0 3px 10px -4px rgba(15,17,21,.16)}
.sf-remote-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sf-remote-meta{margin-top:5px;color:var(--sf-ink-3);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;overflow-wrap:anywhere}
.sf-remote-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:9px}
.sf-remote-actions .sf-secondary,.sf-remote-actions .sf-primary{height:30px;padding:0 10px;border-radius:8px;font-size:10.5px}
.sf-remote-link{display:block;margin-top:5px;color:var(--sf-accent);font-size:9.5px;overflow-wrap:anywhere;text-decoration:none}
.sf-remote-link:hover{text-decoration:underline}
.sf-install-note{margin:0 0 9px;padding:8px 10px;border-radius:9px;background:color-mix(in srgb,var(--sf-success) 9%,transparent);color:var(--sf-success);font-size:10px;line-height:1.5;overflow-wrap:anywhere}
.sf-updates{margin:0 0 10px;padding:10px;border:1px solid var(--sf-line);border-radius:13px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent)}
.sf-updates-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--sf-ink-2);font-size:11px}
.sf-updates-title{display:inline-flex;align-items:center;gap:5px}
.sf-updates-title svg{color:var(--sf-accent)}
.sf-update-item{margin-top:9px;padding-top:9px;border-top:1px dashed var(--sf-line)}
.sf-update-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.sf-update-diff{color:var(--sf-accent);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:600}
.sf-diff{margin-top:6px;padding:7px 8px;border:1px solid var(--sf-line);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.55;max-height:92px;overflow:auto}
.sf-diff-line{white-space:pre-wrap;overflow-wrap:anywhere}
.sf-diff-add{color:var(--sf-success)}
.sf-diff-del{color:var(--sf-danger)}
.sf-update-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:7px}
.sf-update-error{margin-top:7px;font-size:10px;line-height:1.5;overflow-wrap:anywhere}
.sf-update-ok{margin-top:7px;color:var(--sf-success);font-size:10px;line-height:1.5;overflow-wrap:anywhere}
.sf-preview{margin-top:10px;padding:11px;border:1px solid color-mix(in srgb,var(--sf-accent) 36%,transparent);border-radius:var(--sf-radius-md);background:var(--dsw-alias-bg-layer-2)}
.sf-preview-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
.sf-preview-title{display:flex;flex-direction:column;gap:1px;min-width:0}
.sf-preview-title strong{font-size:12px;color:var(--sf-ink);overflow-wrap:anywhere}
.sf-preview-source{color:var(--sf-ink-3);font-size:9.5px;overflow-wrap:anywhere}
.sf-preview-code{max-height:260px;margin:0 0 9px;padding:9px;border:1px solid var(--sf-line);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--sf-ink-2);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.6;white-space:pre-wrap;overflow:auto}
.sf-preview-meta{margin:0 0 9px}
.sf-preview-actions{display:flex;justify-content:flex-end}
.sf-drawer-error{justify-content:center;padding:28px 18px;animation:none}
.sf-drawer-error .sf-error{width:100%;border-style:solid}
.sf-list{display:flex;flex-direction:column}
@keyframes sf-fade-in{from{opacity:0}to{opacity:1}}
@keyframes sf-slide-in{from{opacity:.35;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
@keyframes sf-shimmer{100%{transform:translateX(100%)}}
@keyframes sf-toast-in{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes sf-pulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (max-width:640px){
.sf-drawer{width:100%;border-left:0}
.sf-head{padding:14px 14px 8px}
.sf-title{font-size:13.5px;-webkit-line-clamp:2}
.sf-subtitle{display:none}
.sf-tabs{margin:4px 12px 0}
.sf-tab{height:32px;font-size:11.5px;gap:5px}
.sf-controls{padding:10px 14px 8px}
.sf-scroll{padding:2px 14px 8px}
.sf-foot{padding:8px 14px 12px}
.sf-section{padding:10px;border-radius:14px}
.sf-stat-grid-3{gap:6px}
.sf-stat-value{font-size:15px}
.sf-xp-row{grid-template-columns:minmax(0,1fr) 36px 50px 56px;font-size:10px;padding:6px 7px}
.sf-subhead{padding:12px 12px 8px}
.sf-subfilters{padding:8px 12px}
.sf-subscroll{padding:10px 12px 14px}
.sf-sec-hint{flex-basis:100%}
.sf-reco-actions{gap:4px}
.sf-modebar{flex-wrap:wrap;row-gap:4px}
.sf-stat-value{font-size:14px}
.sf-subhead-hint{display:none}
}
@media (prefers-reduced-motion:reduce){
.sf-drawer,.sf-backdrop,.sf-subview,.sf-toast{animation:none}
.sf-card,.sf-reco-item,.sf-remote-card,.sf-chip,.sf-reco-btn,.sf-fb,.sf-primary,.sf-secondary,.sf-new-btn,.sf-bar-fill,.sf-seg-btn,.sf-tab,.sf-icon-btn,.sf-trigger{transition:none}
.sf-skeleton::after{animation:none}
.sf-active-pulse{animation:none}
}
.sf-combo{display:flex;gap:9px;align-items:flex-start;margin:0 16px 10px;padding:9px 11px;border:1px solid var(--sf-line);border-radius:12px;background:var(--sf-tint-1)}
.sf-combo-dot{flex:none;width:7px;height:7px;margin-top:5px;border-radius:50%;background:var(--sf-success);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-success) 18%,transparent);animation:sf-pulse 2.4s ease-in-out infinite}
.sf-combo-recommended .sf-combo-dot{background:var(--sf-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--sf-accent) 18%,transparent)}
.sf-combo-body{flex:1;min-width:0}
.sf-combo-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.sf-combo-label{font-size:10px;font-weight:700;letter-spacing:.03em;color:var(--sf-ink-2);text-transform:uppercase}
.sf-combo-kind{padding:0 6px;border-radius:999px;background:color-mix(in srgb,var(--sf-success) 14%,transparent);color:var(--sf-success);font-size:9.5px;font-weight:600;line-height:1.7}
.sf-combo-recommended .sf-combo-kind{background:color-mix(in srgb,var(--sf-accent) 14%,transparent);color:var(--sf-accent)}
.sf-combo-rating{color:var(--sf-warn);font-size:10px;font-weight:700;font-variant-numeric:tabular-nums}
.sf-combo-names{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;color:var(--sf-ink)}
.sf-combo-why{display:flex;gap:5px;margin-top:3px;font-size:10px;line-height:1.45;color:var(--sf-ink-3)}
.sf-combo-why-label{flex:none;color:var(--sf-ink-2);font-weight:600}
.sf-combo-why-text{min-width:0}
.sf-discoveries{margin:0 16px 14px}
.sf-discovery-list{display:flex;flex-direction:column;gap:6px}
.sf-discovery-card{padding:9px 10px;border:1px dashed color-mix(in srgb,var(--sf-accent) 32%,var(--sf-line));border-radius:12px;background:var(--sf-tint-1)}
.sf-discovery-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sf-discovery-head .sf-name{font-size:12px}
.sf-discovery-card .sf-desc{margin:4px 0 6px;font-size:10.5px;color:var(--sf-ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-discovery-actions{display:flex;justify-content:flex-end;gap:6px}
.sf-installed-badge{color:var(--sf-success);border:1px solid color-mix(in srgb,var(--sf-success) 30%,transparent);border-radius:999px;padding:0 6px;font-size:9px;line-height:1.6}
.sf-combo-toast{position:fixed;right:18px;bottom:18px;z-index:90;display:flex;align-items:flex-start;gap:9px;width:min(360px,calc(100vw - 36px));padding:11px 12px;border:1px solid color-mix(in srgb,var(--sf-success) 38%,var(--sf-line));border-radius:14px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--sf-shadow-pop,0 16px 48px -12px rgba(0,0,0,.4));color:var(--sf-ink);animation:sf-toast-in 200ms cubic-bezier(.2,.7,.2,1)}
.sf-combo-toast-icon{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:color-mix(in srgb,var(--sf-success) 14%,transparent);color:var(--sf-success)}
.sf-combo-toast-body{flex:1;min-width:0}
.sf-combo-toast-title{font-size:10px;font-weight:700;letter-spacing:.03em;color:var(--sf-success);text-transform:uppercase}
.sf-combo-toast-names{margin-top:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:var(--sf-ink);word-break:break-word}
.sf-combo-toast-why{margin-top:3px;font-size:10px;line-height:1.45;color:var(--sf-ink-3);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sf-better-toast{bottom:96px;border-color:color-mix(in srgb,var(--sf-accent) 40%,var(--sf-line))}
.sf-better-toast .sf-combo-toast-icon{background:color-mix(in srgb,var(--sf-accent) 14%,transparent);color:var(--sf-accent)}
.sf-better-toast .sf-combo-toast-title{color:var(--sf-accent)}
.sf-better-toast .sf-combo-toast-open{border-color:color-mix(in srgb,var(--sf-accent) 34%,transparent);color:var(--sf-accent)}
.sf-better-toast .sf-combo-toast-open:hover{background:color-mix(in srgb,var(--sf-accent) 10%,transparent)}
.sf-combo-toast-open{flex:none;align-self:center;padding:5px 8px;border:1px solid color-mix(in srgb,var(--sf-success) 34%,transparent);border-radius:8px;background:transparent;color:var(--sf-success);font:inherit;font-size:10px;font-weight:600;cursor:pointer}
.sf-combo-toast-open:hover{background:color-mix(in srgb,var(--sf-success) 10%,transparent)}
.sf-combo-toast-close{flex:none;display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:6px;background:transparent;color:var(--sf-ink-3);cursor:pointer}
.sf-combo-toast-close:hover{background:var(--sf-tint-2);color:var(--sf-ink)}
.sf-reco-context-meta{display:block;margin-top:3px;font-size:9.5px;color:var(--sf-ink-3);font-variant-numeric:tabular-nums}
.sf-better{margin:0 16px 14px;padding:10px 11px;border:1px solid color-mix(in srgb,var(--sf-accent) 30%,var(--sf-line));border-radius:12px;background:var(--sf-tint-1)}
.sf-better-list{display:flex;flex-direction:column;gap:7px;margin-top:7px}
.sf-better-card{padding:8px 9px;border:1px solid var(--sf-line);border-radius:10px;background:var(--sf-tint-1)}
.sf-better-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sf-better-head .sf-name{font-size:12px}
.sf-better-head .sf-rating{color:var(--sf-warn);font-size:9.5px}
.sf-better-card .sf-desc{margin:4px 0 5px;font-size:10.5px;color:var(--sf-ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-better-matched{font-size:9.5px;color:var(--sf-ink-3);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-word}
.sf-better-why{margin-top:3px;font-size:10px;color:var(--sf-ink-2)}
.sf-better-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:6px}
.sf-install-error{margin-top:5px;color:var(--sf-danger);font-size:10px;line-height:1.4}
.sf-install-ok{margin-top:5px;color:var(--sf-success);font-size:10px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:640px){.sf-combo-toast{right:10px;left:10px;bottom:10px;width:auto}}
@media (prefers-reduced-motion:reduce){.sf-combo-toast{animation:none}}

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
