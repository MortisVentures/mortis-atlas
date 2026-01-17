import { DashboardLayout } from "@/components/layout";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
