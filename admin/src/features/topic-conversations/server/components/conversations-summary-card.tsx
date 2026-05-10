import "server-only";
import { Card, CardContent } from "@/components/ui/card";
import type { TopicConversationsSummary } from "../loaders/get-topic-conversations-summary";

interface Props {
  summary: TopicConversationsSummary;
}

export function ConversationsSummaryCard({ summary }: Props) {
  const items: Array<{ label: string; value: number; emphasis?: boolean }> = [
    { label: "セッション総数", value: summary.totalSessions, emphasis: true },
    { label: "ユーザー発言あり", value: summary.withUserMessages },
    { label: "ユーザー発言なし", value: summary.withoutUserMessages },
    { label: "完了セッション", value: summary.completedSessions },
    { label: "進行中セッション", value: summary.inProgressSessions },
    { label: "総メッセージ数", value: summary.totalMessages, emphasis: true },
    { label: "ユーザーメッセージ", value: summary.userMessages },
    { label: "AIメッセージ", value: summary.assistantMessages },
  ];

  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="text-xs text-gray-600">{item.label}</div>
              <div
                className={
                  item.emphasis
                    ? "text-2xl font-semibold text-gray-900 mt-0.5"
                    : "text-lg font-medium text-gray-800 mt-0.5"
                }
              >
                {item.value.toLocaleString("ja-JP")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
