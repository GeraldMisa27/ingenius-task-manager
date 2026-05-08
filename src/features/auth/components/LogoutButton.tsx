"use client";

/**
 * Logout button that triggers NextAuth's signOut.
 * Used in protected layouts to allow users to end their session.
 */

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Cerrar sesión
    </Button>
  );
}
