"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Monitor, LayoutDashboard } from "lucide-react";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center border-b px-4 md:px-6">
      <Sheet>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="md:hidden" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-4">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-bold">장비 관리</span>
          </Link>
          <nav className="flex flex-col gap-1">
            <Link
              href="/equipment"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Monitor className="h-4 w-4" />
              장비 관리
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
