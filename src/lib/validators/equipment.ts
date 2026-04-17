import { z } from "zod";

export const equipmentSchema = z.object({
  name: z.string().min(1, "장비명을 입력해주세요"),
  type_id: z.string().min(1, "유형을 선택해주세요"),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.string().optional(),
  status: z.enum(["사용가능", "사용중", "수리중", "폐기"]),
  notes: z.string().optional(),
});

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
