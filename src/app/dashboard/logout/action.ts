"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSessionService } from "@/infrastructure/auth/DashboardSessionService";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DashboardSessionService.cookieName);
  redirect("/dashboard/login");
}
