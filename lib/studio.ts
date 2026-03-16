export type StudioCategory = "Automation" | "Coding" | "General" | "Research" | "Security" | "Web3";

export interface StudioDraft {
  name: string;
  slug: string;
  author: string;
  category: StudioCategory;
  summary: string;
  description: string;
  tags: string;
  useCases: string;
  triggers: string;
  prerequisites: string;
  installCommand: string;
  tools: string;
  workflow: string;
  safetyNotes: string;
  examples: string;
  configSnippet: string;
}

export type StudioTemplateId = "general" | "automation" | "coding" | "research" | "security" | "web3";

export const DEFAULT_STUDIO_DRAFT: StudioDraft = {
  name: "",
  slug: "",
  author: "",
  category: "General",
  summary: "",
  description: "",
  tags: "",
  useCases: "",
  triggers: "",
  prerequisites: "",
  installCommand: "",
  tools: "",
  workflow: "",
  safetyNotes: "",
  examples: "",
  configSnippet: ""
};

export const STUDIO_TEMPLATE_ORDER: StudioTemplateId[] = [
  "general",
  "automation",
  "coding",
  "research",
  "security",
  "web3"
];

export const STUDIO_TEMPLATES: Record<StudioTemplateId, Partial<StudioDraft>> = {
  general: {
    category: "General",
    summary: "Use this skill when the user needs a reliable specialist workflow.",
    description:
      "Define the skill's mission, scope, and the kind of requests it should handle. Keep it operational and specific.",
    useCases: "Handle recurring user requests\nApply a clear specialist workflow\nReturn structured, usable output",
    triggers: "Use when the user asks for this workflow directly\nUse when a repeated task benefits from specialization",
    workflow: "Clarify the request\nCollect the minimum required inputs\nExecute a repeatable workflow\nReturn the final output in a clean format",
    examples: '"Help me run this workflow end-to-end"\n"Use this skill for this task"'
  },
  automation: {
    category: "Automation",
    summary: "Automate a repeatable workflow with deterministic steps and clear safeguards.",
    description:
      "Best for multi-step tasks that involve repetitive processing, job orchestration, or scheduled execution with low ambiguity.",
    tags: "automation, workflow, ops",
    useCases: "Run recurring workflows\nCoordinate multi-step tasks\nReduce manual operational work",
    triggers: "User asks to automate a workflow\nUser describes a repetitive process\nA task should run with consistent steps every time",
    workflow: "Validate inputs\nRun the workflow in stages\nTrack progress and failures\nReturn a concise execution summary",
    safetyNotes: "Confirm destructive actions before execution\nLog or summarize each major step"
  },
  coding: {
    category: "Coding",
    summary: "Provide focused engineering help with explicit constraints, code-aware reasoning, and implementation steps.",
    description:
      "Use for development tasks such as code generation, refactors, architecture guidance, debugging, and implementation planning.",
    tags: "coding, engineering, developer-tools",
    useCases: "Implement new features\nDebug code paths\nGenerate technical plans and code updates",
    triggers: "User asks to build or debug software\nUser shares code and wants implementation help",
    workflow: "Understand the codebase context\nIdentify the minimal viable change\nImplement with constraints in mind\nValidate the result",
    examples: '"Fix this bug in the API layer"\n"Generate a clean TypeScript implementation"'
  },
  research: {
    category: "Research",
    summary: "Investigate a question, synthesize evidence, and return a concise research output.",
    description:
      "Use when the task requires structured analysis, source comparison, note extraction, or written synthesis from multiple inputs.",
    tags: "research, analysis, synthesis",
    useCases: "Summarize source material\nCompare tools or options\nProduce briefs and evidence-based answers",
    triggers: "User asks for research\nUser wants analysis from multiple sources\nUser asks for a brief or synthesis",
    workflow: "Define the question\nGather and compare evidence\nExtract key findings\nDeliver a concise synthesis",
    examples: '"Research the best approach for this problem"\n"Summarize these sources into key findings"'
  },
  security: {
    category: "Security",
    summary: "Handle security-sensitive workflows with explicit caution, narrow scope, and review-first output.",
    description:
      "Use for defensive reviews, hardening guidance, vulnerability checks, and risk analysis where safety and review discipline matter.",
    tags: "security, review, hardening",
    useCases: "Review security posture\nAudit configurations\nSuggest defensive remediations",
    triggers: "User asks for a security review\nUser wants hardening or risk analysis",
    workflow: "Define the scope\nInspect the relevant surfaces\nList risks with evidence\nRecommend least-risk next steps",
    safetyNotes: "Do not assume safety\nFavor defensive guidance\nCall out uncertainty explicitly"
  },
  web3: {
    category: "Web3",
    summary: "Support wallet, protocol, or on-chain workflows with clear assumptions and explicit risk framing.",
    description:
      "Use when the task involves crypto tooling, wallet operations, protocol interactions, or chain-specific workflows.",
    tags: "web3, blockchain, crypto",
    useCases: "Explain protocol flows\nGuide on-chain operations\nStructure wallet or data workflows",
    triggers: "User asks about wallets, chains, tokens, or protocol actions",
    workflow: "Identify chain and protocol context\nConfirm assets and parameters\nOutline the workflow and risks\nReturn execution-ready guidance",
    safetyNotes: "Never hide transaction risk\nSurface chain, asset, and permission assumptions"
  }
};

