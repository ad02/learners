import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
