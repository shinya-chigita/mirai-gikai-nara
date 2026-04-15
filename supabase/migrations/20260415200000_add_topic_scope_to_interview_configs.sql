-- トピック型インタビュー対応
-- 既存の議案紐付けインタビュー（bill scope）に加え、議案に紐付かないテーマベースの
-- インタビュー（topic scope）を interview_configs 1テーブルで扱えるようにする。
-- セッション・質問・レポートなど周辺テーブルはそのまま再利用する。

-- Step 1: scope 判別用の enum を新設
CREATE TYPE interview_scope_enum AS ENUM ('bill', 'topic');

-- Step 2: scope_type 列を追加（既存データは全て 'bill' として移行）
ALTER TABLE interview_configs
ADD COLUMN scope_type interview_scope_enum NOT NULL DEFAULT 'bill';

-- Step 3: topic scope 用フィールド（bill scope では NULL）
ALTER TABLE interview_configs
ADD COLUMN topic_title TEXT;

ALTER TABLE interview_configs
ADD COLUMN topic_description TEXT;

-- Step 4: bill_id を NULLABLE 化（topic scope では NULL になる）
ALTER TABLE interview_configs
ALTER COLUMN bill_id DROP NOT NULL;

-- Step 5: discover モード追加（関心からの逆引きインタビュー）
ALTER TYPE interview_mode_enum ADD VALUE IF NOT EXISTS 'discover';

-- Step 6: scope と関連フィールドの整合性を保つ制約
-- - bill scope: bill_id 必須、topic_title は NULL
-- - topic scope: topic_title 必須、bill_id は NULL
ALTER TABLE interview_configs
ADD CONSTRAINT check_interview_scope_consistency CHECK (
  (scope_type = 'bill' AND bill_id IS NOT NULL AND topic_title IS NULL)
  OR
  (scope_type = 'topic' AND bill_id IS NULL AND topic_title IS NOT NULL)
);

-- Step 7: 既存の公開 unique 索引を bill scope 限定にし直す
-- （topic scope の公開ユニーク制約は別途 topic_title 単位などで判定する場合は後続マイグレ）
DROP INDEX IF EXISTS idx_interview_configs_bill_public;

CREATE UNIQUE INDEX idx_interview_configs_bill_public
ON interview_configs(bill_id)
WHERE status = 'public' AND scope_type = 'bill';

-- Step 8: コメント更新
COMMENT ON COLUMN interview_configs.scope_type IS 'インタビューの対象種別: bill（議案紐付け）または topic（テーマベース）';
COMMENT ON COLUMN interview_configs.topic_title IS 'topic scope時のテーマタイトル（例: 県政で気になること）';
COMMENT ON COLUMN interview_configs.topic_description IS 'topic scope時のテーマ説明文';
COMMENT ON COLUMN interview_configs.bill_id IS '対象議案ID（bill scope時は必須、topic scope時はNULL）';
