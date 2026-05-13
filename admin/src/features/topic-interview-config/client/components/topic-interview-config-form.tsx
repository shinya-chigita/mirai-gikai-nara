"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CHAT_MODEL_GROUPS } from "@/features/interview-config/shared/utils/chat-model-options";
import { routes } from "@/lib/routes";
import {
  createTopicInterviewConfig,
  updateTopicInterviewConfig,
} from "../../server/actions/upsert-topic-interview-config";
import {
  type TopicInterviewConfigInput,
  type TopicInterviewConfigRow,
  topicInterviewConfigSchema,
} from "../../shared/types";

/**
 * 既存レコードの mode 値が topic scope で許可される範囲外だった場合の
 * フォーム初期値フォールバック。現状 topic scope では discover / broad_listening のみ扱う。
 */
function normalizeFormMode(
  raw: TopicInterviewConfigRow["mode"] | null | undefined
): "discover" | "broad_listening" {
  return raw === "broad_listening" ? "broad_listening" : "discover";
}

interface TopicInterviewConfigFormProps {
  config: TopicInterviewConfigRow | null;
}

export function TopicInterviewConfigForm({
  config,
}: TopicInterviewConfigFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNew = !config;

  const form = useForm<TopicInterviewConfigInput>({
    resolver: zodResolver(topicInterviewConfigSchema),
    defaultValues: {
      name: config?.name || "新しいトピック設定",
      status: config?.status || "closed",
      mode: normalizeFormMode(config?.mode),
      topic_title: config?.topic_title || "",
      topic_description: config?.topic_description || "",
      themes: config?.themes || [],
      knowledge_source: config?.knowledge_source || "",
      reference_info: config?.reference_info || "",
      chat_model: config?.chat_model || null,
      estimated_duration: isNew ? 10 : (config?.estimated_duration ?? null),
    },
  });

  const chatModelGroups = CHAT_MODEL_GROUPS;

  const handleSubmit = async (data: TopicInterviewConfigInput) => {
    setIsSubmitting(true);
    try {
      const result = config
        ? await updateTopicInterviewConfig(config.id, data)
        : await createTopicInterviewConfig(data);

      if (result.success) {
        toast.success(isNew ? "作成しました" : "更新しました");
        if (isNew) {
          router.push(routes.topicEdit(result.data.id));
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>設定名（管理用）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="例: 県政で気になること" />
                  </FormControl>
                  <FormDescription>
                    管理画面の一覧に表示される識別名です
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>トピックタイトル（公開ページ表示用）</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例: 奈良県政で気になることを教えてください"
                    />
                  </FormControl>
                  <FormDescription>
                    ユーザーに表示されるトピックの見出しです
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>トピック説明（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="例: あなたの関心をもとに、関連する議案を AI が紹介します"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公開ステータス</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="closed">非公開</SelectItem>
                      <SelectItem value="public">公開</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="knowledge_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>知識ソース（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder="LLM の回答で参照させたい背景情報や注意事項を Markdown で記述"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    参考情報（任意・broad_listening モード向け）
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder={[
                        "ユーザーが事実情報を求めたときに AI が淡白に引用する内容を Markdown で記述。",
                        "例: 知事の主な施策、開始時期、補助金の概要、関連リンク など。",
                        "ここに書かれていない事項は AI が「この場ではお答えできません」と返す運用です。",
                      ].join("\n")}
                    />
                  </FormControl>
                  <FormDescription>
                    discover モードでは使用されません。broad_listening
                    モードでのみシステムプロンプトに差し込まれます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chat_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AIモデル（任意）</FormLabel>
                  <Select
                    value={field.value ?? "__default__"}
                    onValueChange={(v) =>
                      field.onChange(v === "__default__" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="デフォルトモデル" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__default__">
                        デフォルト（システム既定）
                      </SelectItem>
                      {chatModelGroups.flatMap((group) =>
                        group.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目安時間（分）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        field.onChange(
                          Number.isFinite(n) && e.target.value !== "" ? n : null
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>モード</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="discover">
                        discover（関心からの議案逆引き）
                      </SelectItem>
                      <SelectItem value="broad_listening">
                        broad_listening（テーマを丁寧に聴く）
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    discover: ユーザーの関心から関連議案を紹介する従来モード /
                    broad_listening:
                    設定テーマについて意見・実感・困りごとを聴く傾聴モード
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNew ? "作成" : "更新"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
