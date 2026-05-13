import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";
import { isValidChatModel } from "@/features/interview-config/shared/utils/chat-model-options";

export type TopicInterviewConfigRow =
  Database["public"]["Tables"]["interview_configs"]["Row"];

/**
 * topic scope で利用可能なインタビューモード。
 * - discover: 関心からの議案逆引き（従来）
 * - broad_listening: 設定テーマを丁寧に聴く傾聴モード（声プロジェクト用）
 */
export const TOPIC_INTERVIEW_MODES = ["discover", "broad_listening"] as const;
export type TopicInterviewMode = (typeof TOPIC_INTERVIEW_MODES)[number];

/**
 * トピック型インタビュー設定のバリデーションスキーマ。
 * scope_type='topic' の interview_configs レコードを作成・更新するための入力型。
 */
export const topicInterviewConfigSchema = z.object({
  name: z
    .string()
    .min(1, "設定名は必須です")
    .max(100, "設定名は100文字以内で入力してください"),
  status: z.enum(["public", "closed"]),
  mode: z.enum(TOPIC_INTERVIEW_MODES),
  topic_title: z
    .string()
    .min(1, "トピックタイトルは必須です")
    .max(200, "トピックタイトルは200文字以内で入力してください"),
  topic_description: z
    .string()
    .max(2000, "トピック説明は2000文字以内で入力してください")
    .optional(),
  themes: z.array(z.string().min(1)).optional(),
  knowledge_source: z.string().optional(),
  reference_info: z
    .string()
    .max(5000, "参考情報は5000文字以内で入力してください")
    .optional(),
  chat_model: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || isValidChatModel(val), {
      message: "無効なAIモデルが指定されています",
    }),
  estimated_duration: z
    .number()
    .int("整数で入力してください")
    .min(1, "1分以上で設定してください")
    .max(180, "180分以内で設定してください")
    .nullable()
    .optional(),
});

export type TopicInterviewConfigInput = z.infer<
  typeof topicInterviewConfigSchema
>;

export type TopicInterviewConfigResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };
