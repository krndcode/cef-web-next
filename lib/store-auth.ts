import { randomUUID } from "node:crypto";
import { getNeonAuth } from "@/lib/neon-auth";
import { getStoreDb } from "@/lib/store-db";
import type { StoreRole, StoreUser } from "@/lib/store-types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  region: string | null;
  delivery_note: string | null;
  role: StoreRole;
  is_active: boolean;
  is_primary_admin: boolean;
  created_at: Date;
};

function toStoreUser(row: UserRow): StoreUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    region: row.region,
    deliveryNote: row.delivery_note,
    role: row.role,
    isActive: row.is_active,
    isPrimaryAdmin: row.is_primary_admin,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getStoreUser(): Promise<StoreUser | null> {
  const { data, error } = await getNeonAuth().getSession();
  if (error) {
    throw new Error(`Could not validate the Neon Auth session: ${error.message}`);
  }
  const authUser = data?.user;
  if (!authUser) {
    return null;
  }

  return getStoreUserForNeonAuth(authUser.id);
}

export async function getStoreUserForNeonAuth(
  authUserId: string,
): Promise<StoreUser | null> {
  const result = await getStoreDb().query<UserRow>(
    `SELECT u.id, u.name, u.email, u.phone, u.address_line_1,
            u.address_line_2, u.city, u.region, u.delivery_note,
            u.role, u.is_active, u.is_primary_admin, u.created_at
     FROM store_users u
     WHERE u.neon_auth_user_id = $1
       AND u.is_active = TRUE
     LIMIT 1`,
    [authUserId],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return toStoreUser(row);
}

export class StoreEmailVerificationRequiredError extends Error {}

export async function ensureStoreUserForNeonAuth(input: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}): Promise<StoreUser> {
  if (!input.emailVerified) {
    throw new StoreEmailVerificationRequiredError(
      "Verify your email address with Neon Auth before accessing the bookstore.",
    );
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name || !input.id) {
    throw new Error("Neon Auth returned an incomplete verified user profile.");
  }

  const client = await getStoreDb().connect();
  try {
    await client.query("BEGIN");

    const linked = await client.query<UserRow>(
      `SELECT id, name, email, phone, address_line_1, address_line_2,
              city, region, delivery_note, role, is_active, is_primary_admin, created_at
       FROM store_users
       WHERE neon_auth_user_id = $1
       FOR UPDATE`,
      [input.id],
    );

    let row = linked.rows[0];
    if (row) {
      const updated = await client.query<UserRow>(
        `UPDATE store_users
         SET email = $2, updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, email, phone, address_line_1, address_line_2,
                   city, region, delivery_note, role, is_active, is_primary_admin, created_at`,
        [row.id, email],
      );
      row = updated.rows[0];
    } else {
      const existingByEmail = await client.query<UserRow & {
        neon_auth_user_id: string | null;
      }>(
        `SELECT id, name, email, phone, address_line_1, address_line_2,
                city, region, delivery_note, role, is_active, is_primary_admin, created_at,
                neon_auth_user_id
         FROM store_users
         WHERE LOWER(email) = $1
         FOR UPDATE`,
        [email],
      );
      const existing = existingByEmail.rows[0];

      if (existing?.neon_auth_user_id) {
        throw new Error(
          "This email is linked to another Neon Auth account. Contact store support.",
        );
      }

      if (existing) {
        const linkedLegacy = await client.query<UserRow>(
          `UPDATE store_users
           SET neon_auth_user_id = $2, name = $3, email = $4,
               password_hash = NULL, updated_at = NOW()
           WHERE id = $1
           RETURNING id, name, email, phone, address_line_1, address_line_2,
                     city, region, delivery_note, role, is_active, is_primary_admin, created_at`,
          [existing.id, input.id, name, email],
        );
        row = linkedLegacy.rows[0];
      } else {
        const created = await client.query<UserRow>(
          `INSERT INTO store_users (
             id, neon_auth_user_id, name, email, password_hash, role
           )
           VALUES ($1, $2, $3, $4, NULL, 'customer')
           RETURNING id, name, email, phone, address_line_1, address_line_2,
                     city, region, delivery_note, role, is_active, is_primary_admin, created_at`,
          [randomUUID(), input.id, name, email],
        );
        row = created.rows[0];
      }
    }

    await client.query("COMMIT");
    return toStoreUser(row);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
