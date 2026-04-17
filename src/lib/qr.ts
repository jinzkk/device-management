export function getQrUrl(qrCodeId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/qr/${qrCodeId}`;
}
