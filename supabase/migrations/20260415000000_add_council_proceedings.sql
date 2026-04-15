-- 会議録（本会議・委員会）と発言テーブルを新設。
-- 奈良県議会の会議録を収集し、議案との紐付けや会派別発言検索を可能にする。

CREATE TABLE council_proceedings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_session_id uuid REFERENCES council_sessions(id) ON DELETE SET NULL,
  meeting_type text NOT NULL,
  meeting_date date,
  title text NOT NULL,
  source_url text,
  full_text text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_council_proceedings_session ON council_proceedings(council_session_id);
CREATE INDEX idx_council_proceedings_date ON council_proceedings(meeting_date DESC);

CREATE TABLE proceeding_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proceeding_id uuid NOT NULL REFERENCES council_proceedings(id) ON DELETE CASCADE,
  speaker_name text NOT NULL,
  faction_id uuid REFERENCES factions(id) ON DELETE SET NULL,
  role text,
  bill_id uuid REFERENCES bills(id) ON DELETE SET NULL,
  order_num integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proceeding_statements_proceeding ON proceeding_statements(proceeding_id, order_num);
CREATE INDEX idx_proceeding_statements_faction ON proceeding_statements(faction_id);
CREATE INDEX idx_proceeding_statements_bill ON proceeding_statements(bill_id);

ALTER TABLE council_proceedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proceeding_statements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_council_proceedings_updated_at
  BEFORE UPDATE ON council_proceedings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
