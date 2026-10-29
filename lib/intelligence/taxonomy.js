/**
 * Skill Intelligence Engine — v5 taxonomy (12 domains / capabilities / intents).
 *
 * Contract: `docs/intelligence-architecture.md`.
 * Pure data + pure helpers only: no fs, no network, no clock, no external deps.
 * All ids are stable ASCII kebab-case; every label is bilingual (zh + en).
 */

export const ENGINE_VERSION = '5.0.0'

/**
 * 12 stable domains. `id` is the contract id used by capability-index.json,
 * decomposeTask().domains and composeSkillPlan().missing[].domain.
 * `category` lists the legacy 14 library categories that primarily map here.
 */
export const DOMAINS = [
  {
    id: 'video',
    zh: '视频/创意',
    en: 'Video & Creative',
    category: ['video'],
    keywords: [
      '视频', '宣传片', '短视频', '短片', '卡点', '分镜', '剪辑', '转场', '片头', '字幕', '配音',
      '配乐', '音效', '动效', '音乐', '镜头', '片尾', '预告',
      'video', 'promo', 'reel', 'trailer', 'storyboard', 'shot', 'footage', 'b-roll', 'motion',
      'kinetic', 'caption', 'subtitle', 'voiceover', 'soundtrack', 'bgm', 'transition', 'teaser',
    ],
  },
  {
    id: 'office',
    zh: 'Office',
    en: 'Office Documents',
    category: ['office'],
    keywords: [
      '文档', '报告', '合同', 'word', 'docx', 'excel', 'xlsx', '表格', '幻灯片', 'ppt', 'pptx',
      'pdf', '排版', '版式', '打印', '模板', '纪要', '周报', '标书', '公文', '表单',
      'document', 'doc', 'spreadsheet', 'workbook', 'presentation', 'slide', 'deck', 'report',
      'layout', 'print', 'template', 'minutes', 'memo', 'invoice', 'contract', 'pdf',
    ],
  },
  {
    id: 'engineering',
    zh: '软件工程',
    en: 'Software Engineering',
    category: ['coding'],
    keywords: [
      '代码', '开发', '重构', '调试', '测试', '单元测试', '报错', '缺陷', '部署', '仓库',
      '插件', '面板', '接口', '版本', '提交', '脚本',
      'code', 'coding', 'refactor', 'debug', 'test', 'pytest', 'jest', 'ci', 'cd', 'deploy',
      'repository', 'commit', 'pull request', 'api', 'sdk', 'plugin', 'panel', 'harness',
      'cordis', 'mcp', 'bundle', 'lint', 'typescript', 'python', 'rust', 'react', 'node',
    ],
  },
  {
    id: 'data',
    zh: '数据',
    en: 'Data & Analytics',
    category: ['data'],
    keywords: [
      '数据', '分析', '指标', '统计', '图表', '可视化', '仪表盘', '报表', '清洗', '去重',
      '数据库', '查询', '建模', '趋势',
      'data', 'analysis', 'analyze', 'analytics', 'metric', 'kpi', 'chart', 'plot', 'dashboard',
      'visualiz', 'sql', 'query', 'database', 'etl', 'csv', 'statistics', 'insight', 'forecast',
      'table', 'pivot',
    ],
  },
  {
    id: 'research',
    zh: '研究',
    en: 'Research',
    category: ['research'],
    keywords: [
      '研究', '调研', '检索', '资料', '查一下', '文献', '综述', '综述报告', '核实', '引用',
      '来源', '对比分析', '行业报告',
      'research', 'survey', 'investigate', 'literature', 'source', 'citation', 'reference',
      'fact check', 'verify', 'synthesis', 'summarize', 'compare', 'study', 'whitepaper',
      'evidence',
    ],
  },
  {
    id: 'marketing',
    zh: '营销',
    en: 'Marketing',
    category: ['marketing'],
    keywords: [
      '营销', '推广', '文案', '投放', '广告', '活动', '增长', '获客', '转化', '品牌传播',
      '小红书', '抖音', '公众号',
      'marketing', 'campaign', 'copywriting', 'copy', 'ad', 'ads', 'ppc', 'seo', 'sem',
      'growth', 'conversion', 'landing page', 'social media', 'content calendar', 'audience',
      'brand awareness', 'email marketing',
    ],
  },
  {
    id: 'design',
    zh: '设计',
    en: 'Design',
    category: ['design'],
    keywords: [
      '设计', '海报', '视觉', '配色', '插画', '图标', 'logo', '品牌', '界面', '交互',
      '组件库', '原型',
      'design', 'visual', 'poster', 'illustration', 'icon', 'logo', 'brand', 'ui', 'ux',
      'wireframe', 'prototype', 'design system', 'figma', 'typography', 'palette', 'svg',
      'graphic',
    ],
  },
  {
    id: 'security',
    zh: '安全',
    en: 'Security',
    category: ['security'],
    keywords: [
      '安全', '审计', '漏洞', '渗透', '合规', '隐私', '权限', '风控', '攻击面', '提示注入',
      'security', 'audit', 'vulnerability', 'penetration', 'pentest', 'compliance', 'privacy',
      'permission', 'owasp', 'threat model', 'injection', 'hardening', 'secret',
    ],
  },
  {
    id: 'education',
    zh: '教育',
    en: 'Education',
    category: ['education'],
    keywords: [
      '教学', '课程', '辅导', '讲解', '题目', '练习', '学习', '考试', '大纲', '科普',
      'teach', 'teaching', 'tutor', 'course', 'curriculum', 'lesson', 'quiz', 'exercise',
      'study', 'exam', 'syllabus', 'explain', 'flashcard',
    ],
  },
  {
    id: 'business',
    zh: '商业',
    en: 'Business',
    category: ['business'],
    keywords: [
      '商业', '策略', '定价', '市场', '竞品', '商业模式', '财务', '预算', '营收', '估值',
      '投资', '融资', '合同', '条款',
      'business', 'strategy', 'pricing', 'market', 'competitor', 'revenue', 'finance',
      'budget', 'valuation', 'investment', 'fundraising', 'contract', 'clause', 'b2b', 'saas',
    ],
  },
  {
    id: 'productivity',
    zh: '效率',
    en: 'Productivity',
    category: ['productivity'],
    keywords: [
      '效率', '计划', '安排', '排期', '拆解', '任务', '待办', '自动化', '批量', '定时',
      '笔记', '会议', '纪要', '邮件', '日程', '提醒',
      'productivity', 'plan', 'schedule', 'todo', 'task', 'organize', 'automate',
      'automation', 'batch', 'cron', 'notes', 'meeting', 'email', 'calendar', 'reminder',
      'workflow',
    ],
  },
  {
    id: 'ai',
    zh: 'AI',
    en: 'AI & Agents',
    category: ['ai'],
    keywords: [
      '智能体', '大模型', '提示词', '知识库', '模型', '训练', '推理', '评测', '向量',
      '多智能体', '聊天机器人',
      'ai', 'llm', 'agent', 'prompt', 'rag', 'embedding', 'vector', 'model', 'inference',
      'fine-tune', 'evaluation', 'benchmark', 'chatbot', 'copilot', 'orchestration',
      'subagent', 'tool use', 'mcp server',
    ],
  },
]

