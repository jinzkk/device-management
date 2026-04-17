import { z } from "zod";

export const historySchema = z.object({
  user_name: z.string().min(1, "사용자명을 입력해주세요"),
  department: z.string().optional().or(z.literal("")),
  start_date: z.string().min(1, "시작일을 입력해주세요"),
  end_date: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type HistoryFormValues = z.infer<typeof historySchema>;
