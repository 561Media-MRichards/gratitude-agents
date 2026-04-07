import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type User } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

interface BootstrapUser {
  email: string;
  name: string;
  role: "admin" | "employee" | "partner";
  passwordHash?: string;
  password?: string;
}

let bootstrapPromise: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function resolveBootstrapUsers(): Promise<BootstrapUser[]> {
  const json = process.env.PORTAL_BOOTSTRAP_USERS_JSON;

  if (json) {
    const parsed = JSON.parse(json) as BootstrapUser[];
    return parsed.filter((user) => user.email && (user.passwordHash || user.password));
  }

  if (process.env.APP_PASSWORD_HASH) {
    return [
      {
        email: process.env.PORTAL_ADMIN_EMAIL || "admin@gratitude.local",
        name: process.env.PORTAL_ADMIN_NAME || "Portal Admin",
        role: "admin",
        passwordHash: process.env.APP_PASSWORD_HASH,
      },
    ];
  }

  return [];
}

async function upsertBootstrapUser(user: BootstrapUser) {
  const email = normalizeEmail(user.email);
  const passwordHash = user.passwordHash || (user.password ? await hash(user.password, 10) : null);

  if (!passwordHash) {
    return;
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!existing) {
    await db.insert(users).values({
      email,
      name: user.name,
      passwordHash,
      role: user.role,
      active: true,
    });
    return;
  }

  await db
    .update(users)
    .set({
      name: user.name,
      role: user.role,
      passwordHash,
      active: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id));
}

export async function ensureBootstrapUsers() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const bootstrapUsers = await resolveBootstrapUsers();

      for (const user of bootstrapUsers) {
        await upsertBootstrapUser(user);
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}

function toSessionUser(user: User): SessionUser {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function authenticateUser(email: string, password: string) {
  await ensureBootstrapUsers();

  const normalizedEmail = normalizeEmail(email);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user || !user.active) {
    return null;
  }

  const valid = await compare(password, user.passwordHash);

  if (!valid) {
    return null;
  }

  return toSessionUser(user);
}

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user || null;
}

export async function listPortalUsers() {
  await ensureBootstrapUsers();
  return db.select().from(users);
}
