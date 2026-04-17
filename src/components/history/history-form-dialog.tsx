"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { historySchema, type HistoryFormValues } from "@/lib/validators/history";
import type { EquipmentHistory } from "@/types/equipment";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: EquipmentHistory | null;
}

export function HistoryFormDialog({
  equipmentId,
  open,
  onOpenChange,
  editItem,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!editItem;

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historySchema),
    defaultValues: {
      user_name: editItem?.user_name || "",
      department: editItem?.department || "",
      start_date: editItem?.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: editItem?.end_date || "",
      location: editItem?.location || "",
      notes: editItem?.notes || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        user_name: editItem?.user_name || "",
        department: editItem?.department || "",
        start_date: editItem?.start_date || format(new Date(), "yyyy-MM-dd"),
        end_date: editItem?.end_date || "",
        location: editItem?.location || "",
        notes: editItem?.notes || "",
      });
    }
  }, [open, editItem]);

  const onSubmit = async (values: HistoryFormValues) => {
    if (isEdit) {
      const { error } = await supabase
        .from("equipment_history")
        .update({
          user_name: values.user_name,
          department: values.department || null,
          start_date: values.start_date,
          end_date: values.end_date || null,
          location: values.location || null,
          notes: values.notes || null,
        })
        .eq("id", editItem.id);
      if (error) {
        toast.error("수정에 실패했습니다");
        return;
      }
      toast.success("이력이 수정되었습니다");
    } else {
      // assign_equipment RPC 호출 (트랜잭션)
      const { error } = await supabase.rpc("assign_equipment", {
        p_equipment_id: equipmentId,
        p_user_name: values.user_name,
        p_department: values.department || null,
        p_start_date: values.start_date,
        p_location: values.location || null,
        p_notes: values.notes || null,
      });
      if (error) {
        toast.error("등록에 실패했습니다");
        return;
      }
      toast.success("이력이 등록되었습니다");
    }
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "이력 수정" : "이력 추가"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용자명 *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>부서</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>위치</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 본사 3층 개발팀" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비고</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "저장 중..."
                  : isEdit
                    ? "수정"
                    : "등록"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
