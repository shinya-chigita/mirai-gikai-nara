"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Check, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { completeTopicSession } from "../../server/actions/complete-topic-session";
import { buildInputPlaceholder } from "../utils/build-input-placeholder";

interface InitialMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export type TopicInterviewMode = "discover" | "broad_listening";

interface TopicChatClientProps {
  topicConfigId: string;
  /**
   * 既存のアクティブセッションがあればその id、なければ null。
   * null の場合は初回ユーザーメッセージが届いた時点でサーバ側が遅延作成する。
   */
  sessionId: string | null;
  topicTitle: string;
  /**
   * config.mode をそのまま受け取る。
   * UI 出し分け（イントロ・placeholder）と将来的な動線分岐に使う。
   * 想定外の値が来た場合は discover にフォールバックする。
   */
  mode: TopicInterviewMode;
  initialMessages: InitialMessage[];
}

function renderWithBillLinks(text: string): React.ReactNode {
  const regex = /\[議案ID:([a-zA-Z0-9-]+)\]/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) nodes.push(before);
    const billId = match[1];
    nodes.push(
      <Link
        key={`bill-${match.index}`}
        href={routes.billDetail(billId)}
        className="text-primary underline hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        議案詳細を見る
      </Link>
    );
    lastIndex = match.index + match[0].length;
    match = regex.exec(text);
  }
  const tail = text.slice(lastIndex);
  if (tail) nodes.push(tail);
  return nodes;
}

export function TopicChatClient({
  topicConfigId,
  sessionId,
  topicTitle,
  mode,
  initialMessages,
}: TopicChatClientProps) {
  const router = useRouter();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/topic-interview/chat",
        body: { topicConfigId, sessionId },
      }),
    [topicConfigId, sessionId]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text" as const, text: m.content }],
    })),
  });

  const [input, setInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isCompleting, startCompleteTransition] = useTransition();
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 || status === "streaming") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const handleComplete = () => {
    if (isCompleting || isLoading) return;
    setCompleteError(null);
    startCompleteTransition(async () => {
      const result = await completeTopicSession(topicConfigId);
      if (result.success) {
        setIsCompleted(true);
        // 完了表示を見せた後 1.5 秒でトピックLPに戻す
        setTimeout(
          () => router.push(routes.topicInterview(topicConfigId)),
          1500
        );
      } else {
        setCompleteError(result.error);
      }
    });
  };

  // 「終わる」ボタンは1メッセージ以上やり取りがあった段階で有効化
  const canComplete = messages.length > 0 && !isCompleted && !isLoading;

  const showIntro = messages.length === 0;
  const isBroadListening = mode === "broad_listening";
  const placeholder = buildInputPlaceholder(mode, topicTitle);

  return (
    <div className="fixed inset-0 top-[5.5rem] md:top-[6.5rem] flex flex-col max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showIntro && (
          <div className="rounded-2xl border border-primary-accent/30 bg-card p-5">
            <h2 className="text-base font-semibold text-mirai-text mb-1">
              {topicTitle}
            </h2>
            {isBroadListening ? (
              <p className="text-sm text-mirai-text-muted whitespace-pre-line">
                {[
                  "このテーマについて、感じていることを自由に入力してください。",
                  "AIが質問しながら、あなたの意見や暮らしの実感を整理します。",
                  "個人名・住所・学校名・勤務先・病院名などは書かないでください。",
                ].join("\n")}
              </p>
            ) : (
              <p className="text-sm text-mirai-text-muted">
                あなたの関心をもとに、AI
                が関連する奈良県議会の議案を紹介します。まずは気になっていることを自由に入力してください。
              </p>
            )}
          </div>
        )}
        {messages.map((message) => {
          const text = message.parts
            .filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            )
            .map((p) => p.text)
            .join("");
          return (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "rounded-2xl bg-primary text-primary-foreground px-4 py-3 max-w-[85%] whitespace-pre-wrap text-sm"
                    : "rounded-2xl bg-card border border-primary-accent/30 px-4 py-3 max-w-[85%] whitespace-pre-wrap text-sm"
                }
              >
                {renderWithBillLinks(text)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="text-sm text-mirai-text-muted">考え中…</div>
        )}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary-accent/30 bg-card p-4 text-sm text-mirai-text">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            会話を終了しました。ありがとうございました。
          </div>
        )}
        {completeError && !isCompleted && (
          <div className="text-xs text-destructive">
            終了処理に失敗しました: {completeError}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-primary-accent/20 bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || isCompleted}
            className="flex-1 rounded-full border border-primary-accent/30 px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isCompleted || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            disabled={!canComplete || isCompleting}
            className="text-xs text-mirai-text-muted"
          >
            {isCompleting ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            会話を終える
          </Button>
        </div>
      </form>
    </div>
  );
}
