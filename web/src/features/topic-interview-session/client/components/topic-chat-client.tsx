"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

interface InitialMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface TopicChatClientProps {
  topicConfigId: string;
  sessionId: string;
  topicTitle: string;
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
  initialMessages,
}: TopicChatClientProps) {
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
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 || status === "streaming") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const showIntro = messages.length === 0;

  return (
    <div className="fixed inset-0 top-[5.5rem] md:top-[6.5rem] flex flex-col max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showIntro && (
          <div className="rounded-2xl border border-primary-accent/30 bg-card p-5">
            <h2 className="text-base font-semibold text-mirai-text mb-1">
              {topicTitle}
            </h2>
            <p className="text-sm text-mirai-text-muted">
              あなたの関心をもとに、AI
              が関連する奈良県議会の議案を紹介します。まずは気になっていることを自由に入力してください。
            </p>
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
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-primary-accent/20 bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="気になっていることを入力…"
          disabled={isLoading}
          className="flex-1 rounded-full border border-primary-accent/30 px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
