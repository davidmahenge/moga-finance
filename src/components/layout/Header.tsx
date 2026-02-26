"use client";

import { useSession } from "next-auth/react";
import { UserCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCircle className="w-5 h-5 text-gray-400" />
            <span>{session?.user?.name || "Officer"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
