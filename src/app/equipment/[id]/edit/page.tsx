export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import type { Equipment, EquipmentType } from "@/types/equipment";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEquipmentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: equipment }, { data: types }] = await Promise.all([
    supabase.from("equipment").select("*").eq("id", id).single(),
    supabase.from("equipment_types").select("*").order("name"),
  ]);

  if (!equipment) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">장비 수정</h1>
      <EquipmentForm
        mode="edit"
        types={(types || []) as EquipmentType[]}
        defaultValues={equipment as Equipment}
      />
    </div>
  );
}
