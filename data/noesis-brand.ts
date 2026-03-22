export type Locale = "zh-Hant" | "en";

export type LocalizedText = Record<Locale, string>;

export type BrandProject = {
  slug: string;
  status: "live" | "building";
  href: string;
  title: LocalizedText;
  summary: LocalizedText;
  tags: string[];
  role: LocalizedText;
};

export type BrandIconConcept = {
  id: string;
  assetPath: string;
  title: LocalizedText;
  meaning: LocalizedText;
  personality: LocalizedText;
  recommendation?: "primary";
};

export type BrandSection = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
};

export type BrandEssay = {
  slug: string;
  href: string;
  category: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
};

export type BrandPrinciple = {
  title: LocalizedText;
  body: LocalizedText;
};

export type BrandNavItem = {
  href: string;
  label: LocalizedText;
};

export const siteNav: BrandNavItem[] = [
  {
    href: "/",
    label: {
      "zh-Hant": "首頁",
      en: "Home"
    }
  },
  {
    href: "/projects",
    label: {
      "zh-Hant": "作品",
      en: "Projects"
    }
  },
  {
    href: "/essays",
    label: {
      "zh-Hant": "文章",
      en: "Essays"
    }
  },
  {
    href: "/about",
    label: {
      "zh-Hant": "關於",
      en: "About"
    }
  }
];

export const brandNarrative = {
  siteTitle: {
    "zh-Hant": "Noesis Studio",
    en: "Noesis Studio"
  },
  siteDescription: {
    "zh-Hant": "一個容納產品、審美與哲學思辨的數位工作室。",
    en: "A digital studio for products, aesthetics, and philosophical thinking."
  },
  hero: {
    eyebrow: {
      "zh-Hant": "沉靜而清醒的數位棲居",
      en: "A calm and lucid digital dwelling"
    },
    title: {
      "zh-Hant": "為長期主義而生的側專案工作室",
      en: "A side-project studio built for long-term thinking"
    },
    body: {
      "zh-Hant":
        "Noesis Studio 將產品想像、品牌質地與工程紀律收斂成同一個空間。這裡不追逐喧嘩，而是讓每一個作品都有自己的節奏、哲學與存在理由。",
      en:
        "Noesis Studio gathers product imagination, brand restraint, and engineering discipline into one home. It does not chase noise. Each project is given its own rhythm, philosophy, and reason to exist."
    },
    quote: {
      "zh-Hant": "少一點高聲宣告，多一點可長可久的存在。",
      en: "Less proclamation, more enduring presence."
    }
  },
  sections: [
    {
      eyebrow: {
        "zh-Hant": "品牌母體",
        en: "Brand Core"
      },
      title: {
        "zh-Hant": "一個 domain，多個彼此呼應的作品",
        en: "One domain, many projects in dialogue"
      },
      body: {
        "zh-Hant":
          "未來每個 side project 都會掛在 noesis.studio 之下，以一致的品牌母語承接不同產品。母站負責敘事、收藏與導航，作品頁則保有各自的語氣與功能。",
        en:
          "Every future side project lives under noesis.studio, sharing the same brand language while keeping its own product voice. The studio site handles narrative, collection, and navigation; project pages keep their own function and tone."
      }
    },
    {
      eyebrow: {
        "zh-Hant": "視覺語彙",
        en: "Visual Language"
      },
      title: {
        "zh-Hant": "內斂、禪意、質感、留白",
        en: "Restraint, Zen, texture, and negative space"
      },
      body: {
        "zh-Hant":
          "視覺上以礦石、紙、霧、光暈與幾何秩序構成情緒。文字不是為了堆疊資訊，而是為了留下足夠的思考間隙。",
        en:
          "The visual mood is built with stone, paper, mist, halo, and geometric order. Copy is not used to crowd the page with information, but to leave enough room for contemplation."
      }
    }
  ] satisfies BrandSection[],
  database: {
    title: {
      "zh-Hant": "資料架構原則",
      en: "Database Principles"
    },
    points: {
      "zh-Hant": [
        "品牌、頁面、區塊、翻譯、媒體、專案彼此解耦，方便未來接 CMS 與多人協作。",
        "所有文案與 SEO 欄位都做成可翻譯實體，避免日後多語改版時重構。",
        "專案資料與 landing page 區塊分離，未來可以同時支援首頁、子站、文章與實驗頁。",
        "icon、色票、字體、品牌敘事可被版本化，讓品牌演進有歷史可追。"
      ],
      en: [
        "Brand, page, section, translation, media, and project are decoupled so CMS adoption and collaboration stay easy.",
        "All copy and SEO fields are modeled as translatable entities to avoid painful refactors later.",
        "Project data is separated from landing-page sections so the system can later support homepages, microsites, essays, and labs.",
        "Icons, color palettes, typography, and brand narratives can be versioned so brand evolution remains traceable."
      ]
    }
  },
  aboutIntro: {
    eyebrow: {
      "zh-Hant": "工作室信念",
      en: "Studio Belief"
    },
    title: {
      "zh-Hant": "在產品、品牌與工程之間，建立一種不喧嘩的力量",
      en: "Building a quiet kind of strength between product, brand, and engineering"
    },
    body: {
      "zh-Hant":
        "這個工作室相信，好的數位產品不只要解決問題，也應該有審美、節奏與世界觀。Noesis Studio 想做的是那些願意陪人走久一點的作品。",
      en:
        "This studio believes good digital products should not only solve problems, but also carry aesthetics, rhythm, and a worldview. Noesis Studio makes things built to stay with people a little longer."
    }
  }
};

