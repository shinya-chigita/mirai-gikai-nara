import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicInterviewConfigList } from "@/features/topic-interview-config/server/components/topic-interview-config-list";
import { getAllTopicInterviewConfigs } from "@/features/topic-interview-config/server/loaders/get-topic-interview-configs";
import { routes } from "@/lib/routes";

export default async function TopicsPage() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect(routes.login());
  }

  const configs = await getAllTopicInterviewConfigs();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">トピック型インタビュー管理</h1>
      <p className="text-sm text-gray-600 mb-6">
        議案に紐付かないテーマベースのインタビュー設定を管理します。ユーザーの関心からAIが関連議案を紹介します。
      </p>

      <section className="rounded-lg border bg-white p-6">
        <TopicInterviewConfigList configs={configs} />
      </section>
    </div>
  );
}