export const DOMAIN_IDS = DOMAINS.map((domain) => domain.id)
export const DOMAIN_BY_ID = new Map(DOMAINS.map((domain) => [domain.id, domain]))

/** Legacy library category → primary domain. `writing`/`other` stay ambiguous. */
export const CATEGORY_TO_DOMAIN = {
  video: 'video',
  office: 'office',
  coding: 'engineering',
  data: 'data',
  research: 'research',
  marketing: 'marketing',
  design: 'design',
  security: 'security',
  education: 'education',
  business: 'business',
  productivity: 'productivity',
  ai: 'ai',
  harness: 'engineering',
  writing: 'marketing',
  other: null,
}

/**
 * Capability vocabulary. `id` is what composeSkillPlan covers and what
 * capability-index.json stores. Keywords are matched against
 * name + description + whenToUse + path (+ intro when provided).
 */
export const CAPABILITIES = [
  // video / creative
  { id: 'storyboard', domain: 'video', zh: '分镜脚本', en: 'Storyboard', keywords: ['分镜', '脚本', '镜头', 'storyboard', 'shot list', 'beat sheet', 'screenplay'] },
  { id: 'video-rendering', domain: 'video', zh: '视频渲染', en: 'Video rendering', keywords: ['渲染视频', '视频渲染', '渲染成视频', '视频输出', 'render video', 'video render', 'render the video', 'mp4', 'encode video', 'export video'] },
  { id: 'video-editing', domain: 'video', zh: '视频剪辑', en: 'Video editing', keywords: ['剪辑', '剪视频', '剪片', 'video editing', 'edit video', 'cut video', 'trim video', 'assemble video'] },
  { id: 'motion-graphics', domain: 'video', zh: '动效', en: 'Motion graphics', keywords: ['动效', '动画', 'motion graphics', 'motion design', 'kinetic typography', 'animated', 'animation'] },
  { id: 'audio-music', domain: 'video', zh: '配乐音效配音', en: 'Audio & voice', keywords: ['配乐', '音效', '配音', '背景音乐', 'bgm', 'background music', 'sound effect', 'sfx', 'voiceover', 'voice over', 'music', 'audio'] },
  { id: 'media-assets', domain: 'video', zh: '素材获取', en: 'Media assets', keywords: ['素材', '图片素材', '视频素材', 'icon', 'stock photo', 'stock footage', 'asset library', 'images', 'footage', 'b-roll'] },
  { id: 'captions', domain: 'video', zh: '字幕', en: 'Captions', keywords: ['字幕', 'caption', 'subtitle', 'srt', 'burn-in text', 'transcript'] },
  // office
  { id: 'document-read', domain: 'office', zh: '文档读取解析', en: 'Document reading', keywords: ['读取文档', '解析文档', '提取文本', '读取', '解析', '阅读', 'parse document', 'extract text', 'read the document', 'ocr', 'open the file', 'read docx'] },
  { id: 'document-write', domain: 'office', zh: '文档生成', en: 'Document authoring', keywords: ['生成文档', '创建文档', '写文档', '起草', '新建文档', '创建', '撰写', 'generate document', 'write a document', 'create a doc', 'draft a report', 'author', 'report generation'] },
  { id: 'document-edit', domain: 'office', zh: '文档编辑', en: 'Document editing', keywords: ['编辑文档', '修改文档', '修订', '填充', '编辑', '修改', 'edit document', 'modify document', 'revise', 'update the doc', 'fill the template', 'template'] },
  { id: 'document-convert', domain: 'office', zh: '格式转换', en: 'Format conversion', keywords: ['格式转换', '转换为', '转换成', '导出为', 'convert to', 'export to', 'convert', 'to pdf', 'to docx', 'to markdown', 'pandoc', 'export'] },
  { id: 'spreadsheet', domain: 'office', zh: '表格处理', en: 'Spreadsheet', keywords: ['表格', '数据透视', '公式', 'excel', 'xlsx', 'spreadsheet', 'workbook', 'worksheet', 'pivot table', 'formula', 'csv', '单元格'] },
  { id: 'presentation', domain: 'office', zh: '幻灯片', en: 'Presentation', keywords: ['幻灯片', '演示文稿', 'ppt', 'pptx', 'slides', 'presentation', 'deck', 'keynote'] },
  { id: 'pdf-processing', domain: 'office', zh: 'PDF 处理', en: 'PDF processing', keywords: ['pdf', '表单填写', 'form fill', 'merge pdf', 'split pdf', '扫描件', 'scanned'] },
  { id: 'layout-review', domain: 'office', zh: '版式检查', en: 'Layout review', keywords: ['版式', '排版', '印刷', '打印', '页面检查', 'layout', 'print', 'render to image', '渲染成图片', 'proofread', 'pagination', 'visual layout'] },
  { id: 'contract-review', domain: 'business', zh: '合同条款核对', en: 'Contract review', keywords: ['合同', '条款', '逐条核对', '核对', '金额', '违约', 'contract', 'clause', 'contract review', 'terms', 'verify amounts', 'compliance check'] },
  // engineering
  { id: 'code-generation', domain: 'engineering', zh: '代码生成', en: 'Code generation', keywords: ['代码生成', '写代码', '实现功能', '脚手架', 'generate code', 'write code', 'scaffold', 'implement', 'boilerplate', 'code generation'] },
  { id: 'code-review', domain: 'engineering', zh: '代码审查', en: 'Code review', keywords: ['代码审查', '审查代码', 'code review', 'review code', 'code audit', '静态检查', 'lint', 'best practices'] },
  { id: 'testing', domain: 'engineering', zh: '测试', en: 'Testing', keywords: ['单元测试', '测试用例', '测试', '测试套件', 'unit test', 'integration test', 'e2e', 'pytest', 'jest', 'coverage', 'test suite', 'tDD', '测试覆盖率'] },
  { id: 'debugging', domain: 'engineering', zh: '调试排错', en: 'Debugging', keywords: ['调试', '排错', '报错', '修复错误', 'debug', 'troubleshoot', 'error', 'stack trace', 'bug', 'regression'] },
  { id: 'harness-plugin', domain: 'engineering', zh: 'DSH 插件开发', en: 'Harness plugin', keywords: ['harness 插件', '插件开发', 'dsh 插件', '插件', 'panel', '面板', 'tool registration', 'cordis', 'bundle', 'mcp server', 'dsh plugin'] },
  { id: 'preset-composition', domain: 'engineering', zh: 'Preset 组合', en: 'Preset composition', keywords: ['agent preset', 'preset', 'composition', '组合', 'cordis composition', 'cordis.yml', 'agent 配置'] },
  { id: 'repo-automation', domain: 'engineering', zh: '仓库自动化', en: 'Repo automation', keywords: ['github actions', 'ci/cd', 'workflow', 'release', '版本发布', 'git', '自动化脚本', 'monorepo', 'issue', 'pull request'] },
  // data
  { id: 'data-analysis', domain: 'data', zh: '数据分析', en: 'Data analysis', keywords: ['数据分析', '分析数据', '统计分析', '指标分析', 'analyze data', 'data analysis', 'analysis', 'statistics', 'metrics', 'insight', '洞察', '趋势分析'] },
  { id: 'data-visualization', domain: 'data', zh: '数据可视化', en: 'Data visualization', keywords: ['可视化', '图表', '画图', '仪表盘', 'visualize', 'visualization', 'chart', 'plot', 'dashboard', 'graph', 'trend chart'] },
  { id: 'sql-query', domain: 'data', zh: 'SQL 查询', en: 'SQL query', keywords: ['sql', '数据库查询', 'query database', 'select from', 'join', 'etl', '数据表', '表连接'] },
  { id: 'data-cleaning', domain: 'data', zh: '数据清洗', en: 'Data cleaning', keywords: ['数据清洗', '清洗', '去重', '标准化', 'clean data', 'data cleaning', 'normalize', 'dedupe', 'deduplicate', 'format data'] },
  // research
  { id: 'web-research', domain: 'research', zh: '检索调研', en: 'Web research', keywords: ['检索', '搜索', '调研', '查资料', 'research', 'web search', 'search', 'survey', 'investigate', 'information gathering', 'sources'] },
  { id: 'synthesis', domain: 'research', zh: '综合归纳', en: 'Synthesis', keywords: ['综述', '总结', '归纳', '对比分析', 'synthesis', 'summarize', 'summarise', 'literature review', 'compare', 'consolidate', 'executive summary'] },
  { id: 'fact-checking', domain: 'research', zh: '事实核查', en: 'Fact checking', keywords: ['事实核查', '核实', '核查', 'fact check', 'fact-check', 'verify claims', 'validate', 'cross-check', 'claim'] },
  { id: 'citation', domain: 'research', zh: '引用标注', en: 'Citations', keywords: ['引用', '参考文献', '来源标注', 'citation', 'reference', 'bibliography', 'footnote', 'source link'] },
  // marketing
  { id: 'copywriting', domain: 'marketing', zh: '文案撰写', en: 'Copywriting', keywords: ['文案', '广告语', '宣传语', '营销文案', 'copywriting', 'copy', 'slogan', 'tagline', 'landing page copy', 'headline'] },
  { id: 'campaign-planning', domain: 'marketing', zh: '活动策划', en: 'Campaign planning', keywords: ['活动策划', '营销活动', '投放', '推广方案', 'campaign', 'launch plan', 'promotion', 'growth', 'go-to-market', 'gtm'] },
  { id: 'seo', domain: 'marketing', zh: 'SEO 优化', en: 'SEO', keywords: ['seo', '搜索排名', '关键词优化', 'google ads', 'ppc', 'sem', 'search engine', 'keyword research', 'backlink'] },
  { id: 'social-content', domain: 'marketing', zh: '社媒内容', en: 'Social content', keywords: ['小红书', '抖音', '公众号', '微博', 'social media', 'social post', 'twitter', 'linkedin', 'instagram', 'tiktok', '帖子', '笔记'] },
  // design
  { id: 'ui-design', domain: 'design', zh: 'UI/UX 设计', en: 'UI/UX design', keywords: ['界面设计', '交互设计', '原型', 'ui', 'ux', 'wireframe', 'prototype', 'design system', 'component library', '组件库', 'figma'] },
  { id: 'visual-design', domain: 'design', zh: '视觉设计', en: 'Visual design', keywords: ['视觉设计', '海报', '配色', '排版设计', 'visual design', 'poster', 'palette', 'typography', 'graphic design', 'banner', '封面'] },
  { id: 'image-generation', domain: 'design', zh: '图像生成', en: 'Image generation', keywords: ['图像生成', '生成图片', '插画', 'illustration', 'image generation', 'generate image', 'svg', 'draw', 'artwork', 'png'] },
  { id: 'brand-design', domain: 'design', zh: '品牌设计', en: 'Brand design', keywords: ['品牌设计', '品牌', 'logo', 'vi', 'brand', 'branding', 'identity', 'style guide', '视觉识别'] },
  // security
  { id: 'security-audit', domain: 'security', zh: '安全审计', en: 'Security audit', keywords: ['安全审计', '漏洞', '渗透测试', '威胁建模', 'security audit', 'vulnerability', 'penetration', 'pentest', 'threat model', 'owasp', 'security review', 'hardening'] },
  { id: 'compliance-check', domain: 'security', zh: '合规检查', en: 'Compliance', keywords: ['合规', '隐私政策', '审计日志', 'compliance', 'gdpr', 'privacy', 'audit log', 'policy', 'regulatory'] },
  { id: 'prompt-injection-defense', domain: 'security', zh: '提示注入防护', en: 'Prompt-injection defense', keywords: ['提示注入', 'prompt injection', '恶意指令', '安全边界', 'jailbreak', 'adversarial', 'sandbox'] },
  // education
  { id: 'tutoring', domain: 'education', zh: '教学辅导', en: 'Tutoring', keywords: ['辅导', '讲解', '题目', '练习', 'tutor', 'tutoring', 'quiz', 'exercise', 'flashcard', 'spaced review', '问答'] },
  { id: 'curriculum-design', domain: 'education', zh: '课程设计', en: 'Curriculum', keywords: ['课程', '教学计划', '大纲', '教案', 'curriculum', 'syllabus', 'lesson plan', 'course'] },
  { id: 'explainer', domain: 'education', zh: '科普解释', en: 'Explainer', keywords: ['科普', '解释', '入门教程', 'explain', 'explainer', 'tutorial', 'concept', 'beginner', '从零开始'] },
  // business
  { id: 'business-strategy', domain: 'business', zh: '商业策略', en: 'Business strategy', keywords: ['商业策略', '市场分析', '竞品分析', '定位', '路线图', 'business strategy', 'market analysis', 'competitor', 'positioning', 'roadmap', 'pricing', '定价', '商业模式'] },
  { id: 'finance-analysis', domain: 'business', zh: '财务分析', en: 'Finance analysis', keywords: ['财务', '营收', '利润', '估值', '预算', '现金流', 'finance', 'revenue', 'profit', 'valuation', 'budget', 'cash flow', 'investment', '股票', '财报'] },
  // productivity
  { id: 'task-planning', domain: 'productivity', zh: '任务规划', en: 'Task planning', keywords: ['计划', '排期', '拆解', '任务管理', '待办', 'planning', 'schedule', 'todo', 'task management', 'break down', 'milestone', 'timeline', '多步工作流', 'multi-step'] },
  { id: 'automation', domain: 'productivity', zh: '自动化', en: 'Automation', keywords: ['自动化', '批量处理', '定时任务', 'automate', 'automation', 'batch', 'cron', 'scheduled', 'pipeline', '批量'] },
  { id: 'note-taking', domain: 'productivity', zh: '笔记纪要', en: 'Note taking', keywords: ['笔记', '会议纪要', '录音', '记录', 'notes', 'note-taking', 'meeting minutes', 'meeting notes', 'transcribe', 'summary'] },
  { id: 'email-calendar', domain: 'productivity', zh: '邮件日程', en: 'Email & calendar', keywords: ['邮件', '日程', '日历', 'email', 'calendar', 'gmail', 'outlook', 'inbox', 'invite', 'reminder'] },
  // ai
  { id: 'llm-app', domain: 'ai', zh: 'LLM 应用', en: 'LLM app', keywords: ['llm', '大模型', 'ai 应用', '聊天机器人', 'chatbot', 'copilot', 'prompt engineering', '提示词', 'ai app', '生成式'] },
  { id: 'rag', domain: 'ai', zh: 'RAG 知识库', en: 'RAG', keywords: ['rag', '检索增强', '知识库', 'embedding', '向量检索', 'vector store', 'retrieval augmented', 'knowledge base'] },
  { id: 'agent-orchestration', domain: 'ai', zh: '智能体编排', en: 'Agent orchestration', keywords: ['智能体', '多智能体', 'agent orchestration', 'multi-agent', 'subagent', '子智能体', 'tool use', 'agent workflow', '任务委派'] },
  { id: 'model-integration', domain: 'ai', zh: '模型接入', en: 'Model integration', keywords: ['模型接入', 'model provider', 'api 集成', 'openai', 'anthropic', 'gemini', 'claude api', 'inference api', 'sdk integration'] },
  { id: 'prompt-engineering', domain: 'ai', zh: '提示工程', en: 'Prompt engineering', keywords: ['prompt', '提示词', 'system prompt', 'few-shot', 'instruction design', '提示工程', 'chain of thought', 'skill 编写', '工具定义', 'model-facing', '上下文加载'] },
  { id: 'eval-design', domain: 'ai', zh: '评测设计', en: 'Evaluation design', keywords: ['评测', '评估', '基准测试', 'evaluation', 'benchmark', 'eval', 'accuracy', 'regression test', '评分标准'] },
]

