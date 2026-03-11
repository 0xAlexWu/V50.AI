import type { SkillSourceType, TrustLabel } from "@/types/skill";

export const SUPPORTED_LOCALES = ["en", "zh", "ja", "ko", "de", "hi"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export interface Messages {
  nav: {
    storeTagline: string;
    home: string;
    skills: string;
    collections: string;
    about: string;
    searchAria: string;
    language: string;
  };
  footer: {
    description: string;
    clawhubRepo: string;
    skillsArchive: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    browseSkills: string;
    viewCollections: string;
    liveEntries: string;
  };
  home: {
    featuredTitle: string;
    featuredDesc: string;
    recentlyUpdatedTitle: string;
    recentlyUpdatedDesc: string;
    editorialTitle: string;
    editorialDesc: string;
    browseCategoryTitle: string;
    browseCategoryDesc: string;
    saferTitle: string;
    saferDesc: string;
    topPicksTitle: string;
    topPicksDesc: string;
    exploreAllSkills: string;
    noLiveTitle: string;
    noLiveDesc: string;
  };
  skills: {
    directoryTitle: string;
    directoryDesc: string;
    noMatchTitle: string;
    noMatchDesc: string;
    searchPlaceholder: string;
    allSources: string;
    archivedSource: string;
    registrySource: string;
    repositorySource: string;
    needsReview: string;
    signalAll: string;
    signalWithStars: string;
    signalWithDownloads: string;
    signalWithBoth: string;
    sortRecent: string;
    sortName: string;
    sortSource: string;
    sortStars: string;
    sortDownloads: string;
    starsLabel: string;
    downloadsLabel: string;
    categoryAll: string;
    categoryAutomation: string;
    categoryCoding: string;
    categoryGeneral: string;
    categoryResearch: string;
    categorySecurity: string;
    categoryWeb3: string;
    aiSearchPlaceholder: string;
    aiSearchButton: string;
    aiSearching: string;
    aiSearchHint: string;
    aiSearchError: string;
    viewGrid: string;
    viewList: string;
    apply: string;
  };
  collections: {
    title: string;
    desc: string;
    recentlyUpdatedTitle: string;
    recentlyUpdatedDesc: string;
    researchTitle: string;
    researchDesc: string;
    codingTitle: string;
    codingDesc: string;
    automationTitle: string;
    automationDesc: string;
    securityTitle: string;
    securityDesc: string;
    web3Title: string;
    web3Desc: string;
    noCollectionsTitle: string;
    noCollectionsDesc: string;
    previewSuffix: string;
    openCollection: string;
    liveSkills: string;
  };
  about: {
    title: string;
    desc: string;
    whyTitle: string;
    whyBody: string;
    trustTitle: string;
    trustBody: string;
    integrityTitle: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    donationTitle: string;
    donationBody: string;
    donationAddressMissing: string;
    donationOpenWallet: string;
    donationShowQr: string;
    donationHideQr: string;
  };
  author: {
    title: string;
    description: string;
    totalSkills: string;
    totalStars: string;
    totalDownloads: string;
    chartTitle: string;
    chartDesc: string;
    skillsTitle: string;
    subscribe: string;
    subscribed: string;
    rss: string;
    noSkills: string;
  };
  detail: {
    noMarkdownTitle: string;
    noMarkdownDesc: string;
    sourceTransparencyTitle: string;
    sourceTransparencyDesc: string;
    relatedTitle: string;
    relatedDesc: string;
    openRegistryRecord: string;
    openInGithub: string;
    openInClawHub: string;
  };
  metadata: {
    profileUnavailable: string;
    versionPrefix: string;
    versionNotProvided: string;
    updatedDateUnavailable: string;
  };
  safety: {
    title: string;
  };
  common: {
    viewSkill: string;
    skillNotFound: string;
    skillNotFoundDesc: string;
    backToSkills: string;
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const en: Messages = {
  nav: {
    storeTagline: "The Largest Skills Store for OpenClaw",
    home: "Home",
    skills: "Skills",
    collections: "Collections",
    about: "About",
    searchAria: "Search skills",
    language: "Language"
  },
  footer: {
    description: "V50.ai surfaces public OpenClaw skills with source transparency and trust-aware labels.",
    clawhubRepo: "ClawHub Repo",
    skillsArchive: "Skills Archive"
  },
  hero: {
    kicker: "The Largest Skills Store for OpenClaw",
    title: "Discover real skills with source context, safety signals, and deploy-day clarity.",
    subtitle:
      "V50.ai indexes public OpenClaw skills from real repositories, parses SKILL.md metadata, and presents trust-aware discovery without fabricated ratings or install counts.",
    browseSkills: "Browse Skills",
    viewCollections: "View Collections",
    liveEntries: "{count} live entries loaded from trusted public sources"
  },
  home: {
    featuredTitle: "Featured",
    featuredDesc: "Editorial picks selected from real entries with stronger metadata and clearer documentation.",
    recentlyUpdatedTitle: "Recently Updated",
    recentlyUpdatedDesc: "Ordered by upstream publish metadata when available.",
    editorialTitle: "Editorial Collections",
    editorialDesc: "Dynamically grouped from real skill tags and descriptions.",
    browseCategoryTitle: "Browse by Category",
    browseCategoryDesc: "No synthetic categories; each category is inferred from source metadata and content signals.",
    saferTitle: "Safer Choices",
    saferDesc: "Entries with stronger descriptions and fewer review flags. Always review source before execution.",
    topPicksTitle: "Top Picks",
    topPicksDesc:
      "Top picks on V50.ai are editorial and transparency-first. We do not fabricate installs, ratings, or review counts.",
    exploreAllSkills: "Explore All Skills",
    noLiveTitle: "No live data loaded",
    noLiveDesc: "V50.ai only renders real source data. Check network access or GitHub rate limits and refresh."
  },
  skills: {
    directoryTitle: "Skills Directory",
    directoryDesc: "Real OpenClaw skills, parsed from public source files. No mock records, no fabricated metrics.",
    noMatchTitle: "No matching skills",
    noMatchDesc: "Try a broader query or remove filters. V50.ai only shows real source data and does not synthesize missing entries.",
    searchPlaceholder: "Search by name, tags, author, or summary",
    allSources: "All Sources",
    archivedSource: "Archived Source",
    registrySource: "Registry Source",
    repositorySource: "Repository Source",
    needsReview: "Needs Review",
    signalAll: "All Signals",
    signalWithStars: "Has Stars",
    signalWithDownloads: "Has Downloads",
    signalWithBoth: "Stars + Downloads",
    sortRecent: "Recently Updated",
    sortName: "Name",
    sortSource: "Source",
    sortStars: "GitHub Stars",
    sortDownloads: "Downloads",
    starsLabel: "Stars",
    downloadsLabel: "Downloads",
    categoryAll: "All",
    categoryAutomation: "Automation",
    categoryCoding: "Coding",
    categoryGeneral: "General",
    categoryResearch: "Research",
    categorySecurity: "Security",
    categoryWeb3: "Web3",
    aiSearchPlaceholder: "Ask AI to find skills (e.g. highly starred security tools with downloads)",
    aiSearchButton: "AI Search",
    aiSearching: "Searching...",
    aiSearchHint: "AI search generates real filters from your request and applies them instantly.",
    aiSearchError: "AI search is temporarily unavailable. Please try again.",
    viewGrid: "Grid",
    viewList: "List",
    apply: "Apply"
  },
  collections: {
    title: "Collections",
    desc: "Collections are generated from real tags and descriptions. No fake rankings or synthetic engagement signals.",
    recentlyUpdatedTitle: "Recently Updated",
    recentlyUpdatedDesc: "Real skills ordered by latest publish metadata from the archive.",
    researchTitle: "Research Skills",
    researchDesc: "Skills related to analysis, papers, and exploration workflows.",
    codingTitle: "Coding Skills",
    codingDesc: "Engineering and development-focused assistant skills.",
    automationTitle: "Automation Skills",
    automationDesc: "Workflow and process automation skills.",
    securityTitle: "Security-Related Skills",
    securityDesc: "Security-oriented entries that require careful review before use.",
    web3Title: "Web3 Skills",
    web3Desc: "On-chain and crypto-adjacent skills from the public ecosystem.",
    noCollectionsTitle: "No collections available",
    noCollectionsDesc: "Real source data could not be loaded. Check your network or GitHub API quota.",
    previewSuffix: "Preview",
    openCollection: "Open Collection",
    liveSkills: "live skills"
  },
  about: {
    title: "About V50.ai",
    desc: "V50.ai is a launch-ready storefront for discovering real OpenClaw skills with source transparency and trust-aware framing.",
    whyTitle: "Why V50.ai exists",
    whyBody:
      "Open skill ecosystems grow quickly, but discoverability and trust context often lag behind. V50.ai indexes public skill records and presents them in a clear, editorial storefront designed for fast review.",
    trustTitle: "Trust-aware by default",
    trustBody:
      "Public archives can include unsafe or outdated entries. V50.ai never assumes a listed skill is verified safe. Every record includes source attribution, trust labels, and a visible safety notice.",
    integrityTitle: "Data integrity principles",
    bullet1: "Only real source data is rendered. No mock skills.",
    bullet2: "No fabricated installs, ratings, reviews, or popularity scores.",
    bullet3: "Missing upstream fields are shown as missing, not invented.",
    bullet4: "Rankings are metadata-driven and clearly labeled as editorial or heuristic.",
    donationTitle: "Buy Me A Coffee",
    donationBody: "If V50.ai helps your workflow, you can support ongoing maintenance via BTC, ETH, DOGE, or LTC.",
    donationAddressMissing: "Address not configured yet.",
    donationOpenWallet: "Open Wallet",
    donationShowQr: "QR Code",
    donationHideQr: "Hide QR"
  },
  author: {
    title: "Author Profile",
    description: "Skills published by {author} with real stars/downloads and source-aware metadata.",
    totalSkills: "Total Skills",
    totalStars: "Total Stars",
    totalDownloads: "Total Downloads",
    chartTitle: "Skills Performance",
    chartDesc: "Comparison chart based on real stars and downloads signals from source data.",
    skillsTitle: "Published Skills",
    subscribe: "Subscribe Author",
    subscribed: "Subscribed",
    rss: "RSS Feed",
    noSkills: "No skills found for this author."
  },
  detail: {
    noMarkdownTitle: "No markdown body",
    noMarkdownDesc: "This source entry does not include full markdown content beyond metadata.",
    sourceTransparencyTitle: "Source Transparency",
    sourceTransparencyDesc:
      "This detail page is rendered from real SKILL.md content. Trust labels are metadata-based hints, not a safety guarantee.",
    relatedTitle: "Related Skills",
    relatedDesc: "Related by shared tags or category signals.",
    openRegistryRecord: "Open Registry Record",
    openInGithub: "Open in GitHub",
    openInClawHub: "Open in ClawHub"
  },
  metadata: {
    profileUnavailable: "Profile unavailable",
    versionPrefix: "Version {version}",
    versionNotProvided: "Version not provided",
    updatedDateUnavailable: "Updated date unavailable"
  },
  safety: {
    title: "Safety Notice"
  },
  common: {
    viewSkill: "View Skill",
    skillNotFound: "Skill Not Found",
    skillNotFoundDesc: "The requested skill slug does not exist in the current live index.",
    backToSkills: "Back to Skills"
  }
};

const localeOverrides: Record<Locale, DeepPartial<Messages>> = {
  en: {},
  zh: {
    nav: {
      storeTagline: "OpenClaw 技能商店",
      home: "首页",
      skills: "技能",
      collections: "合集",
      about: "关于",
      searchAria: "搜索技能",
      language: "语言"
    },
    hero: {
      kicker: "OpenClaw 技能商店",
      title: "发现真实技能，兼顾来源透明、安全信号与上线可用性。",
      subtitle: "V50.ai 从公开来源抓取真实 OpenClaw 技能，解析 SKILL.md 元数据，并以可信优先方式呈现。",
      browseSkills: "浏览技能",
      viewCollections: "查看合集",
      liveEntries: "已加载 {count} 条真实技能"
    },
    home: {
      featuredTitle: "精选",
      featuredDesc: "基于真实数据、元信息更完整的编辑精选。",
      recentlyUpdatedTitle: "最近更新",
      recentlyUpdatedDesc: "按上游发布时间排序（如可用）。",
      editorialTitle: "编辑合集",
      editorialDesc: "根据真实技能标签与描述动态聚合。",
      browseCategoryTitle: "按分类浏览",
      browseCategoryDesc: "不做虚构分类，完全基于来源元数据和内容信号。",
      saferTitle: "更稳妥的选择",
      saferDesc: "描述更完整、风险标记更少。执行前仍需审查来源。",
      topPicksTitle: "推荐",
      topPicksDesc: "V50.ai 推荐以透明和可审计为优先，不虚构安装量、评分或评论数。",
      exploreAllSkills: "查看全部技能",
      noLiveTitle: "暂未加载到实时数据",
      noLiveDesc: "V50.ai 只展示真实来源数据。请检查网络或 GitHub 限流后刷新。"
    },
    skills: {
      directoryTitle: "技能目录",
      directoryDesc: "基于公开源数据的真实 OpenClaw 技能目录。",
      noMatchTitle: "没有匹配结果",
      noMatchDesc: "可尝试更宽泛关键词或移除筛选。V50.ai 不会虚构缺失条目。",
      searchPlaceholder: "按名称、标签、作者或摘要搜索",
      allSources: "全部来源",
      archivedSource: "归档来源",
      registrySource: "注册表来源",
      repositorySource: "仓库来源",
      needsReview: "需审查",
      signalAll: "全部指标",
      signalWithStars: "有标星",
      signalWithDownloads: "有下载",
      signalWithBoth: "标星+下载",
      sortRecent: "最近更新",
      sortName: "名称",
      sortSource: "来源",
      sortStars: "GitHub 标星",
      sortDownloads: "下载量",
      starsLabel: "标星",
      downloadsLabel: "下载",
      categoryAll: "全部",
      categoryAutomation: "自动化",
      categoryCoding: "编程",
      categoryGeneral: "通用",
      categoryResearch: "研究",
      categorySecurity: "安全",
      categoryWeb3: "Web3",
      aiSearchPlaceholder: "让 AI 帮你找技能（例如：高标星且有下载量的安全技能）",
      aiSearchButton: "AI 搜索",
      aiSearching: "正在搜索...",
      aiSearchHint: "AI 会把你的意图转换为真实筛选条件并立即应用。",
      aiSearchError: "AI 搜索暂时不可用，请稍后重试。",
      viewGrid: "网格",
      viewList: "列表",
      apply: "应用"
    },
    collections: {
      title: "合集",
      desc: "合集基于真实标签与描述动态生成，不使用虚构热度或互动指标。",
      recentlyUpdatedTitle: "最近更新",
      recentlyUpdatedDesc: "按最新发布时间排序的真实技能。",
      researchTitle: "研究类技能",
      researchDesc: "适用于分析、论文与探索工作流的技能。",
      codingTitle: "编程类技能",
      codingDesc: "面向工程与开发场景的助手技能。",
      automationTitle: "自动化技能",
      automationDesc: "聚焦流程编排与任务自动化。",
      securityTitle: "安全相关技能",
      securityDesc: "安全向技能，使用前建议重点审查。",
      web3Title: "Web3 技能",
      web3Desc: "来自公开生态的链上与加密相关技能。",
      noCollectionsTitle: "暂无可用合集",
      noCollectionsDesc: "未加载到真实来源数据，请检查网络或 GitHub API 配额。",
      openCollection: "打开合集",
      liveSkills: "条技能",
      previewSuffix: "预览"
    },
    about: {
      title: "关于 V50.ai",
      desc: "V50.ai 是一个可立即上线的 OpenClaw 技能发现站，强调来源透明与可信展示。",
      whyTitle: "为什么要做 V50.ai",
      whyBody: "开放技能生态增长很快，但可发现性与可信上下文常常滞后。V50.ai 索引公开技能记录，并以清晰、可审查的编辑式体验呈现。",
      trustTitle: "默认信任感知",
      trustBody: "公开归档中可能存在过期或不安全条目。V50.ai 不会默认任何条目“已验证安全”，每条记录均标注来源、信任标签与安全提示。",
      integrityTitle: "数据可信原则",
      bullet1: "仅展示真实来源数据，不使用 mock。",
      bullet2: "不虚构安装量、评分、评论或人气分。",
      bullet3: "上游缺失字段按缺失展示，不编造。",
      bullet4: "排序基于元数据并清晰标注为编辑或启发式。",
      donationTitle: "请我喝杯咖啡",
      donationBody: "如果 V50.ai 对你有帮助，欢迎通过 BTC、ETH、DOGE、LTC 支持持续维护。",
      donationAddressMissing: "地址暂未配置",
      donationOpenWallet: "打开钱包",
      donationShowQr: "二维码",
      donationHideQr: "收起二维码"
    },
    author: {
      title: "作者主页",
      description: "{author} 发布的技能，以及真实 stars/downloads 数据。",
      totalSkills: "技能总数",
      totalStars: "总标星",
      totalDownloads: "总下载",
      chartTitle: "技能表现图",
      chartDesc: "基于真实 stars 和 downloads 信号的对比图。",
      skillsTitle: "发布的技能",
      subscribe: "订阅作者",
      subscribed: "已订阅",
      rss: "RSS 订阅",
      noSkills: "未找到该作者的技能。"
    },
    detail: {
      noMarkdownTitle: "无正文内容",
      noMarkdownDesc: "该来源条目仅提供元数据，未包含完整 markdown 正文。",
      sourceTransparencyTitle: "来源透明",
      sourceTransparencyDesc: "详情页由真实 SKILL.md 内容渲染。信任标签仅为元数据提示，不代表安全保证。",
      relatedTitle: "相关技能",
      relatedDesc: "基于共同标签或分类信号推荐。",
      openRegistryRecord: "打开 Registry 记录",
      openInGithub: "在 GitHub 打开",
      openInClawHub: "在 ClawHub 打开"
    },
    metadata: {
      profileUnavailable: "暂无作者信息",
      versionPrefix: "版本 {version}",
      versionNotProvided: "未提供版本",
      updatedDateUnavailable: "暂无更新时间"
    },
    safety: {
      title: "安全提示"
    },
    common: {
      viewSkill: "查看技能",
      skillNotFound: "未找到技能",
      skillNotFoundDesc: "当前实时索引中不存在该技能 slug。",
      backToSkills: "返回技能列表"
    }
  },
  ja: {
    nav: {
      storeTagline: "OpenClaw スキルストア",
      home: "ホーム",
      skills: "スキル",
      collections: "コレクション",
      about: "概要",
      language: "言語"
    },
    hero: {
      title: "出典情報と安全シグナルを備えた実在スキルを発見。",
      subtitle: "V50.ai は公開ソースから OpenClaw スキルを収集し、SKILL.md を解析して信頼性重視で表示します。",
      browseSkills: "スキルを見る",
      viewCollections: "コレクションを見る",
      liveEntries: "実データ {count} 件を読み込み済み"
    },
    skills: {
      directoryTitle: "スキル一覧",
      searchPlaceholder: "名前・タグ・作者・概要で検索",
      apply: "適用"
    },
    collections: {
      title: "コレクション",
      openCollection: "開く",
      liveSkills: "件のスキル",
      previewSuffix: "プレビュー"
    },
    detail: {
      relatedTitle: "関連スキル",
      openRegistryRecord: "レジストリを開く",
      openInClawHub: "ClawHub で開く"
    },
    metadata: {
      profileUnavailable: "プロフィール未設定",
      versionNotProvided: "バージョン未提供",
      updatedDateUnavailable: "更新日なし"
    },
    safety: {
      title: "安全上の注意"
    },
    common: {
      viewSkill: "詳細を見る"
    }
  },
  ko: {
    nav: {
      storeTagline: "OpenClaw 스킬 스토어",
      home: "홈",
      skills: "스킬",
      collections: "컬렉션",
      about: "소개",
      language: "언어"
    },
    hero: {
      title: "출처 정보와 안전 신호를 갖춘 실제 스킬을 발견하세요.",
      subtitle: "V50.ai는 공개 소스에서 OpenClaw 스킬을 수집하고 SKILL.md 메타데이터를 파싱해 신뢰 중심으로 제공합니다.",
      browseSkills: "스킬 둘러보기",
      viewCollections: "컬렉션 보기",
      liveEntries: "실제 데이터 {count}개 로드됨"
    },
    skills: {
      directoryTitle: "스킬 디렉터리",
      searchPlaceholder: "이름, 태그, 작성자, 요약으로 검색",
      apply: "적용"
    },
    collections: {
      title: "컬렉션",
      openCollection: "컬렉션 열기",
      liveSkills: "개 스킬",
      previewSuffix: "미리보기"
    },
    detail: {
      relatedTitle: "관련 스킬",
      openRegistryRecord: "레지스트리 열기",
      openInClawHub: "ClawHub에서 열기"
    },
    metadata: {
      profileUnavailable: "프로필 정보 없음",
      versionNotProvided: "버전 정보 없음",
      updatedDateUnavailable: "업데이트 날짜 없음"
    },
    safety: {
      title: "안전 안내"
    },
    common: {
      viewSkill: "스킬 보기"
    }
  },
  de: {
    nav: {
      storeTagline: "Der Skills-Store für OpenClaw",
      home: "Start",
      skills: "Skills",
      collections: "Sammlungen",
      about: "Über",
      language: "Sprache"
    },
    hero: {
      title: "Entdecke echte Skills mit Quellenkontext und Sicherheits-Signalen.",
      subtitle: "V50.ai indexiert öffentliche OpenClaw-Skills, analysiert SKILL.md-Metadaten und zeigt sie transparent an.",
      browseSkills: "Skills durchsuchen",
      viewCollections: "Sammlungen ansehen",
      liveEntries: "{count} echte Einträge geladen"
    },
    skills: {
      directoryTitle: "Skill-Verzeichnis",
      searchPlaceholder: "Nach Name, Tags, Autor oder Zusammenfassung suchen",
      apply: "Anwenden"
    },
    collections: {
      title: "Sammlungen",
      openCollection: "Sammlung öffnen",
      liveSkills: "Skills",
      previewSuffix: "Vorschau"
    },
    detail: {
      relatedTitle: "Ähnliche Skills",
      openRegistryRecord: "Registry-Eintrag öffnen",
      openInClawHub: "In ClawHub öffnen"
    },
    metadata: {
      profileUnavailable: "Profil nicht verfügbar",
      versionNotProvided: "Version nicht angegeben",
      updatedDateUnavailable: "Kein Aktualisierungsdatum"
    },
    safety: {
      title: "Sicherheitshinweis"
    },
    common: {
      viewSkill: "Skill ansehen"
    }
  },
  hi: {
    nav: {
      storeTagline: "OpenClaw के लिए Skills Store",
      home: "होम",
      skills: "स्किल्स",
      collections: "कलेक्शन्स",
      about: "परिचय",
      language: "भाषा"
    },
    hero: {
      title: "सोर्स जानकारी और सुरक्षा संकेतों के साथ वास्तविक स्किल्स खोजें।",
      subtitle: "V50.ai सार्वजनिक स्रोतों से OpenClaw स्किल्स लेकर SKILL.md मेटाडेटा पार्स करता है और भरोसेमंद तरीके से दिखाता है।",
      browseSkills: "स्किल्स देखें",
      viewCollections: "कलेक्शन्स देखें",
      liveEntries: "{count} वास्तविक एंट्रियां लोड हुईं"
    },
    skills: {
      directoryTitle: "स्किल डायरेक्टरी",
      searchPlaceholder: "नाम, टैग, लेखक या सारांश से खोजें",
      apply: "लागू करें"
    },
    collections: {
      title: "कलेक्शन्स",
      openCollection: "कलेक्शन खोलें",
      liveSkills: "लाइव स्किल्स",
      previewSuffix: "प्रीव्यू"
    },
    detail: {
      relatedTitle: "संबंधित स्किल्स",
      openRegistryRecord: "रजिस्ट्री रिकॉर्ड खोलें",
      openInClawHub: "ClawHub में खोलें"
    },
    metadata: {
      profileUnavailable: "प्रोफ़ाइल उपलब्ध नहीं",
      versionNotProvided: "वर्ज़न उपलब्ध नहीं",
      updatedDateUnavailable: "अपडेट तिथि उपलब्ध नहीं"
    },
    safety: {
      title: "सुरक्षा सूचना"
    },
    common: {
      viewSkill: "स्किल देखें"
    }
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDeep<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;

  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;

    const current = output[key];
    if (isRecord(current) && isRecord(value)) {
      output[key] = mergeDeep(current, value);
    } else {
      output[key] = value;
    }
  }

  return output as T;
}

export function resolveLocale(input?: string | null): Locale {
  if (!input) return DEFAULT_LOCALE;
  const normalized = input.toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(normalized)
    ? (normalized as Locale)
    : DEFAULT_LOCALE;
}

export function getMessages(locale: Locale): Messages {
  return mergeDeep(en, localeOverrides[locale]);
}

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function getSourceTypeLabel(sourceType: SkillSourceType, messages: Messages): string {
  if (sourceType === "archived_source") return messages.skills.archivedSource;
  if (sourceType === "registry_source") return messages.skills.registrySource;
  return messages.skills.repositorySource;
}

export function getTrustLabel(label: TrustLabel, messages: Messages): string {
  if (label === "Archived Source") return messages.skills.archivedSource;
  if (label === "Registry Source") return messages.skills.registrySource;
  if (label === "Repository Source") return messages.skills.repositorySource;
  if (label === "Recently Updated") return messages.skills.sortRecent;
  return messages.skills.needsReview;
}

export function getCategoryLabel(category: string, messages: Messages): string {
  if (category === "All") return messages.skills.categoryAll;
  if (category === "Automation") return messages.skills.categoryAutomation;
  if (category === "Coding") return messages.skills.categoryCoding;
  if (category === "General") return messages.skills.categoryGeneral;
  if (category === "Research") return messages.skills.categoryResearch;
  if (category === "Security") return messages.skills.categorySecurity;
  if (category === "Web3") return messages.skills.categoryWeb3;
  return category;
}

export const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिन्दी" }
];
