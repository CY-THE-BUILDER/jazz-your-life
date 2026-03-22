import dotenv from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: "noesis-studio" },
    update: {},
    create: {
      slug: "noesis-studio",
      defaultLocale: "zh_Hant"
    }
  });

  await prisma.brandLocale.upsert({
    where: {
      brandId_locale: {
        brandId: brand.id,
        locale: "zh_Hant"
      }
    },
    update: {
      name: "Noesis Studio",
      tagline: "產品、品牌與哲學思考的母站",
      description: "一個容納產品、審美與哲學思辨的數位工作室。"
    },
    create: {
      brandId: brand.id,
      locale: "zh_Hant",
      name: "Noesis Studio",
      tagline: "產品、品牌與哲學思考的母站",
      description: "一個容納產品、審美與哲學思辨的數位工作室。"
    }
  });

  await prisma.brandLocale.upsert({
    where: {
      brandId_locale: {
        brandId: brand.id,
        locale: "en"
      }
    },
    update: {
      name: "Noesis Studio",
      tagline: "A studio home for product, brand, and philosophy",
      description: "A digital studio for products, aesthetics, and philosophical thinking."
    },
    create: {
      brandId: brand.id,
      locale: "en",
      name: "Noesis Studio",
      tagline: "A studio home for product, brand, and philosophy",
      description: "A digital studio for products, aesthetics, and philosophical thinking."
    }
  });

  const site = await prisma.site.upsert({
    where: { domain: "www.noesis.studio" },
    update: {
      slug: "primary",
      isPrimary: true
    },
    create: {
      brandId: brand.id,
      slug: "primary",
      domain: "www.noesis.studio",
      isPrimary: true
    }
  });

  await prisma.navigationItem.deleteMany({
    where: { siteId: site.id }
  });

  await prisma.navigationItem.createMany({
    data: [
      { siteId: site.id, label: "Home", href: "/", orderIndex: 0 },
      { siteId: site.id, label: "Projects", href: "/projects", orderIndex: 1 },
      { siteId: site.id, label: "Essays", href: "/essays", orderIndex: 2 },
      { siteId: site.id, label: "About", href: "/about", orderIndex: 3 }
    ]
  });

  const homePage = await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "home"
      }
    },
    update: {
      pageType: "LANDING",
      isPublished: true
    },
    create: {
      siteId: site.id,
      slug: "home",
      pageType: "LANDING",
      isPublished: true
    }
  });

  const aboutPage = await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "about"
      }
    },
    update: {
      pageType: "ABOUT",
      isPublished: true
    },
    create: {
      siteId: site.id,
      slug: "about",
      pageType: "ABOUT",
      isPublished: true
    }
  });

  const essaysPage = await prisma.page.upsert({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "essays"
      }
    },
    update: {
      pageType: "ESSAY",
      isPublished: true
    },
    create: {
      siteId: site.id,
      slug: "essays",
      pageType: "ESSAY",
      isPublished: true
    }
  });

  await upsertPageLocale(homePage.id, "zh_Hant", "Noesis Studio", "為長期主義而生的側專案工作室");
  await upsertPageLocale(homePage.id, "en", "Noesis Studio", "A side-project studio built for long-term thinking");
  await upsertPageLocale(aboutPage.id, "zh_Hant", "About | Noesis Studio", "在產品、品牌與工程之間，建立一種不喧嘩的力量");
  await upsertPageLocale(aboutPage.id, "en", "About | Noesis Studio", "Building a quiet kind of strength between product, brand, and engineering");
  await upsertPageLocale(essaysPage.id, "zh_Hant", "Essays | Noesis Studio", "品牌、產品、審美與決策的長篇筆記");
  await upsertPageLocale(essaysPage.id, "en", "Essays | Noesis Studio", "Long-form notes on brand, product, aesthetics, and decisions");

  await upsertSection(homePage.id, 0, "hero", "HERO", {
    zh_Hant: ["沉靜而清醒的數位棲居", "為長期主義而生的側專案工作室", "Noesis Studio 將產品想像、品牌質地與工程紀律收斂成同一個空間。這裡不追逐喧嘩，而是讓每一個作品都有自己的節奏、哲學與存在理由。"],
    en: ["A calm and lucid digital dwelling", "A side-project studio built for long-term thinking", "Noesis Studio gathers product imagination, brand restraint, and engineering discipline into one home. It does not chase noise. Each project is given its own rhythm, philosophy, and reason to exist."]
  });
  await upsertSection(homePage.id, 1, "brand_core", "STATEMENT", {
    zh_Hant: ["品牌母體", "一個 domain，多個彼此呼應的作品", "未來每個 side project 都會掛在 noesis.studio 之下，以一致的品牌母語承接不同產品。母站負責敘事、收藏與導航，作品頁則保有各自的語氣與功能。"],
    en: ["Brand Core", "One domain, many projects in dialogue", "Every future side project lives under noesis.studio, sharing the same brand language while keeping its own product voice. The studio site handles narrative, collection, and navigation; project pages keep their own function and tone."]
  });
  await upsertSection(homePage.id, 2, "visual_language", "STATEMENT", {
    zh_Hant: ["視覺語彙", "內斂、禪意、質感、留白", "視覺上以礦石、紙、霧、光暈與幾何秩序構成情緒。文字不是為了堆疊資訊，而是為了留下足夠的思考間隙。"],
    en: ["Visual Language", "Restraint, Zen, texture, and negative space", "The visual mood is built with stone, paper, mist, halo, and geometric order. Copy is not used to crowd the page with information, but to leave enough room for contemplation."]
  });
  await upsertSection(homePage.id, 3, "database_architecture", "STATEMENT", {
    zh_Hant: ["資料庫架構", "資料架構原則", "完整資料 schema 已放入 docs，方便你後續接 Prisma、Postgres、Supabase 或任何 headless CMS。"],
    en: ["Database Architecture", "Database Principles", "A complete schema draft is included in docs so you can later plug this into Prisma, Postgres, Supabase, or any headless CMS."]
  });

  await upsertSection(aboutPage.id, 0, "about_intro", "STATEMENT", {
    zh_Hant: ["工作室信念", "在產品、品牌與工程之間，建立一種不喧嘩的力量", "這個工作室相信，好的數位產品不只要解決問題，也應該有審美、節奏與世界觀。Noesis Studio 想做的是那些願意陪人走久一點的作品。"],
    en: ["Studio Belief", "Building a quiet kind of strength between product, brand, and engineering", "This studio believes good digital products should not only solve problems, but also carry aesthetics, rhythm, and a worldview. Noesis Studio makes things built to stay with people a little longer."]
  });
  await upsertSection(aboutPage.id, 1, "principle_1", "STATEMENT", {
    zh_Hant: [null, "以長期主義決定短期取捨", "每一個功能、文案與視覺決策都應該服務品牌累積，而不是只追求一次曝光。"],
    en: [null, "Let long-term thinking shape short-term tradeoffs", "Every feature, line of copy, and visual choice should serve cumulative brand value rather than one moment of attention."]
  });
  await upsertSection(aboutPage.id, 2, "principle_2", "STATEMENT", {
    zh_Hant: [null, "讓技術與美感共同說話", "工程不是品牌的後勤，而是品牌感知的一部分；順暢、節制、清楚，本身就是體驗。"],
    en: [null, "Let craft and technology speak together", "Engineering is not brand support. It is part of how the brand is felt. Smoothness, restraint, and clarity are experiences in themselves."]
  });
  await upsertSection(aboutPage.id, 3, "principle_3", "STATEMENT", {
    zh_Hant: [null, "保留思考間隙", "內容和介面都不應把使用者逼到牆角，留白是一種尊重，也是一種成熟。"],
    en: [null, "Preserve room for thought", "Neither content nor interface should corner the user. Negative space is both respect and maturity."]
  });
  await upsertSection(aboutPage.id, 4, "studio_lens", "STATEMENT", {
    zh_Hant: ["角色視角", "品牌、產品、工程同時在線", "這個工作室不是把品牌包裝外包給設計，再把產品丟給工程，而是把敘事、功能、技術選型與細節體驗一起思考。"],
    en: ["Studio Lens", "Brand, product, and engineering in one continuous practice", "This studio does not separate branding, product, and engineering into disconnected phases. Narrative, utility, implementation, and sensory detail are designed together."]
  });

  await upsertSection(essaysPage.id, 0, "essay_1", "STATEMENT", {
    zh_Hant: ["產品哲學", "把產品做成一種日常儀式，而不是一次性工具", "探索什麼樣的數位體驗能被人穩定地留下，而不是只在新鮮期短暫被使用。"],
    en: ["Product Philosophy", "Building products as rituals, not one-time tools", "An exploration of what makes a digital experience worth returning to beyond its novelty phase."]
  });
  await upsertSection(essaysPage.id, 1, "essay_2", "STATEMENT", {
    zh_Hant: ["品牌思考", "安靜的品牌，如何比大聲更有辨識度", "從色彩、留白、語氣與節奏談品牌如何以克制建立記憶。"],
    en: ["Brand Thinking", "How quiet branding can become more distinctive than loudness", "A reflection on how color, negative space, tone, and rhythm can create memory through restraint."]
  });
  await upsertSection(essaysPage.id, 2, "essay_3", "STATEMENT", {
    zh_Hant: ["審美系統", "品味不是直覺而已，它可以被設計成系統", "討論如何把模糊的美感判斷轉譯成可累積、可協作、可演進的產品準則。"],
    en: ["Aesthetic Systems", "Taste is not only instinct; it can be designed as a system", "On translating fuzzy aesthetic judgment into product principles that can accumulate, collaborate, and evolve."]
  });

  const jazz = await prisma.project.upsert({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "jazz-your-life"
      }
    },
    update: {
      status: "LIVE",
      path: "/projects/jazz-your-life",
      sortOrder: 0
    },
    create: {
      siteId: site.id,
      slug: "jazz-your-life",
      status: "LIVE",
      path: "/projects/jazz-your-life",
      sortOrder: 0
    }
  });

  const decisionOs = await prisma.project.upsert({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: "decision-os"
      }
    },
    update: {
      status: "DRAFT",
      path: "/projects/decision-os",
      sortOrder: 1
    },
    create: {
      siteId: site.id,
      slug: "decision-os",
      status: "DRAFT",
      path: "/projects/decision-os",
      sortOrder: 1
    }
  });

  await upsertProjectLocale(jazz.id, "zh_Hant", "Jazz Your Life", "給 Spotify 爵士重度使用者的每日推薦入口，幫你更快進入今天的聲音狀態。", "已上線作品");
  await upsertProjectLocale(jazz.id, "en", "Jazz Your Life", "A daily recommendation entry point for serious Spotify jazz listeners, helping them enter the right sonic mood faster.", "Live project");
  await upsertProjectLocale(decisionOs.id, "zh_Hant", "Decision OS", "將思考框架、判斷流程與長期決策沉澱成一套清晰系統。", "建構中的作品宇宙");
  await upsertProjectLocale(decisionOs.id, "en", "Decision OS", "A system for turning judgment, thought frameworks, and long-range decisions into a clearer operating model.", "Growing product universe");

  await syncProjectTags(jazz.id, ["music-curation", "spotify", "daily-ritual"]);
  await syncProjectTags(decisionOs.id, ["thinking-system", "decision-design", "internal-tooling"]);

  console.log("Noesis seed completed.");
}

