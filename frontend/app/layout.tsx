import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SHUTTER — AI Intelligence",
  description: "Consumer and enterprise AI products powered by AMIX intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
