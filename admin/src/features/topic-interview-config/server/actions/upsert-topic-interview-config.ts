"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { createAdminClient } from "@mirai-gikai/supabase";
import { routes } from "@/lib/routes";
import {
  type TopicInterviewConfigInput,
  type TopicInterviewConfigResult,
  topicInterviewConfigSchema,
} from "../../shared/types";

/** 空文字/空白のみは null に寄せる（DB に意味のない空文字を残さない） */
function emptyToNull(v: string | undefined | null): string | null {
  const trimmed = v?.trim();
  return trimmed ? trimmed : null;
}

/** zod バリデーション失敗時の最初のメッセージを取り出す（toast 表示用） */
function firstZodError(
  result: ReturnType<typeof topicInterviewConfigSchema.safeParse>
): string {
  if (result.success) return "validation passed";
  return result.error.issues[0]?.message ?? "入力内容を確認してください";
}

/** トピック型インタビュー設定を新規作成する */
export async function createTopicInterviewConfig(
  input: TopicInterviewConfigInput
): Promise<TopicInterviewConfigResult> {
  try {
    await requireAdmin();

    const parsed = topicInterviewConfigSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed) };
    }
    const validated = parsed.data;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("interview_configs")
      .insert({
        scope_type: "topic",
        bill_id: null,
        name: validated.name,
        status: validated.status,
        mode: "discover",
        topic_title: validated.topic_title,
        topic_description: emptyToNull(validated.topic_description),
        themes:
          validated.themes && validated.themes.length > 0
            ? validated.themes
            : null,
        knowledge_source: emptyToNull(validated.knowledge_source),
        chat_model: validated.chat_model ?? null,
        estimated_duration: validated.estimated_duration ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: `トピック設定の作成に失敗しました: ${error.message}`,
      };
    }

    revalidatePath(routes.topics());
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "unknown error occurred",
    };
  }
}

/** トピック型インタビュー設定を更新する */
export async function updateTopicInterviewConfig(
  configId: string,
  input: TopicInterviewConfigInput
): Promise<TopicInterviewConfigResult> {
  try {
    await requireAdmin();

    const parsed = topicInterviewConfigSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: firstZodError(parsed) };
    }
    const validated = parsed.data;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("interview_configs")
      .update({
        name: validated.name,
        status: validated.status,
        topic_title: validated.topic_title,
        topic_description: emptyToNull(validated.topic_description),
        themes:
          validated.themes && validated.themes.length > 0
            ? validated.themes
            : null,
        knowledge_source: emptyToNull(validated.knowledge_source),
        chat_model: validated.chat_model ?? null,
        estimated_duration: validated.estimated_duration ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configId)
      .eq("scope_type", "topic");

    if (error) {
      return {
        success: false,
        error: `トピック設定の更新に失敗しました: ${error.message}`,
      };
    }

    revalidatePath(routes.topics());
    revalidatePath(routes.topicEdit(configId));
    return { success: true, data: { id: configId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "unknown error occurred",
    };
  }
}
