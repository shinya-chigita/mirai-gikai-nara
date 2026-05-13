-- トピック型インタビュー用「参考情報」フィールドを追加
-- 用途: ユーザーが事実情報を求めたとき、AI が淡白に引用するための事前設定テキスト
-- 例: 知事の主な施策、開始時期、補助金の概要 など
-- 形式: Markdown 自由記述（任意）

ALTER TABLE interview_configs
ADD COLUMN reference_info TEXT;

COMMENT ON COLUMN interview_configs.reference_info IS
  'トピック型インタビューで、ユーザーから明示的に事実情報を求められた際に AI が短く引用するための参考情報。Markdown 自由記述（任意）。bill scope では使用しない。';
