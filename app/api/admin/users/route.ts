import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

// GET /api/admin/users - list all users
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return NextResponse.json(allUsers);
}

// POST /api/admin/users - create a new user
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, password, role } = body as {
    email: string;
    name: string;
    password: string;
    role: "admin" | "employee" | "partner";
  };

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "Email, name, and password are required" },
      { status: 400 }
    );
  }

  if (!["admin", "employee", "partner"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be admin, employee, or partner" },
      { status: 400 }
    );
  }

  // Check for existing user
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash,
      role,
      active: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    });

  return NextResponse.json(newUser, { status: 201 });
}

// PATCH /api/admin/users - update a user
export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, role, active, name, password } = body as {
    id: string;
    role?: "admin" | "employee" | "partner";
    active?: boolean;
    name?: string;
    password?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (role !== undefined) {
    if (!["admin", "employee", "partner"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be admin, employee, or partner" },
        { status: 400 }
      );
    }
    updates.role = role;
  }

  if (active !== undefined) {
    updates.active = active;
  }

  if (name !== undefined) {
    updates.name = name.trim();
  }

  if (password) {
    updates.passwordHash = await hash(password, 10);
  }

  await db.update(users).set(updates).where(eq(users.id, id));

  return NextResponse.json({ success: true });
}