export const featuredProjects: BrandProject[] = [
  {
    slug: "jazz-your-life",
    status: "live",
    href: "/projects/jazz-your-life",
    title: {
      "zh-Hant": "Jazz Your Life",
      en: "Jazz Your Life"
    },
    summary: {
      "zh-Hant": "給 Spotify 爵士重度使用者的每日推薦入口，幫你更快進入今天的聲音狀態。",
      en: "A daily recommendation entry point for serious Spotify jazz listeners, helping them enter the right sonic mood faster."
    },
    tags: ["Music Curation", "Spotify", "Daily Ritual"],
    role: {
      "zh-Hant": "已上線作品",
      en: "Live project"
    }
  },
  {
    slug: "decision-os",
    status: "building",
    href: "#database-architecture",
    title: {
      "zh-Hant": "Decision OS",
      en: "Decision OS"
    },
    summary: {
      "zh-Hant": "將思考框架、判斷流程與長期決策沉澱成一套清晰系統。",
      en: "A system for turning judgment, thought frameworks, and long-range decisions into a clearer operating model."
    },
    tags: ["Thinking System", "Decision Design", "Internal Tooling"],
    role: {
      "zh-Hant": "建構中的作品宇宙",
      en: "Growing product universe"
    }
  }
];

export const essays: BrandEssay[] = [
  {
    slug: "product-as-ritual",
    href: "/essays#product-as-ritual",
    category: {
      "zh-Hant": "產品哲學",
      en: "Product Philosophy"
    },
    title: {
      "zh-Hant": "把產品做成一種日常儀式，而不是一次性工具",
      en: "Building products as rituals, not one-time tools"
    },
    summary: {
      "zh-Hant": "探索什麼樣的數位體驗能被人穩定地留下，而不是只在新鮮期短暫被使用。",
      en: "An exploration of what makes a digital experience worth returning to beyond its novelty phase."
    }
  },
  {
    slug: "quiet-branding",
    href: "/essays#quiet-branding",
    category: {
      "zh-Hant": "品牌思考",
      en: "Brand Thinking"
    },
    title: {
      "zh-Hant": "安靜的品牌，如何比大聲更有辨識度",
      en: "How quiet branding can become more distinctive than loudness"
    },
    summary: {
      "zh-Hant": "從色彩、留白、語氣與節奏談品牌如何以克制建立記憶。",
      en: "A reflection on how color, negative space, tone, and rhythm can create memory through restraint."
    }
  },
  {
    slug: "systems-of-taste",
    href: "/essays#systems-of-taste",
    category: {
      "zh-Hant": "審美系統",
      en: "Aesthetic Systems"
    },
    title: {
      "zh-Hant": "品味不是直覺而已，它可以被設計成系統",
      en: "Taste is not only instinct; it can be designed as a system"
    },
    summary: {
      "zh-Hant": "討論如何把模糊的美感判斷轉譯成可累積、可協作、可演進的產品準則。",
      en: "On translating fuzzy aesthetic judgment into product principles that can accumulate, collaborate, and evolve."
    }
  }
];

