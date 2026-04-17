import { Badge } from "@/components/ui/badge";
import { type EquipmentStatus, STATUS_VARIANT } from "@/types/equipment";

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
