"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  equipmentSchema,
  type EquipmentFormValues,
} from "@/lib/validators/equipment";
import { EQUIPMENT_STATUSES } from "@/types/equipment";
import type { Equipment, EquipmentType } from "@/types/equipment";

interface Props {
  mode: "create" | "edit";
  types: EquipmentType[];
  defaultValues?: Equipment;
}

export function EquipmentForm({ mode, types, defaultValues }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type_id: defaultValues?.type_id || "",
      serial_number: defaultValues?.serial_number || "",
      model: defaultValues?.model || "",
      manufacturer: defaultValues?.manufacturer || "",
      purchase_date: defaultValues?.purchase_date || "",
      purchase_price: defaultValues?.purchase_price?.toString() || "",
      status: defaultValues?.status || "사용가능",
      notes: defaultValues?.notes || "",
    },
  });

  const onSubmit = async (values: EquipmentFormValues) => {
    const payload = {
      name: values.name,
      type_id: values.type_id,
      serial_number: values.serial_number || null,
      model: values.model || null,
      manufacturer: values.manufacturer || null,
      purchase_date: values.purchase_date || null,
      purchase_price: values.purchase_price
        ? Number(values.purchase_price)
        : null,
      status: values.status,
      notes: values.notes || null,
    };

    if (mode === "create") {
      const { error } = await supabase.from("equipment").insert({
        ...payload,
        qr_code_id: nanoid(10),
      });
      if (error) {
        toast.error("등록에 실패했습니다");
        return;
      }
      toast.success("장비가 등록되었습니다", { description: values.name });
    } else {
      const { error } = await supabase
        .from("equipment")
        .update(payload)
        .eq("id", defaultValues!.id);
      if (error) {
        toast.error("수정에 실패했습니다");
        return;
      }
      toast.success("장비가 수정되었습니다", { description: values.name });
    }
    router.push("/equipment");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장비명 *</FormLabel>
              <FormControl>
                <Input placeholder="예: MacBook Pro 16인치" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>유형 *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택">
                      {field.value
                        ? types.find((t) => t.id === field.value)?.name
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시리얼번호</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>모델명</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제조사</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태 *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EQUIPMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>구매일</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>구매가 (원)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "저장 중..."
              : mode === "create"
                ? "등록"
                : "수정"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
