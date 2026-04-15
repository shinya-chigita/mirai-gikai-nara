import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/auth/server/lib/auth-server";
import { TopicInterviewConfigForm } from "@/features/topic-interview-config/client/components/topic-interview-config-form";
import { getTopicInterviewConfigById } from "@/features/topic-interview-config/server/loaders/get-topic-interview-configs";
import { routes } from "@/lib/routes";

interface Props {
  params: Promise<{ configId: string }>;
}

export default async function EditTopicInterviewPage({ params }: Props) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect(routes.login());
  }

  const { configId } = await params;
  const config = await getTopicInterviewConfigById(configId);
  if (!config) {
    notFound();
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
        <h1 className="text-2xl font-bold text-gray-900">トピック設定を編集</h1>
        <p className="text-gray-600 mt-1">{config.name}</p>
      </div>

      <TopicInterviewConfigForm config={config} />
    </div>
  );
}
