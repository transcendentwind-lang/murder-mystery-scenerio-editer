import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "クジラ音響解読・発信端末",
};

export default function SonarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
