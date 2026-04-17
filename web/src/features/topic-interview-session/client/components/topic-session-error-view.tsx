"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

interface TopicSessionErrorViewProps {
  configId: string;
  message?: string;
}

export function TopicSessionErrorView({
  configId,
  message = "セッションの開始中に問題が発生しました。ページを再読み込みするか、トピックの紹介ページに戻ってから再度お試しください。",
}: TopicSessionErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-mirai-text">
            セッションを読み込めませんでした
          </h2>
          <p className="text-mirai-text-muted text-center max-w-sm">
            {message}
          </p>
        </div>
      </div>

      <Link href={routes.topicInterview(configId) as Route}>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-[100px] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          トピック紹介に戻る
        </Button>
      </Link>
    </div>
  );
}
