import { DashboardLayout, DashboardContent } from "@/components/layout";

export default function DocumentsLayout({
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
