import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicInterviewConfigForm } from "@/features/topic-interview-config/client/components/topic-interview-config-form";
import { routes } from "@/lib/routes";

export default async function NewTopicInterviewPage() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect(routes.login());
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={routes.topics() as Route}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          トピック一覧に戻る
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          トピック設定を新規作成
        </h1>
        <p className="text-gray-600 mt-1">
          ユーザーの関心からAIが議案を紹介するインタビュー設定を作成します
        </p>
      </div>

      <TopicInterviewConfigForm config={null} />
    </div>
  );
}
