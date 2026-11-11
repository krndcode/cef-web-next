import { NextResponse } from "next/server";
import { getNeonAuth } from "@/lib/neon-auth";
import {
  ensureStoreUserForNeonAuth,
  StoreEmailVerificationRequiredError,
  getStoreUserForNeonAuth,
  isSameOriginRequest,
} from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { storeProfilePatchSchema } from "@/lib/store-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  name: string;
  email: string;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  region: string | null;
  delivery_note: string | null;
};

function toProfile(row: ProfileRow) {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    region: row.region,
    deliveryNote: row.delivery_note,
  };
}

async function getAuthenticatedProfileUser() {
  const { data, error } = await getNeonAuth().getSession();
  if (error) {
    throw new Error(`Could not validate the Neon Auth session: ${error.message}`);
  }

  const authUser = data?.user;
  if (!authUser) {
    return { authUser: null, user: null };
  }
  if (!authUser.emailVerified) {
    return { authUser, user: null };
  }

  return {
    authUser,
    user: await getStoreUserForNeonAuth(authUser.id),
  };
}

export async function GET() {
  try {
    const { authUser, user } = await getAuthenticatedProfileUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Sign in to view your bookstore profile." },
        { status: 401 },
      );
    }
    if (!user) {
      return NextResponse.json(
        {
          error: authUser.emailVerified
            ? "Your bookstore account is unavailable."
            : "Verify your email address to access your bookstore profile.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        region: user.region,
        deliveryNote: user.deliveryNote,
      },
    });
  } catch (error) {
    console.error("Could not load the bookstore customer profile.", error);
    return NextResponse.json(
      { error: "Could not load your profile. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  const parsed = storeProfilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the profile fields and try again." },
      { status: 400 },
    );
  }

  try {
    const { authUser, user } = await getAuthenticatedProfileUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Sign in to update your bookstore profile." },
        { status: 401 },
      );
    }
    if (!user) {
      return NextResponse.json(
        {
          error: authUser.emailVerified
            ? "Your bookstore account is unavailable."
            : "Verify your email address to update your bookstore profile.",
        },
        { status: 403 },
      );
    }

    const columnNames = {
      name: "name",
      phone: "phone",
      addressLine1: "address_line_1",
      addressLine2: "address_line_2",
      city: "city",
      region: "region",
      deliveryNote: "delivery_note",
    } as const;
    const entries = Object.entries(parsed.data).filter(
      (entry): entry is [keyof typeof columnNames, string] =>
        entry[1] !== undefined,
    );
    const assignments = entries.map(
      ([field], index) => `${columnNames[field]} = $${index + 3}`,
    );
    const values = entries.map(([field, value]) =>
      field === "name" ? value : value || null,
    );

    const result = await getStoreDb().query<ProfileRow>(
      `UPDATE store_users
       SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $1 AND neon_auth_user_id = $2 AND is_active = TRUE
       RETURNING name, email, phone, address_line_1, address_line_2,
                 city, region, delivery_note`,
      [user.id, authUser.id, ...values],
    );
    const updatedProfile = result.rows[0];
    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Your bookstore account is unavailable." },
        { status: 403 },
      );
    }

    return NextResponse.json({ profile: toProfile(updatedProfile) });
  } catch (error) {
    console.error("Could not update the bookstore customer profile.", error);
    return NextResponse.json(
      { error: "Could not save your profile. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const { data, error } = await getNeonAuth().getSession();
    if (error) {
      throw new Error(`Could not validate the Neon Auth session: ${error.message}`);
    }
    const authUser = data?.user;
    if (!authUser) {
      return NextResponse.json(
        { error: "Sign in to access the bookstore." },
        { status: 401 },
      );
    }

    const user = await ensureStoreUserForNeonAuth({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
    });
    if (!user.isActive) {
      return NextResponse.json(
        { error: "This store account is disabled. Contact store support." },
        { status: 403 },
      );
    }
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof StoreEmailVerificationRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Store profile synchronization failed.", error);
    return NextResponse.json(
      { error: "Could not prepare your store account. Please try again." },
      { status: 500 },
    );
  }
}
