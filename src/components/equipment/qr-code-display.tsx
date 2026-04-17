"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, ArrowLeft } from "lucide-react";
import { getQrUrl } from "@/lib/qr";
import { useRouter } from "next/navigation";
import type { Equipment } from "@/types/equipment";

interface Props {
  equipment: Equipment;
}

export function QrCodeDisplay({ equipment }: Props) {
  const router = useRouter();
  const qrUrl = getQrUrl(equipment.qr_code_id);

  return (
    <>
      <style>{`@page { margin: 10mm; }`}</style>
      <div className="space-y-4 print:flex print:items-center print:justify-center print:min-h-screen print:m-0">
        <div className="flex items-center gap-4 print:hidden">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">QR 코드</h1>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
        </div>

        <div className="flex justify-center">
          <Card className="w-fit print:border-none print:shadow-none">
            <CardContent className="flex flex-col items-center gap-4 p-8 print:p-4">
              <QRCodeSVG value={qrUrl} size={256} level="M" />
              <div className="text-center space-y-1">
                <p className="font-bold text-lg print:text-base">{equipment.name}</p>
                {equipment.serial_number && (
                  <p className="text-sm text-muted-foreground print:text-xs">
                    S/N: {equipment.serial_number}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