export const CAPABILITY_IDS = CAPABILITIES.map((capability) => capability.id)
export const CAPABILITY_BY_ID = new Map(CAPABILITIES.map((capability) => [capability.id, capability]))

/**
 * intents: primary/secondary task intents. `capabilities` are the required
 * capabilities a composed plan should cover for that intent.
 */
export const INTENTS = [
  { id: 'contract-review', zh: '合同/条款核对', domain: 'business', capabilities: ['contract-review', 'document-read', 'document-edit'], keywords: ['合同', '条款', '逐条核对', '核对', '金额', '日期别漏', '违约', 'contract', 'clause', 'review the contract', 'verify amounts', 'terms'] },
  { id: 'document-create', zh: '文档撰写', domain: 'office', capabilities: ['document-write', 'document-edit', 'document-read', 'document-convert', 'presentation', 'contract-review'], keywords: ['写一份', '生成', '起草', '整理成', '做成文档', '报告', '周报', '纪要', '写个', '做一个', '整理', 'write', 'create a document', 'draft', 'generate a report', 'prepare a report', 'memo', 'sow', '提案'] },
  { id: 'document-edit', zh: '文档修改', domain: 'office', capabilities: ['document-edit', 'document-read'], keywords: ['修改文档', '编辑', '改一下', '修订', '补充到', 'edit the document', 'revise', 'modify', 'update the'] },
  { id: 'document-convert', zh: '格式转换', domain: 'office', capabilities: ['document-convert'], keywords: ['转换', '转成', '导出为', 'convert', 'export as', 'to pdf', 'to docx'] },
  { id: 'layout-review', zh: '版式检查', domain: 'office', capabilities: ['layout-review', 'document-read'], keywords: ['版式', '排版', '打印', '页面检查', 'layout', 'print', 'render to image', '渲染成图片'] },
  { id: 'video-create', zh: '视频制作', domain: 'video', capabilities: ['storyboard', 'video-rendering', 'video-editing', 'audio-music', 'captions', 'motion-graphics', 'media-assets'], keywords: ['视频', '宣传片', '短片', '短视频', '卡点', '分镜', '片头', '转场', '配音', '配乐', '音乐', '字幕', '成片', '竖屏', '横屏', '预告', '录屏', 'video', 'promo', 'reel', 'short', 'trailer', 'mp4', 'subtitle', 'voiceover', 'storyboard', 'b-roll', 'brand color'] },
  { id: 'video-edit', zh: '视频剪辑', domain: 'video', capabilities: ['video-editing', 'captions'], keywords: ['剪一下', '剪辑', '重剪', 'cut the video', 'edit the video', 'trim', '精剪'] },
  { id: 'data-analysis', zh: '数据分析', domain: 'data', capabilities: ['data-analysis', 'data-visualization', 'sql-query', 'data-cleaning', 'spreadsheet', 'task-planning', 'fact-checking', 'visual-design'], keywords: ['数据', '分析', '指标', '统计', '报表', '图表', '看板', '大盘', 'excel 数据', '清洗', '去重', '汇总', '流水', '对账', '发票', '账目', '慢查询', '索引', '压测', 'csv', 'data', 'analyze', 'analysis', 'metric', 'kpi', 'chart', 'dashboard', 'sql', 'etl', 'map', '热力图', '下钻', 'explain', 'query plan', 'performance'] },
  { id: 'research', zh: '调研', domain: 'research', capabilities: ['web-research', 'synthesis', 'citation', 'fact-checking', 'task-planning'], keywords: ['调研', '研究', '检索', '查资料', '资料', '文献', '论文', '预印本', '综述', '引用', '审稿', 'research', 'survey', 'investigate', 'sources', 'literature', 'paper', 'preprint', 'rebuttal', 'citation'] },
  { id: 'marketing', zh: '营销推广', domain: 'marketing', capabilities: ['copywriting', 'campaign-planning', 'seo', 'social-content', 'data-analysis', 'document-edit'], keywords: ['营销', '推广', '文案', '投放', '活动', 'seo', '广告', '落地页', '转化率', '邮件序列', '冷启动', '语气', '品牌声量', 'campaign', 'copywriting', 'promotion', 'growth', 'landing page', 'cta', 'hero', 'email sequence', 'cold email', 'linkedin', 'tone of voice'] },
  { id: 'design', zh: '设计', domain: 'design', capabilities: ['ui-design', 'visual-design', 'image-generation', 'brand-design', 'layout-review'], keywords: ['设计', '海报', '视觉', 'logo', '插画', '界面', '页面', '重做', '改版', '对比度', '无障碍', '暗色模式', '设计稿', '组件库', '响应式', '交互', '动效', 'design', 'poster', 'visual', 'illustration', 'ui', 'ux', 'layout', 'accessibility', 'contrast', 'dark mode', 'design token', 'wireframe', 'hero', 'component'] },
  { id: 'software-build', zh: '软件开发', domain: 'engineering', capabilities: ['code-generation', 'testing', 'debugging', 'code-review', 'repo-automation', 'task-planning'], keywords: ['开发', '实现', '写代码', '重构', '调试', '测试', '代码', '单测', '边界测试', 'pr', 'code', 'implement', 'refactor', 'debug', 'feature', 'unit test', 'pull request', 'review'] },
  { id: 'plugin-development', zh: '插件/Preset 开发', domain: 'engineering', capabilities: ['harness-plugin', 'preset-composition'], keywords: ['插件', '面板', 'harness', 'cordis', 'mcp', 'preset', 'plugin', 'panel', 'bundle'] },
  { id: 'security-review', zh: '安全审查', domain: 'security', capabilities: ['security-audit', 'compliance-check', 'prompt-injection-defense', 'document-read', 'data-analysis', 'debugging'], keywords: ['安全', '审计', '漏洞', '合规', '渗透', '鉴权', '越权', '注入', '供应链', '恶意包', '权限', '能不能装', '装不装', '安装风险', '凭据', '凭据路径', '后门', '第三方 skill', 'security', 'audit', 'vulnerability', 'compliance', 'auth', 'jwt', 'idor', 'injection', 'supply chain', 'malicious', 'safe to install', 'credential'] },
  { id: 'teaching', zh: '教学', domain: 'education', capabilities: ['tutoring', 'curriculum-design', 'explainer', 'presentation', 'note-taking'], keywords: ['教', '讲解', '讲清楚', '逐段', '解释', '看不懂', '课程', '一节课', '互动课', '题目', '练习', '测验', '学习', '讲课', '大纲', '训练', '章节', 'teach', 'tutor', 'lesson', 'quiz', 'explain', 'course', 'workshop', 'outline', 'curriculum'] },
  { id: 'business-plan', zh: '商业策划', domain: 'business', capabilities: ['business-strategy', 'finance-analysis', 'task-planning', 'presentation', 'document-write', 'layout-review', 'contract-review'], keywords: ['商业', '策略', '定价', '报价', '竞品', '商业模式', '毛利', '折扣', '回款', 'sow', 'business', 'strategy', 'pricing', 'competitor', 'margin', 'proposal', 'business review'] },
  { id: 'planning', zh: '任务规划', domain: 'productivity', capabilities: ['task-planning', 'business-strategy', 'automation', 'email-calendar'], keywords: ['计划', '安排', '排期', '拆解', '步骤', '优先级', '缓冲', 'plan', 'schedule', 'organize', 'break down', 'prioritize'] },
  { id: 'automation', zh: '自动化', domain: 'productivity', capabilities: ['automation', 'repo-automation', 'task-planning', 'email-calendar'], keywords: ['自动化', '批量', '定时', '脚本', '规则', '过滤', '收件箱', 'pipeline', 'automate', 'batch', 'cron', 'script', 'gmail', 'inbox', 'filter', 'sync'] },
  { id: 'meeting-notes', zh: '会议纪要', domain: 'productivity', capabilities: ['note-taking', 'synthesis', 'document-write', 'task-planning'], keywords: ['会议', '纪要', '录音', '转写', '行动项', 'meeting', 'minutes', 'notes', 'transcribe', 'action item'] },
  { id: 'ai-build', zh: 'AI 应用开发', domain: 'ai', capabilities: ['llm-app', 'agent-orchestration', 'prompt-engineering', 'rag', 'eval-design', 'model-integration', 'data-analysis', 'web-research'], keywords: ['智能体', '大模型', '提示词', '知识库', '评测', '回归', '金标', '推理', '模型对比', '量化', 'genai', 'agent', 'llm', 'rag', 'prompt', 'chatbot', 'eval', 'benchmark', 'inference', 'fine-tune'] },
]

