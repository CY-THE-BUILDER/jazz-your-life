import { headers } from "next/headers";
import { NoesisLanding } from "@/components/noesis-landing";
import { inferLocaleFromHeader } from "@/data/noesis-brand";

export default async function HomePage() {
  const acceptLanguage = headers().get("accept-language");
  const locale = inferLocaleFromHeader(acceptLanguage);

  return <NoesisLanding locale={locale} />;
}
