"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSessionService } from "@/infrastructure/auth/DashboardSessionService";

const sessionService = new DashboardSessionService();

export interface LoginActionState {
  error?: string;
}

export async function loginAction(_prevState: LoginActionState | undefined, formData: FormData): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");

  let isValid = false;
  try {
    isValid = sessionService.checkPassword(password);
  } catch {
    return { error: "El servidor no tiene configurada la contraseña del dashboard." };
  }

  if (!isValid) {
    return { error: "Contraseña incorrecta." };
  }

  const token = sessionService.sign();
  const cookieStore = await cookies();
  cookieStore.set(DashboardSessionService.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}
