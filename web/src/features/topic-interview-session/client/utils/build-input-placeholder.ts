import type { TopicInterviewMode } from "../components/topic-chat-client";

/** UI が崩れない範囲で topicTitle を placeholder に埋め込むときの上限長 */
const TOPIC_TITLE_PLACEHOLDER_MAX_LEN = 24;

/**
 * トピック型インタビュー画面の入力欄 placeholder を組み立てる純粋関数。
 *
 * - discover モードでは従来通り「気になっていることを入力…」固定
 * - broad_listening モードでは可能なら「{topicTitle}について感じていることを入力…」
 *   とし、長すぎる場合や空の場合は汎用文言にフォールバックする
 */
export function buildInputPlaceholder(
  mode: TopicInterviewMode,
  topicTitle: string
): string {
  if (mode !== "broad_listening") return "気になっていることを入力…";

  const trimmed = topicTitle.trim();
  if (!trimmed || trimmed.length > TOPIC_TITLE_PLACEHOLDER_MAX_LEN) {
    return "このテーマについて感じていることを入力…";
  }
  return `${trimmed}について感じていることを入力…`;
}