export const INTENT_BY_ID = new Map(INTENTS.map((intent) => [intent.id, intent]))

/** Deliverable kinds required by the task contract. */
export const DELIVERABLES = {
  docx: { id: 'docx', zh: 'Word 文档', en: 'Word document', domain: 'office', capabilities: ['document-write', 'document-edit'] },
  pdf: { id: 'pdf', zh: 'PDF', en: 'PDF', domain: 'office', capabilities: ['pdf-processing', 'document-convert'] },
  pptx: { id: 'pptx', zh: '幻灯片', en: 'Slide deck', domain: 'office', capabilities: ['presentation'] },
  xlsx: { id: 'xlsx', zh: '表格', en: 'Spreadsheet', domain: 'data', capabilities: ['spreadsheet', 'data-analysis'] },
  mp4: { id: 'mp4', zh: '视频', en: 'Video', domain: 'video', capabilities: ['video-rendering', 'video-editing'] },
  code: { id: 'code', zh: '代码', en: 'Code', domain: 'engineering', capabilities: ['code-generation'] },
  report: { id: 'report', zh: '报告', en: 'Report', domain: 'research', capabilities: ['synthesis', 'document-write'] },
}

export const DELIVERABLE_ORDER = ['docx', 'pdf', 'pptx', 'xlsx', 'mp4', 'code', 'report']