async function upsertPageLocale(pageId, locale, title, description) {
  return prisma.pageLocale.upsert({
    where: {
      pageId_locale: {
        pageId,
        locale
      }
    },
    update: {
      title,
      description
    },
    create: {
      pageId,
      locale,
      title,
      description
    }
  });
}

async function upsertSection(pageId, orderIndex, key, kind, localizedValues) {
  const section = await prisma.section.upsert({
    where: {
      pageId_key: {
        pageId,
        key
      }
    },
    update: {
      kind,
      orderIndex
    },
    create: {
      pageId,
      key,
      kind,
      orderIndex
    }
  });

  for (const [locale, values] of Object.entries(localizedValues)) {
    const [eyebrow, title, body] = values;
    await prisma.sectionLocale.upsert({
      where: {
        sectionId_locale: {
          sectionId: section.id,
          locale
        }
      },
      update: {
        eyebrow,
        title,
        body
      },
      create: {
        sectionId: section.id,
        locale,
        eyebrow,
        title,
        body
      }
    });
  }
}

async function upsertProjectLocale(projectId, locale, name, summary, role) {
  return prisma.projectLocale.upsert({
    where: {
      projectId_locale: {
        projectId,
        locale
      }
    },
    update: {
      name,
      summary,
      role
    },
    create: {
      projectId,
      locale,
      name,
      summary,
      role
    }
  });
}

async function syncProjectTags(projectId, tagSlugs) {
  await prisma.projectTagOnProject.deleteMany({
    where: {
      projectId
    }
  });

  for (const slug of tagSlugs) {
    const tag = await prisma.projectTag.upsert({
      where: { slug },
      update: {},
      create: { slug }
    });

    await prisma.projectTagOnProject.create({
      data: {
        projectId,
        tagId: tag.id
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
