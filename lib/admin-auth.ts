import { cookies } from "next/headers";

const ADMIN_COOKIE = "noesis_admin_session";

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_SECRET);
}

export function isAdminAuthenticated() {
  if (!isAdminConfigured()) {
    return false;
  }

  const current = cookies().get(ADMIN_COOKIE)?.value;
  return current === process.env.ADMIN_SECRET;
}

export function createAdminSession() {
  cookies().set(ADMIN_COOKIE, process.env.ADMIN_SECRET!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}
