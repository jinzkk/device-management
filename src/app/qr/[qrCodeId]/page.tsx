export const dynamic = "force-dynamic";

import { PackageSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EquipmentStatusBadge } from "@/components/equipment/equipment-status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EquipmentWithCurrentUser } from "@/types/equipment";

interface Props {
  params: Promise<{ qrCodeId: string }>;
}

export default async function QrPublicPage({ params }: Props) {
  const { qrCodeId } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("equipment_with_current_user")
    .select("*")
    .eq("qr_code_id", qrCodeId)
    .single();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-3">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">해당 장비를 찾을 수 없습니다</h1>
          <p className="text-sm text-muted-foreground">
            QR 코드가 유효하지 않거나 장비가 삭제되었습니다.
          </p>
        </div>
      </div>
    );
  }

  const eq = data as EquipmentWithCurrentUser;

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">장비 정보</p>
          <h1 className="text-2xl font-bold">{eq.name}</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
              상태
              <EquipmentStatusBadge status={eq.status} />
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              {infoRows.map(
                (row) =>
                  row.value && (
                    <div key={row.label} className="contents">
                      <dt className="text-muted-foreground font-medium whitespace-nowrap">
                        {row.label}
                      </dt>
                      <dd>{row.value}</dd>
                    </div>
                  )
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
