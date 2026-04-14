-- 奈良県版: bill_numberは定例会ごとに1号,2号,...と付番されるため
-- グローバルユニークだと別セッションの同一bill_numberが衝突する。
-- (bill_number, published_at) の複合ユニークに変更する。
-- 空文字の議案は複数存在し得るためPARTIAL INDEXのまま維持。

DROP INDEX IF EXISTS bills_bill_number_unique;

CREATE UNIQUE INDEX bills_bill_number_unique
  ON bills (bill_number, published_at)
  WHERE bill_number != '';