export interface StudioCopy {
  title: string;
  description: string;
  templateTitle: string;
  templateDescription: string;
  formTitle: string;
  formDescription: string;
  previewTitle: string;
  previewDescription: string;
  renderedTab: string;
  markdownTab: string;
  copyMarkdown: string;
  copied: string;
  downloadMarkdown: string;
  reset: string;
  fieldName: string;
  fieldSlug: string;
  fieldAuthor: string;
  fieldCategory: string;
  fieldSummary: string;
  fieldDescription: string;
  fieldTags: string;
  fieldUseCases: string;
  fieldTriggers: string;
  fieldPrerequisites: string;
  fieldInstallCommand: string;
  fieldTools: string;
  fieldWorkflow: string;
  fieldConfig: string;
  fieldSafety: string;
  fieldExamples: string;
  tagsHelp: string;
  listHelp: string;
  installHelp: string;
  configHelp: string;
  placeholders: {
    name: string;
    slug: string;
    author: string;
    summary: string;
    description: string;
    tags: string;
    list: string;
    installCommand: string;
    tools: string;
    config: string;
  };
  templates: Record<StudioTemplateId, string>;
}

const EN_STUDIO_COPY: StudioCopy = {
  title: "Studio",
  description: "Build a real SKILL.md draft locally with YAML frontmatter, structured sections, and export-ready markdown.",
  templateTitle: "Quick Start Templates",
  templateDescription: "Start from a category-specific pattern, then customize the draft to match your own workflow.",
  formTitle: "Skill Builder",
  formDescription: "Fill in the core metadata and operational sections. The markdown output updates in real time.",
  previewTitle: "Generated SKILL.md",
  previewDescription: "Copy or download the generated markdown, then publish or commit it wherever your skill lives.",
  renderedTab: "Rendered",
  markdownTab: "Markdown",
  copyMarkdown: "Copy Markdown",
  copied: "Copied",
  downloadMarkdown: "Download SKILL.md",
  reset: "Reset",
  fieldName: "Skill Name",
  fieldSlug: "Slug",
  fieldAuthor: "Author / Namespace",
  fieldCategory: "Category",
  fieldSummary: "Summary",
  fieldDescription: "Description",
  fieldTags: "Tags",
  fieldUseCases: "When to Use",
  fieldTriggers: "Trigger Phrases",
  fieldPrerequisites: "Prerequisites",
  fieldInstallCommand: "Install Command",
  fieldTools: "Available Tools",
  fieldWorkflow: "Workflow",
  fieldConfig: "Configuration Snippet",
  fieldSafety: "Safety Notes",
  fieldExamples: "Example Requests",
  tagsHelp: "Comma-separated. Example: automation, workflow, browser",
  listHelp: "One item per line.",
  installHelp: "Optional. This becomes the Installation code block.",
  configHelp: "Optional JSON or config snippet for the Configuration section.",
  placeholders: {
    name: "Browser Operations Assistant",
    slug: "browser-operations-assistant",
    author: "your-handle",
    summary: "Explain in one sentence what this skill is for.",
    description: "Describe the skill's mission, scope, and what good output looks like.",
    tags: "automation, browser, ops",
    list: "One item per line",
    installCommand: "npx skills add your-handle/browser-operations-assistant",
    tools: "browser_open - Open a page\nbrowser_extract - Extract structured content",
    config: '{\n  \"apiKeyEnv\": \"SERVICE_API_KEY\"\n}'
  },
  templates: {
    general: "General",
    automation: "Automation",
    coding: "Coding",
    research: "Research",
    security: "Security",
    web3: "Web3"
  }
};