const DELIVERABLE_PATTERNS = [
  { id: 'docx', re: /\.docx\b|docx|word 文档|word文档|word document|文档草稿/i },
  { id: 'pdf', re: /\.pdf\b|\bpdf\b/i },
  { id: 'pptx', re: /\.pptx?\b|pptx|幻灯片|演示文稿|\bppt\b|slide deck|slides|\bdeck\b/i },
  { id: 'xlsx', re: /\.xlsx?\b|xlsx|excel|表格文件|工作簿|spreadsheet|workbook/i },
  { id: 'mp4', re: /\.mp4\b|\bmp4\b|视频文件|宣传片|短视频|成片|视频|\bvideo\b|\bpromo\b|\breel\b|\btrailer\b/i },
  { id: 'code', re: /\.(?:js|mjs|ts|tsx|py|rs|go|java)\b|代码|源码|仓库|脚本源码|\bcode\b/i },
  { id: 'report', re: /报告|调研报告|分析报告|周报|月报|\breport\b|\bwhitepaper\b/i },
]

const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/

/** Lowercase + full-width → half-width + collapse whitespace. Pure. */
export function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/[\uff01-\uff5e]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const boundaryCache = new Map()

/** English/ASCII term match on word boundaries; CJK term match by substring. */
export function hasKeyword(text, keyword) {
  if (!text || !keyword) return false
  const normalized = normalizeText(keyword)
  if (!normalized) return false
  if (CJK_RE.test(normalized)) return text.includes(normalized)
  let regex = boundaryCache.get(normalized)
  if (!regex) {
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    regex = new RegExp('(^|[^a-z0-9])' + escaped + '(?![a-z0-9])')
    boundaryCache.set(normalized, regex)
  }
  return regex.test(text)
}

