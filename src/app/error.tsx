"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground">
          예기치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  );
}
