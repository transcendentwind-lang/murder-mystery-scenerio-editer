import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マッコウクジラ音響言語解析システム - MARINE MAMMAL ACOUSTIC ANALYSIS TERMINAL",
};

export default function SonarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
