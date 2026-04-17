export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil, QrCode, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EquipmentStatusBadge } from "@/components/equipment/equipment-status-badge";
import { EquipmentDetailClient } from "@/components/equipment/equipment-detail-client";
import type { EquipmentWithCurrentUser, EquipmentHistory } from "@/types/equipment";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: equipment }, { data: history }] = await Promise.all([
    supabase
      .from("equipment_with_current_user")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("equipment_history")
      .select("*")
      .eq("equipment_id", id)
      .order("start_date", { ascending: false }),
  ]);

  if (!equipment) notFound();

  const eq = equipment as EquipmentWithCurrentUser;

  const infoRows = [
    { label: "유형", value: eq.type_name },
    { label: "시리얼번호", value: eq.serial_number },
    { label: "모델명", value: eq.model },
    { label: "제조사", value: eq.manufacturer },
    { label: "구매일", value: eq.purchase_date },
    {
      label: "구매가",
      value: eq.purchase_price
        ? `${eq.purchase_price.toLocaleString()}원`
        : null,
    },
    { label: "현재 사용자", value: eq.current_user_name },
    { label: "부서", value: eq.current_department },
    { label: "위치", value: eq.current_location },
    { label: "비고", value: eq.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{eq.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/equipment/${id}/qr`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <QrCode className="mr-2 h-4 w-4" />
            QR코드
          </Link>
          <Link
            href={`/equipment/${id}/edit`}
            className={buttonVariants({ size: "sm" })}
          >
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              장비 정보
              <EquipmentStatusBadge status={eq.status} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eq.image_url && (
              <div className="flex justify-center mb-4">
                <img
                  src={eq.image_url}
                  alt={eq.name}
                  className="max-h-48 max-w-full object-contain rounded-lg"
                />
              </div>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              {infoRows.map((row) =>
                row.value ? (
                  <div key={row.label} className="contents">
                    <dt className="text-muted-foreground font-medium">
                      {row.label}
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <EquipmentDetailClient
        equipmentId={id}
        history={(history || []) as EquipmentHistory[]}
      />
    </div>
  );
}
