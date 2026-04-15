import "server-only";
import { ExternalLink } from "lucide-react";
import type { BillStatement } from "../../loaders/get-statements-by-bill-id";

interface Props {
  statements: BillStatement[];
}

const MAX_PREVIEW_CHARS = 400;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function truncate(text: string): { preview: string; truncated: boolean } {
  const cleaned = text
    .replace(/^[○◎◆△▲▼＊]/, "")
    .replace(/^(?:議長|副議長|知事|[^（]+)（[^）]+）\s*/, "")
    .trim();
  if (cleaned.length <= MAX_PREVIEW_CHARS) {
    return { preview: cleaned, truncated: false };
  }
  return {
    preview: `${cleaned.slice(0, MAX_PREVIEW_CHARS)}…`,
    truncated: true,
  };
}

export function BillProceedingStatements({ statements }: Props) {
  if (statements.length === 0) return null;

  return (
    <section
      aria-labelledby="proceeding-statements-heading"
      className="rounded-2xl border border-primary-accent/30 bg-card p-6"
    >
      <h2
        id="proceeding-statements-heading"
        className="text-lg font-semibold text-mirai-text mb-2"
      >
        議会での主な発言
      </h2>
      <p className="text-sm text-mirai-text-muted mb-4">
        奈良県議会の会議録から、この議案に関する発言を抜粋しています。
      </p>
      <ul className="space-y-4">
        {statements.map((s) => {
          const { preview, truncated } = truncate(s.text);
          return (
            <li
              key={s.id}
              className="border-l-4 border-primary-accent/40 pl-4 py-2"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <span className="font-semibold text-mirai-text">
                  {s.speaker_name}
                </span>
                {s.role && (
                  <span className="text-sm text-mirai-text-muted">
                    {s.role}
                  </span>
                )}
                {s.meeting_date && (
                  <span className="text-xs text-mirai-text-muted">
                    {formatDate(s.meeting_date)}
                  </span>
                )}
              </div>
              <p className="text-sm text-mirai-text whitespace-pre-wrap leading-relaxed">
                {preview}
              </p>
              {(truncated || s.source_url) && s.source_url && (
                <a
                  href={s.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                >
                  公式会議録で全文を読む
                  <ExternalLink className="w-3 h-3" aria-hidden />
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-mirai-text-muted mt-6 pt-4 border-t border-primary-accent/20">
        出典: 奈良県議会 会議録検索システム（公的記録）
      </p>
    </section>
  );
}
