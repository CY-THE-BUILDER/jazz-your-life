CREATE TYPE "SiteLocale" AS ENUM ('zh_Hant', 'en');
CREATE TYPE "PageType" AS ENUM ('LANDING', 'PROJECT', 'ESSAY', 'LAB', 'ABOUT');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED');
CREATE TYPE "SectionKind" AS ENUM ('HERO', 'STATEMENT', 'PROJECT_GRID', 'ICON_SHOWCASE', 'ESSAY_LIST', 'CTA', 'CUSTOM');
CREATE TYPE "BlockKind" AS ENUM ('RICH_TEXT', 'METRIC', 'QUOTE', 'LINK', 'IMAGE', 'ICON', 'TAG_LIST', 'CUSTOM');
CREATE TYPE "AssetKind" AS ENUM ('IMAGE', 'SVG', 'VIDEO', 'AUDIO', 'DOCUMENT');

CREATE TABLE "Brand" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "defaultLocale" "SiteLocale" NOT NULL DEFAULT 'zh_Hant',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "BrandLocale" (
  "id" TEXT PRIMARY KEY,
  "brandId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "name" TEXT NOT NULL,
  "tagline" TEXT,
  "description" TEXT,
  CONSTRAINT "BrandLocale_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BrandLocale_brandId_locale_key" ON "BrandLocale"("brandId", "locale");

CREATE TABLE "Site" (
  "id" TEXT PRIMARY KEY,
  "brandId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "domain" TEXT NOT NULL UNIQUE,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Site_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Site_brandId_slug_key" ON "Site"("brandId", "slug");

CREATE TABLE "Page" (
  "id" TEXT PRIMARY KEY,
  "siteId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "pageType" "PageType" NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Page_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Page_siteId_slug_key" ON "Page"("siteId", "slug");

CREATE TABLE "PageLocale" (
  "id" TEXT PRIMARY KEY,
  "pageId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "socialTitle" TEXT,
  "socialSummary" TEXT,
  CONSTRAINT "PageLocale_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PageLocale_pageId_locale_key" ON "PageLocale"("pageId", "locale");

CREATE TABLE "Section" (
  "id" TEXT PRIMARY KEY,
  "pageId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "kind" "SectionKind" NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Section_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Section_pageId_key_key" ON "Section"("pageId", "key");
CREATE UNIQUE INDEX "Section_pageId_orderIndex_key" ON "Section"("pageId", "orderIndex");

CREATE TABLE "SectionLocale" (
  "id" TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "eyebrow" TEXT,
  "title" TEXT,
  "body" TEXT,
  CONSTRAINT "SectionLocale_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SectionLocale_sectionId_locale_key" ON "SectionLocale"("sectionId", "locale");

CREATE TABLE "Block" (
  "id" TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "kind" "BlockKind" NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  CONSTRAINT "Block_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Block_sectionId_key_key" ON "Block"("sectionId", "key");
CREATE UNIQUE INDEX "Block_sectionId_orderIndex_key" ON "Block"("sectionId", "orderIndex");

CREATE TABLE "BlockLocale" (
  "id" TEXT PRIMARY KEY,
  "blockId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "label" TEXT,
  "title" TEXT,
  "body" TEXT,
  CONSTRAINT "BlockLocale_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BlockLocale_blockId_locale_key" ON "BlockLocale"("blockId", "locale");

CREATE TABLE "Project" (
  "id" TEXT PRIMARY KEY,
  "siteId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "path" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "launchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Project_siteId_slug_key" ON "Project"("siteId", "slug");

CREATE TABLE "ProjectLocale" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "name" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT,
  "role" TEXT,
  CONSTRAINT "ProjectLocale_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProjectLocale_projectId_locale_key" ON "ProjectLocale"("projectId", "locale");

CREATE TABLE "ProjectTag" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE "ProjectTagOnProject" (
  "projectId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  PRIMARY KEY ("projectId", "tagId"),
  CONSTRAINT "ProjectTagOnProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectTagOnProject_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ProjectTag"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProjectLink" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProjectMetric" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProjectRelease" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "releaseAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  CONSTRAINT "ProjectRelease_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Asset" (
  "id" TEXT PRIMARY KEY,
  "brandId" TEXT NOT NULL,
  "kind" "AssetKind" NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "alt" TEXT,
  CONSTRAINT "Asset_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AssetVariant" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "url" TEXT NOT NULL,
  CONSTRAINT "AssetVariant_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ThemeToken" (
  "id" TEXT PRIMARY KEY,
  "brandId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "ThemeToken_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThemeToken_brandId_category_token_key" ON "ThemeToken"("brandId", "category", "token");

CREATE TABLE "ThemeTokenLocale" (
  "id" TEXT PRIMARY KEY,
  "themeTokenId" TEXT NOT NULL,
  "locale" "SiteLocale" NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "ThemeTokenLocale_themeTokenId_fkey" FOREIGN KEY ("themeTokenId") REFERENCES "ThemeToken"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThemeTokenLocale_themeTokenId_locale_key" ON "ThemeTokenLocale"("themeTokenId", "locale");

CREATE TABLE "BrandIcon" (
  "id" TEXT PRIMARY KEY,
  "brandId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "BrandIcon_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BrandIcon_brandId_slug_key" ON "BrandIcon"("brandId", "slug");

CREATE TABLE "BrandIconVersion" (
  "id" TEXT PRIMARY KEY,
  "brandIconId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "svgSource" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BrandIconVersion_brandIconId_fkey" FOREIGN KEY ("brandIconId") REFERENCES "BrandIcon"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BrandIconVersion_brandIconId_version_key" ON "BrandIconVersion"("brandIconId", "version");

CREATE TABLE "SeoMeta" (
  "id" TEXT PRIMARY KEY,
  "pageId" TEXT NOT NULL UNIQUE,
  "canonicalUrl" TEXT,
  "ogImageAssetId" TEXT,
  "robots" TEXT,
  CONSTRAINT "SeoMeta_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "NavigationItem" (
  "id" TEXT PRIMARY KEY,
  "siteId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "NavigationItem_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
