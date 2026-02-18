import { DashboardLayout, DashboardContent } from "@/components/layout";

export default function ICMemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
