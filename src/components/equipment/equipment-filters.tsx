"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EQUIPMENT_STATUSES } from "@/types/equipment";
import type { EquipmentType } from "@/types/equipment";
import { useCallback, useRef, useState } from "react";

interface Props {
  types: EquipmentType[];
}

export function EquipmentFilters({ types }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/equipment?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams("search", value), 300);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="장비명 또는 시리얼번호 검색..."
        value={searchValue}
        onChange={handleSearchChange}
        className="sm:w-64"
      />
      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(v) => updateParams("status", v ?? "all")}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          {EQUIPMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("type") || "all"}
        onValueChange={(v) => updateParams("type", v ?? "all")}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 유형</SelectItem>
          {types.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
