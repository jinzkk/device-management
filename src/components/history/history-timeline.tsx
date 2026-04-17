"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { EquipmentHistory } from "@/types/equipment";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  history: EquipmentHistory[];
  onEdit: (item: EquipmentHistory) => void;
}

export function HistoryTimeline({ history, onEdit }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("이 이력을 삭제하시겠습니까?")) return;
    const { error } = await supabase
      .from("equipment_history")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("삭제에 실패했습니다");
    } else {
      toast.success("이력이 삭제되었습니다");
      router.refresh();
    }
  };

  const handleReturn = async (item: EquipmentHistory) => {
    if (!confirm("장비를 반납 처리하시겠습니까?")) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const { error } = await supabase
      .from("equipment_history")
      .update({ end_date: today })
      .eq("id", item.id);
    if (error) {
      toast.error("반납 처리에 실패했습니다");
    } else {
      // 장비 상태도 사용가능으로 변경
      await supabase
        .from("equipment")
        .update({ status: "사용가능" })
        .eq("id", item.equipment_id);
      toast.success("반납 처리되었습니다");
      router.refresh();
    }
  };

  if (history.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        등록된 이력이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => {
        const isActive = !item.end_date;
        return (
          <div
            key={item.id}
            className="relative flex gap-4 rounded-lg border p-4"
          >
            <div
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{item.user_name}</span>
                {item.department && (
                  <span className="text-sm text-muted-foreground">
                    ({item.department})
                  </span>
                )}
                {isActive && <Badge variant="default">사용중</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(item.start_date), "yyyy년 M월 d일", {
                  locale: ko,
                })}
                {" ~ "}
                {item.end_date
                  ? format(new Date(item.end_date), "yyyy년 M월 d일", {
                      locale: ko,
                    })
                  : "현재"}
              </div>
              {item.location && (
                <div className="text-sm">위치: {item.location}</div>
              )}
              {item.notes && (
                <div className="text-sm text-muted-foreground">
                  {item.notes}
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReturn(item)}
                >
                  반납
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
