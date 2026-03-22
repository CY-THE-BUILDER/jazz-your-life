import Link from "next/link";
import { Locale } from "@/data/noesis-brand";

type BrandFrameProps = {
  locale: Locale;
  title: string;
  eyebrow?: string;
  description?: string;
  navigation: Array<{
    href: string;
    label: string;
  }>;
  children: React.ReactNode;
};

export function BrandFrame({ locale, title, eyebrow, description, navigation, children }: BrandFrameProps) {
  const isZh = locale === "zh-Hant";

  return (
    <main className="noesis-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="brand-header">
        <div className="noesis-topbar">
          <div>
            <Link className="brand-home-link" href="/">
              <p className="noesis-mark">NOESIS.STUDIO</p>
            </Link>
            <p className="noesis-submark">
              {isZh ? "產品、品牌與哲學思考的母站" : "A studio home for product, brand, and philosophy"}
            </p>
          </div>
          <div className="locale-chip">{isZh ? "繁中 / EN" : "EN / 繁中"}</div>
        </div>

        <nav className="brand-nav" aria-label={isZh ? "主導覽" : "Primary navigation"}>
          {navigation.map((item) => (
            <a className="brand-nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <section className="page-hero">
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {description ? <p className="page-hero-body">{description}</p> : null}
        </section>
      </header>

      {children}

      <footer className="brand-footer">
        <p>{isZh ? "Noesis Studio 為所有未來 side projects 提供品牌母語與作品入口。" : "Noesis Studio is the narrative and brand home for every future side project."}</p>
      </footer>
    </main>
  );
}
