"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function SignOutAction() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </SignOutButton>
  );
}