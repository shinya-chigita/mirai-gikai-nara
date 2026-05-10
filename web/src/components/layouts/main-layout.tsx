"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { isInterviewSection, isMainPage } from "@/lib/page-layout-utils";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const useSidebarLayout = isMainPage(pathname) && siteConfig.features.aiChat;
  const isInterview = isInterviewSection(pathname);

  return (
    <div
      className={cn(
        // モバイルでも固定ヘッダー (top-4 + h-16 = 5rem) と本文が被らないよう mt-28 で逃がす。
        // md 以上は従来通り。
        "relative max-w-[700px] mx-auto mt-28 md:mt-24",
        // インタビューページ以外ではshadowを表示
        !isInterview && "sm:shadow-lg",
        // TOPページと法案詳細ページのみ、チャットサイドバー用のオフセット
        useSidebarLayout && "pc:mr-[500px] xl:ml-[calc(calc(100vw-1180px)/2)]"
      )}
    >
      {children}
    </div>
  );
}
