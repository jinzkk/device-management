-- 장비 유형 테이블
CREATE TABLE equipment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 기본 장비 유형 삽입
INSERT INTO equipment_types (name) VALUES
  ('노트북'), ('데스크탑'), ('모니터'), ('키보드'), ('마우스'), ('프린터'), ('서버'), ('기타');

-- 장비 테이블
CREATE TABLE equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type_id UUID REFERENCES equipment_types(id),
  serial_number TEXT UNIQUE,
  model TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  purchase_price INTEGER,
  status TEXT NOT NULL DEFAULT '사용가능',
  qr_code_id TEXT UNIQUE NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type_id);
CREATE INDEX idx_equipment_qr ON equipment(qr_code_id);

-- 장비 이력 테이블
CREATE TABLE equipment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  department TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_history_equipment ON equipment_history(equipment_id);
CREATE INDEX idx_history_current ON equipment_history(equipment_id) WHERE end_date IS NULL;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_history BEFORE UPDATE ON equipment_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 장비 + 현재 사용자 정보 뷰
CREATE VIEW equipment_with_current_user AS
SELECT
  e.*,
  et.name AS type_name,
  h.user_name AS current_user_name,
  h.department AS current_department,
  h.location AS current_location,
  h.start_date AS current_start_date
FROM equipment e
LEFT JOIN equipment_types et ON e.type_id = et.id
LEFT JOIN equipment_history h ON h.equipment_id = e.id AND h.end_date IS NULL;

-- 장비 배정 트랜잭션 함수
CREATE OR REPLACE FUNCTION assign_equipment(
  p_equipment_id UUID,
  p_user_name TEXT,
  p_department TEXT,
  p_start_date DATE,
  p_location TEXT,
  p_notes TEXT
) RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  UPDATE equipment_history
  SET end_date = p_start_date, updated_at = now()
  WHERE equipment_id = p_equipment_id AND end_date IS NULL;

  INSERT INTO equipment_history (equipment_id, user_name, department, start_date, location, notes)
  VALUES (p_equipment_id, p_user_name, p_department, p_start_date, p_location, p_notes)
  RETURNING id INTO v_history_id;

  UPDATE equipment SET status = '사용중' WHERE id = p_equipment_id;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- RLS 정책 (인증된 사용자 전체 접근)
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON equipment
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON equipment_history
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON equipment_types
  FOR ALL USING (auth.role() = 'authenticated');
