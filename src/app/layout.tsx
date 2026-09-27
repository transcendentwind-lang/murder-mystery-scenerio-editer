import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MM-Workbench | マーダーミステリーAI共創ワークベンチ",
  description: "非対称情報型ミステリーの設計・論理検証・HO執筆支援スタジオ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
