import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
