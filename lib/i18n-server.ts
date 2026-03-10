import { cookies } from "next/headers";

import { getMessages, resolveLocale, type Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get("v50_locale")?.value);
}

export async function getRequestI18n() {
  const locale = await getRequestLocale();
  return {
    locale,
    messages: getMessages(locale)
  };
}
