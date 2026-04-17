import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import type { EquipmentType } from "@/types/equipment";

export const dynamic = "force-dynamic";

export default async function NewEquipmentPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from("equipment_types")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">장비 등록</h1>
      <EquipmentForm mode="create" types={(types || []) as EquipmentType[]} />
    </div>
  );
}