/** Count keyword hits against a normalized text. Returns { score, matched }. */
export function matchKeywords(text, keywords) {
  const matched = []
  if (!text) return { score: 0, matched }
  for (const keyword of keywords || []) {
    if (hasKeyword(text, keyword)) matched.push(keyword)
  }
  return { score: matched.length, matched }
}

/** Deterministic kebab-case slug. Non-latin runs are dropped, not transliterated. */
export function slugify(value, maxLength = 64) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return slug.slice(0, maxLength).replace(/-+$/g, '')
}

export function truncate(value, maxLength) {
  const text = String(value || '')
  if (text.length <= maxLength) return text
  return text.slice(0, Math.max(0, maxLength - 1)).replace(/\s+$/, '') + '…'
}

export function round(value, digits = 2) {
  const factor = 10 ** digits
  return Math.round((Number(value) || 0) * factor) / factor
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0))
}

export function sortedUnique(values) {
  return [...new Set((values || []).filter(Boolean))].sort()
}

/** Very small language heuristic (zh if any CJK, else en). */
export function detectLanguage(text) {
  return CJK_RE.test(String(text || '')) ? 'zh' : 'en'
}

/** Detect deliverable kinds mentioned in a task. Returns contract order. */
export function detectDeliverables(task) {
  const text = normalizeText(task)
  const found = []
  const evidence = new Map()
  for (const pattern of DELIVERABLE_PATTERNS) {
    const match = pattern.re.exec(text)
    if (match) {
      found.push(pattern.id)
      evidence.set(pattern.id, match[0].trim())
    }
  }
  return DELIVERABLE_ORDER.filter((id) => found.includes(id)).map((id) => ({
    ...DELIVERABLES[id],
    evidence: evidence.get(id) || id,
  }))
}

