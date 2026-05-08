/**
 * Root page (Server Component).
 *
 * Redirects authenticated users to /projects and unauthenticated users to /login.
 * The site does not have a public landing page in this implementation.
 */

import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/projects");
  }

  redirect("/login");
}
