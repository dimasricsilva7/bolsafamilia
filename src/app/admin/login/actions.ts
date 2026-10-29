"use server";

import { redirect } from "next/navigation";
import { authenticateAdmin, logoutAdmin } from "@/lib/admin-auth";

type LoginState = { error?: string };

export async function loginAdmin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await authenticateAdmin(email, password);
  if (!result.ok) return { error: "Não foi possível entrar. Verifique o acesso ou tente novamente mais tarde." };
  redirect("/admin");
}

export async function logoutAdminAction() {
  await logoutAdmin();
}