/**
 * Split a task into ordered clauses (commas + sentence boundaries), marking
 * clauses that follow an "另外/顺便/同时/also/then" marker as secondary.
 * Secondary status is inherited within the same sentence, so a follow-up clause
 * such as "要转场、片头、背景音乐和配音" stays secondary.
 */
export function splitClauses(task) {
  const raw = String(task || '').trim()
  if (!raw) return []
  const sentences = raw
    .split(/[。！!？?；;\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const clauses = []
  // Only a *separate deliverable* marker halves the clause weight. Sequential
  // markers (然后/再/then) keep full weight: they are the next step of the same task.
  const secondaryMarker = /^(另外|顺便|此外|还有一个|再加|以及|also\b|additionally\b|as well\b|plus\b|secondly\b)/i
  for (const sentence of sentences) {
    const parts = sentence
      .split(/[，,]+/)
      .map((part) => part.trim())
      .filter(Boolean)
    let secondary = false
    for (const part of parts) {
      if (secondaryMarker.test(part)) secondary = true
      clauses.push({ index: clauses.length, text: part, secondary: secondary && clauses.length > 0 })
    }
  }
  return clauses
}

/** Score all domains against a task text. Returns sorted [{id, score, matched}]. */
export function scoreDomains(text) {
  const normalized = normalizeText(text)
  const scores = []
  for (const domain of DOMAINS) {
    const { score, matched } = matchKeywords(normalized, domain.keywords)
    if (score > 0) scores.push({ id: domain.id, score, matched })
  }
  scores.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  return scores
}

/** Map an arbitrary (possibly legacy/alias) domain id to a contract domain id. */
export function normalizeDomain(value) {
  const key = String(value || '').toLowerCase().trim()
  if (!key) return null
  if (DOMAIN_BY_ID.has(key)) return key
  const aliases = {
    'video-creative': 'video', creative: 'video', media: 'video', animation: 'video',
    document: 'office', docs: 'office', doc: 'office', 'office-document': 'office',
    coding: 'engineering', code: 'engineering', software: 'engineering', dev: 'engineering',
    'software-engineering': 'engineering', engineering: 'engineering',
    analytics: 'data', 'data-analytics': 'data', database: 'data',
    search: 'research', research: 'research',
    marketing: 'marketing', growth: 'marketing',
    design: 'design', ui: 'design', 'ui-ux': 'design', visual: 'design',
    security: 'security', compliance: 'security',
    education: 'education', teaching: 'education',
    business: 'business', finance: 'business',
    productivity: 'productivity', efficiency: 'productivity', automation: 'productivity',
    ai: 'ai', 'ai-agent': 'ai', agents: 'ai', llm: 'ai',
  }
  return aliases[key] || null
}

/** Normalize a capability alias to a contract capability id (best effort). */
export function normalizeCapability(value) {
  const key = String(value || '').toLowerCase().trim()
  if (!key) return null
  if (CAPABILITY_BY_ID.has(key)) return key
  const compact = key.replace(/[^a-z0-9]+/g, '')
  for (const capability of CAPABILITIES) {
    if (capability.id.replace(/[^a-z0-9]+/g, '') === compact) return capability.id
  }
  const aliases = {
    docx: 'document-write', doc: 'document-write', document: 'document-write',
    'document-creation': 'document-write', 'document-generation': 'document-write',
    'document-processing': 'document-edit', 'doc-review': 'contract-review',
    'contract-check': 'contract-review', 'contract-analysis': 'contract-review',
    video: 'video-rendering', 'video-production': 'video-rendering',
    'video-creation': 'video-rendering', 'video-motion': 'motion-graphics',
    audio: 'audio-music', voice: 'audio-music', music: 'audio-music',
    spreadsheet: 'spreadsheet', 'data-analysis': 'data-analysis',
    'data-viz': 'data-visualization', 'data-visualisation': 'data-visualization',
    'web-search': 'web-research', 'deep-research': 'web-research',
    'code-gen': 'code-generation', 'coding': 'code-generation',
    'code-testing': 'testing', 'unit-testing': 'testing',
    plugin: 'harness-plugin', 'dsh-plugin': 'harness-plugin',
    preset: 'preset-composition', 'composition': 'preset-composition',
    'security-review': 'security-audit', 'vulnerability-scan': 'security-audit',
    'uiux': 'ui-design', 'ux': 'ui-design',
    prompt: 'prompt-engineering', 'agent': 'agent-orchestration',
    agents: 'agent-orchestration', 'multi-agent': 'agent-orchestration',
    evaluation: 'eval-design', 'metrics': 'data-analysis',
  }
  return aliases[key] || null
}

export function domainLabel(id, lang = 'zh') {
  const domain = DOMAIN_BY_ID.get(id)
  if (!domain) return id === 'unknown' ? (lang === 'en' ? 'Unknown' : '未知') : String(id || '')
  return lang === 'en' ? domain.en : domain.zh
}

export function capabilityLabel(id, lang = 'zh') {
  const capability = CAPABILITY_BY_ID.get(id)
  if (!capability) return String(id || '')
  return lang === 'en' ? capability.en : capability.zh
}

export function intentLabel(id, lang = 'zh') {
  const intent = INTENT_BY_ID.get(id)
  if (!intent) return String(id || '')
  return lang === 'en' ? (intent.en || intent.id) : intent.zh
}
