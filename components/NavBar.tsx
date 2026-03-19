"use client";

import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="font-bold text-xl">Psyqus</h1>

      {/* User menu */}
      <UserButton />
    </div>
  );
}