const ZH_STUDIO_COPY: StudioCopy = {
  title: "Studio",
  description: "本地生成可直接发布的 SKILL.md 草稿，包含 YAML frontmatter、结构化章节和导出能力。",
  templateTitle: "快速模板",
  templateDescription: "先选一个分类模板，再按你的真实工作流改成自己的 skill。",
  formTitle: "Skill Builder",
  formDescription: "填写核心元数据和执行说明，右侧会实时生成 markdown。",
  previewTitle: "生成的 SKILL.md",
  previewDescription: "复制或下载生成结果，再提交到你的仓库或发布流程里。",
  renderedTab: "渲染预览",
  markdownTab: "Markdown",
  copyMarkdown: "复制 Markdown",
  copied: "已复制",
  downloadMarkdown: "下载 SKILL.md",
  reset: "重置",
  fieldName: "技能名称",
  fieldSlug: "Slug",
  fieldAuthor: "作者 / Namespace",
  fieldCategory: "分类",
  fieldSummary: "摘要",
  fieldDescription: "描述",
  fieldTags: "标签",
  fieldUseCases: "何时使用",
  fieldTriggers: "触发语句",
  fieldPrerequisites: "前置条件",
  fieldInstallCommand: "安装命令",
  fieldTools: "可用工具",
  fieldWorkflow: "工作流",
  fieldConfig: "配置片段",
  fieldSafety: "安全说明",
  fieldExamples: "示例请求",
  tagsHelp: "用英文逗号分隔，例如 automation, workflow, browser",
  listHelp: "每行一条。",
  installHelp: "可选，会自动生成 Installation 代码块。",
  configHelp: "可选，可填写 JSON 或配置片段。",
  placeholders: {
    name: "浏览器操作助手",
    slug: "browser-operations-assistant",
    author: "your-handle",
    summary: "用一句话说明这个 skill 的核心用途。",
    description: "说明 skill 的目标、边界，以及理想输出应是什么样。",
    tags: "automation, browser, ops",
    list: "每行一条",
    installCommand: "npx skills add your-handle/browser-operations-assistant",
    tools: "browser_open - 打开页面\nbrowser_extract - 提取结构化内容",
    config: '{\n  \"apiKeyEnv\": \"SERVICE_API_KEY\"\n}'
  },
  templates: {
    general: "通用",
    automation: "自动化",
    coding: "编程",
    research: "研究",
    security: "安全",
    web3: "Web3"
  }
};

function quoteYaml(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function slugifySkillName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseLineList(value: string): string[] {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildBulletSection(title: string, items: string[]): string {
  if (!items.length) return "";
  return `## ${title}\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function buildNumberedSection(title: string, items: string[]): string {
  if (!items.length) return "";
  return `## ${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;
}

export function buildSkillMarkdown(draft: StudioDraft): string {
  const name = draft.name.trim() || "Untitled Skill";
  const slug = draft.slug.trim() || slugifySkillName(name) || "untitled-skill";
  const author = draft.author.trim();
  const summary = draft.summary.trim();
  const description = draft.description.trim();
  const tags = parseTags(draft.tags);
  const useCases = parseLineList(draft.useCases);
  const triggers = parseLineList(draft.triggers);
  const prerequisites = parseLineList(draft.prerequisites);
  const tools = parseLineList(draft.tools);
  const workflow = parseLineList(draft.workflow);
  const safetyNotes = parseLineList(draft.safetyNotes);
  const examples = parseLineList(draft.examples);
  const installCommand = draft.installCommand.trim();
  const configSnippet = draft.configSnippet.trim();

  const frontmatter = [
    "---",
    `name: ${quoteYaml(name)}`,
    `slug: ${quoteYaml(slug)}`,
    author ? `author: ${quoteYaml(author)}` : null,
    `category: ${quoteYaml(draft.category)}`,
    summary ? `summary: ${quoteYaml(summary)}` : null,
    tags.length
      ? ["tags:", ...tags.map((tag) => `  - ${quoteYaml(tag)}`)].join("\n")
      : null,
    "---"
  ]
    .filter(Boolean)
    .join("\n");

  const sections = [
    `# ${name}`,
    summary ? `> ${summary}` : "",
    description,
    buildBulletSection("When to Use", useCases),
    buildBulletSection("Trigger Phrases", triggers),
    buildBulletSection("Prerequisites", prerequisites),
    installCommand ? `## Installation\n\n\`\`\`bash\n${installCommand}\n\`\`\`` : "",
    buildBulletSection("Available Tools", tools),
    buildNumberedSection("Workflow", workflow),
    configSnippet ? `## Configuration\n\n\`\`\`json\n${configSnippet}\n\`\`\`` : "",
    buildBulletSection("Safety Notes", safetyNotes),
    buildBulletSection("Example Requests", examples)
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${frontmatter}\n\n${sections}`.trim();
}

export function buildStudioFileName(draft: StudioDraft): string {
  const slug = draft.slug.trim() || slugifySkillName(draft.name) || "skill";
  return `${slug}.md`;
}

export function getStudioCopy(locale: string): StudioCopy {
  return locale === "zh" ? ZH_STUDIO_COPY : EN_STUDIO_COPY;
}
