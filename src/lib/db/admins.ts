import { randomUUID } from "node:crypto";
import { pool } from "./pool";
import type { AdminRow } from "@/types/db";

export async function getAdminByEmail(email: string): Promise<AdminRow | null> {
  const { rows } = await pool.query<AdminRow>(`SELECT * FROM "Admin" WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

export async function createAdmin(email: string, passwordHash: string): Promise<AdminRow> {
  const { rows } = await pool.query<AdminRow>(
    `INSERT INTO "Admin" (id, email, "passwordHash", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, now(), now())
     RETURNING *`,
    [randomUUID(), email, passwordHash]
  );
  return rows[0];
}
