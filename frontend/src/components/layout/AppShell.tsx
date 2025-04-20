import * as React from "react";
import { Outlet } from "react-router-dom";
import { MainNav } from "@/components/ui/MainNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-10">
        <div className="flex flex-col h-full border-r bg-card">
          <div className="h-16 flex items-center px-6 border-b">
            <h1 className="text-lg font-semibold">SkillMap</h1>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <MainNav />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 py-6 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}