export const studioPrinciples: BrandPrinciple[] = [
  {
    title: {
      "zh-Hant": "以長期主義決定短期取捨",
      en: "Let long-term thinking shape short-term tradeoffs"
    },
    body: {
      "zh-Hant": "每一個功能、文案與視覺決策都應該服務品牌累積，而不是只追求一次曝光。",
      en: "Every feature, line of copy, and visual choice should serve cumulative brand value rather than one moment of attention."
    }
  },
  {
    title: {
      "zh-Hant": "讓技術與美感共同說話",
      en: "Let craft and technology speak together"
    },
    body: {
      "zh-Hant": "工程不是品牌的後勤，而是品牌感知的一部分；順暢、節制、清楚，本身就是體驗。",
      en: "Engineering is not brand support. It is part of how the brand is felt. Smoothness, restraint, and clarity are experiences in themselves."
    }
  },
  {
    title: {
      "zh-Hant": "保留思考間隙",
      en: "Preserve room for thought"
    },
    body: {
      "zh-Hant": "內容和介面都不應把使用者逼到牆角，留白是一種尊重，也是一種成熟。",
      en: "Neither content nor interface should corner the user. Negative space is both respect and maturity."
    }
  }
];

export const iconConcepts: BrandIconConcept[] = [
  {
    id: "stillness-orbit",
    assetPath: "/brand-icons/stillness-orbit.svg",
    title: {
      "zh-Hant": "靜域",
      en: "Stillness Orbit"
    },
    meaning: {
      "zh-Hant": "以圓代表內在秩序，中央留白像意識核心，適合強調安定與深度。",
      en: "A circular field with a quiet center, emphasizing inner order, steadiness, and depth."
    },
    personality: {
      "zh-Hant": "最禪意、最內斂，適合母品牌主識別。",
      en: "The most Zen and restrained, ideal for the studio's primary mark."
    },
    recommendation: "primary"
  },
  {
    id: "threshold-gate",
    assetPath: "/brand-icons/threshold-gate.svg",
    title: {
      "zh-Hant": "界門",
      en: "Threshold Gate"
    },
    meaning: {
      "zh-Hant": "像一道被打開的門，也像思辨的入口，適合表達探索、轉化與啟程。",
      en: "A partially opened gate that suggests inquiry, transformation, and entering a new state."
    },
    personality: {
      "zh-Hant": "理性與儀式感兼具，適合產品導向品牌。",
      en: "Balanced between rational structure and ritual presence, fitting a product-led brand."
    }
  },
  {
    id: "mountain-ink",
    assetPath: "/brand-icons/mountain-ink.svg",
    title: {
      "zh-Hant": "墨山",
      en: "Ink Mountain"
    },
    meaning: {
      "zh-Hant": "以山形與墨塊感構成穩定輪廓，傳達厚度、耐心與精神性。",
      en: "Mountain-like massing with an ink-stone feel, expressing patience, gravity, and spirit."
    },
    personality: {
      "zh-Hant": "最有東方哲思氣質，適合強化文化深度。",
      en: "The most East-Asian and philosophical, great for cultural depth."
    }
  },
  {
    id: "woven-path",
    assetPath: "/brand-icons/woven-path.svg",
    title: {
      "zh-Hant": "織徑",
      en: "Woven Path"
    },
    meaning: {
      "zh-Hant": "交織線條像思路、系統與產品脈絡，代表多個 side project 的共同母體。",
      en: "Interwoven lines symbolize thought, systems, and the connective tissue between multiple side projects."
    },
    personality: {
      "zh-Hant": "系統感最強，適合未來擴張成產品宇宙。",
      en: "The most systemic, ideal if the studio grows into a broader product universe."
    }
  },
  {
    id: "horizon-seal",
    assetPath: "/brand-icons/horizon-seal.svg",
    title: {
      "zh-Hant": "境印",
      en: "Horizon Seal"
    },
    meaning: {
      "zh-Hant": "水平地平線結合印章語彙，呈現克制、完成度與長遠視野。",
      en: "A horizon line fused with a seal-like frame, conveying restraint, finish, and long-range vision."
    },
    personality: {
      "zh-Hant": "最有精品感與品牌完成度，適合公開對外識別。",
      en: "The most polished and premium, strong for outward-facing brand identity."
    }
  }
];

export function getLocalizedText(text: LocalizedText, locale: Locale) {
  return text[locale];
}

export function inferLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return "zh-Hant";
  }

  const normalized = acceptLanguage.toLowerCase();
  if (
    normalized.includes("zh-tw") ||
    normalized.includes("zh-hk") ||
    normalized.includes("zh-mo") ||
    normalized.includes("hant")
  ) {
    return "zh-Hant";
  }

  if (normalized.includes("en")) {
    return "en";
  }

  if (normalized.includes("zh")) {
    return "zh-Hant";
  }

  return "en";
}
