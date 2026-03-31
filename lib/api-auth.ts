import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * Checks that the request is authenticated and the user has an ADMIN or SUPER_ADMIN role.
 * Returns the session if valid, or a NextResponse error to return immediately.
 */
export async function requireAdmin(): Promise<
  | { session: { user: { id: string; email: string; role: string } } }
  | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }
  const role = session.user?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return {
      error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }),
    };
  }
  return { session };
}
