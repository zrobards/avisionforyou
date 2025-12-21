import { AIChatWidget } from "@/components/shared/AIChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <AIChatWidget />
    </>
  );
}