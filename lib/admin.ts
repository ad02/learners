import { auth } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}
