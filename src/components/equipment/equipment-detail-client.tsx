"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryTimeline } from "@/components/history/history-timeline";
import { HistoryFormDialog } from "@/components/history/history-form-dialog";
import type { EquipmentHistory } from "@/types/equipment";

interface Props {
  equipmentId: string;
  history: EquipmentHistory[];
}

export function EquipmentDetailClient({ equipmentId, history }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EquipmentHistory | null>(null);

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: EquipmentHistory) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  return (
    <>
      <Tabs defaultValue="history">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="history">이력</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" />
            이력 추가
          </Button>
        </div>
        <TabsContent value="history" className="mt-4">
          <HistoryTimeline history={history} onEdit={handleEdit} />
        </TabsContent>
      </Tabs>

      <HistoryFormDialog
        equipmentId={equipmentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
      />
    </>
  );
}
