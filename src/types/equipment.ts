export interface EquipmentType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  type_id: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  status: EquipmentStatus;
  qr_code_id: string;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentWithCurrentUser extends Equipment {
  type_name: string | null;
  current_user_name: string | null;
  current_department: string | null;
  current_location: string | null;
  current_start_date: string | null;
}

export interface EquipmentHistory {
  id: string;
  equipment_id: string;
  user_name: string;
  department: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type EquipmentStatus = "사용가능" | "사용중" | "수리중" | "폐기";

export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  "사용가능",
  "사용중",
  "수리중",
  "폐기",
];

export const STATUS_VARIANT: Record<
  EquipmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  사용가능: "default",
  사용중: "secondary",
  수리중: "outline",
  폐기: "destructive",
};
