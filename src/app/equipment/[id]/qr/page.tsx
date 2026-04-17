export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrCodeDisplay } from "@/components/equipment/qr-code-display";
import type { Equipment } from "@/types/equipment";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QrCodePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .single();

  if (!equipment) notFound();

  const eq = equipment as Equipment;

  return <QrCodeDisplay equipment={eq} />;
}
