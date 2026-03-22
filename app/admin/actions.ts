"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isAdminConfigured, isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrismaClient } from "@/lib/prisma";

function requireAdmin() {
  if (!isAdminAuthenticated()) {
    throw new Error("Unauthorized");
  }
}

export async function adminLoginAction(formData: FormData) {
  if (!isAdminConfigured()) {
    throw new Error("ADMIN_SECRET is not configured");
  }

  const password = String(formData.get("password") ?? "");
  if (password !== process.env.ADMIN_SECRET) {
    redirect("/admin?error=invalid-password");
  }

  createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  clearAdminSession();
  redirect("/admin");
}

export async function updateSectionLocaleAction(formData: FormData) {
  requireAdmin();

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }

  const sectionId = String(formData.get("sectionId") ?? "");
  const locale = String(formData.get("locale") ?? "");
  const eyebrow = String(formData.get("eyebrow") ?? "");
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const revalidateTarget = String(formData.get("revalidateTarget") ?? "/");

  await prisma.sectionLocale.upsert({
    where: {
      sectionId_locale: {
        sectionId,
        locale: locale as "zh_Hant" | "en"
      }
    },
    update: {
      eyebrow: eyebrow || null,
      title: title || null,
      body: body || null
    },
    create: {
      sectionId,
      locale: locale as "zh_Hant" | "en",
      eyebrow: eyebrow || null,
      title: title || null,
      body: body || null
    }
  });

  revalidatePath(revalidateTarget);
  revalidatePath("/admin");
}

export async function updateProjectAction(formData: FormData) {
  requireAdmin();

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const locale = String(formData.get("locale") ?? "");
  const name = String(formData.get("name") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const role = String(formData.get("role") ?? "");
  const path = String(formData.get("path") ?? "");
  const status = String(formData.get("status") ?? "DRAFT");
  const tags = String(formData.get("tags") ?? "");

  await prisma.project.update({
    where: { id: projectId },
    data: {
      path,
      status: status as "DRAFT" | "LIVE" | "ARCHIVED"
    }
  });

  await prisma.projectLocale.upsert({
    where: {
      projectId_locale: {
        projectId,
        locale: locale as "zh_Hant" | "en"
      }
    },
    update: {
      name,
      summary,
      role
    },
    create: {
      projectId,
      locale: locale as "zh_Hant" | "en",
      name,
      summary,
      role
    }
  });

  const normalizedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await prisma.projectTagOnProject.deleteMany({
    where: {
      projectId
    }
  });

  for (const slug of normalizedTags) {
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

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
}

export async function updateNavigationAction(formData: FormData) {
  requireAdmin();

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }

  const navigationId = String(formData.get("navigationId") ?? "");
  const label = String(formData.get("label") ?? "");
  const href = String(formData.get("href") ?? "");

  await prisma.navigationItem.update({
    where: { id: navigationId },
    data: {
      label,
      href
    }
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/essays");
  revalidatePath("/about");
  revalidatePath("/admin");
}
