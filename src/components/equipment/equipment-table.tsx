"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, QrCode, Trash2 } from "lucide-react";
import { EquipmentStatusBadge } from "./equipment-status-badge";
import type { EquipmentWithCurrentUser } from "@/types/equipment";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  data: EquipmentWithCurrentUser[];
}

export function EquipmentTable({ data }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 장비를 삭제하시겠습니까?`)) return;

    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) {
      toast.error("삭제에 실패했습니다");
    } else {
      toast.success("장비가 삭제되었습니다");
      router.refresh();
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>장비명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead className="hidden md:table-cell">시리얼번호</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="hidden sm:table-cell">현재 사용자</TableHead>
            <TableHead className="hidden lg:table-cell">구매일</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                등록된 장비가 없습니다
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/equipment/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell>{item.type_name || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.serial_number || "-"}
                </TableCell>
                <TableCell>
                  <EquipmentStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.current_user_name || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {item.purchase_date || "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/equipment/${item.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        상세
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/equipment/${item.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/equipment/${item.id}/qr`)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        QR코드
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
