import { cache } from "react";
import {
  Locale,
  brandNarrative,
  essays,
  featuredProjects,
  getLocalizedText,
  iconConcepts,
  siteNav,
  studioPrinciples
} from "@/data/noesis-brand";

export const getBrandNavigation = cache(async (locale: Locale) => {
  return siteNav.map((item) => ({
    href: item.href,
    label: getLocalizedText(item.label, locale)
  }));
});

export const getLandingContent = cache(async (locale: Locale) => {
  return {
    hero: {
      eyebrow: getLocalizedText(brandNarrative.hero.eyebrow, locale),
      title: getLocalizedText(brandNarrative.hero.title, locale),
      body: getLocalizedText(brandNarrative.hero.body, locale),
      quote: getLocalizedText(brandNarrative.hero.quote, locale)
    },
    narrativeSections: brandNarrative.sections.map((section) => ({
      eyebrow: getLocalizedText(section.eyebrow, locale),
      title: getLocalizedText(section.title, locale),
      body: getLocalizedText(section.body, locale)
    })),
    databaseTitle: getLocalizedText(brandNarrative.database.title, locale),
    databaseEyebrow: locale === "zh-Hant" ? "資料庫架構" : "Database Architecture",
    databaseBody:
      locale === "zh-Hant"
        ? "完整資料 schema 已放入 docs，方便未來再接 CMS、資料庫與多語內容層。"
        : "A fuller schema draft lives in docs so the studio can later grow into CMS-backed, multilingual content.",
    databasePoints: brandNarrative.database.points[locale],
    projects: featuredProjects.map((project) => ({
      slug: project.slug,
      href: project.href,
      status: project.status,
      title: getLocalizedText(project.title, locale),
      summary: getLocalizedText(project.summary, locale),
      tags: project.tags,
      role: getLocalizedText(project.role, locale)
    })),
    essays: essays.map((essay) => ({
      slug: essay.slug,
      category: getLocalizedText(essay.category, locale),
      title: getLocalizedText(essay.title, locale),
      summary: getLocalizedText(essay.summary, locale)
    })),
    icons: iconConcepts.map((icon) => ({
      id: icon.id,
      assetPath: icon.assetPath,
      title: getLocalizedText(icon.title, locale),
      meaning: getLocalizedText(icon.meaning, locale),
      personality: getLocalizedText(icon.personality, locale),
      recommendation: icon.recommendation
    }))
  };
});

export const getProjectsPageContent = cache(async (locale: Locale) => {
  return {
    navigation: await getBrandNavigation(locale),
    projects: featuredProjects.map((project) => ({
      slug: project.slug,
      href: project.href,
      status: project.status,
      title: getLocalizedText(project.title, locale),
      summary: getLocalizedText(project.summary, locale),
      tags: project.tags,
      role: getLocalizedText(project.role, locale)
    }))
  };
});

export const getEssaysPageContent = cache(async (locale: Locale) => {
  return {
    navigation: await getBrandNavigation(locale),
    essays: essays.map((essay) => ({
      slug: essay.slug,
      category: getLocalizedText(essay.category, locale),
      title: getLocalizedText(essay.title, locale),
      summary: getLocalizedText(essay.summary, locale)
    }))
  };
});

export const getAboutPageContent = cache(async (locale: Locale) => {
  return {
    navigation: await getBrandNavigation(locale),
    intro: {
      eyebrow: getLocalizedText(brandNarrative.aboutIntro.eyebrow, locale),
      title: getLocalizedText(brandNarrative.aboutIntro.title, locale),
      body: getLocalizedText(brandNarrative.aboutIntro.body, locale)
    },
    principles: studioPrinciples.map((principle) => ({
      title: getLocalizedText(principle.title, locale),
      body: getLocalizedText(principle.body, locale)
    })),
    lens: {
      eyebrow: locale === "zh-Hant" ? "母品牌結構" : "Parent-System Lens",
      title:
        locale === "zh-Hant"
          ? "每個作品保有自己的節奏，也共用同一套世界觀"
          : "Each project keeps its own pace while sharing one worldview",
      body:
        locale === "zh-Hant"
          ? "Noesis Studio 不是單一作品頁的殼，而是一個可以持續增長的母站。品牌敘事、作品導航與思考文章都會回到這裡，讓不同 side projects 能長在同一片土壤上。"
          : "Noesis Studio is not a shell for one product page. It is a parent site that can keep expanding, holding brand narrative, project navigation, and long-form thinking in one place."
    }
  };
});
