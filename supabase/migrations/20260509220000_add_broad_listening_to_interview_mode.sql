-- broad_listening モードを追加
-- 「奈良の声を聴くプロジェクト」用の傾聴型インタビュー（topic scope のみ想定）。
-- 既存の discover（関心からの議案逆引き）は残す。
-- bill scope では今回利用しないため、参照用に enum 値を追加するだけ。

ALTER TYPE interview_mode_enum ADD VALUE IF NOT EXISTS 'broad_listening';
