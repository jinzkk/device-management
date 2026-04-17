export const dynamic = "force-dynamic";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { EquipmentPagination } from "@/components/equipment/equipment-pagination";
import type { EquipmentWithCurrentUser, EquipmentType } from "@/types/equipment";

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function EquipmentListPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const page = Number(params.page || "1");
  const offset = (page - 1) * PAGE_SIZE;

  // 장비 유형 목록
  const { data: types } = await supabase
    .from("equipment_types")
    .select("*")
    .order("name");

  // 장비 목록 쿼리
  let query = supabase
    .from("equipment_with_current_user")
    .select("*", { count: "exact" });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,serial_number.ilike.%${params.search}%`
    );
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.type) {
    query = query.eq("type_id", params.type);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const equipment = (data || []) as EquipmentWithCurrentUser[];
  const total = count || 0;

  // 엑셀 다운로드 URL 구성
  const exportParams = new URLSearchParams();
  if (params.search) exportParams.set("search", params.search);
  if (params.status) exportParams.set("status", params.status);
  if (params.type) exportParams.set("type", params.type);
  const exportUrl = `/equipment/export?${exportParams.toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">장비 관리</h1>
        <div className="flex gap-2">
          <a
            href={exportUrl}
            download
            className={buttonVariants({ variant: "outline" })}
          >
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
          </a>
          <Link
            href="/equipment/new"
            className={buttonVariants()}
          >
            <Plus className="mr-2 h-4 w-4" />
            장비 등록
          </Link>
        </div>
      </div>

      <EquipmentFilters types={(types || []) as EquipmentType[]} />
      <EquipmentTable data={equipment} />
      <EquipmentPagination total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
