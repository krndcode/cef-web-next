"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  CircleUserRound,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
} from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  deliveryNote: string | null;
};

type ProfileFormProps = {
  initialProfile: CustomerProfile;
};

type ProfileResponse = {
  error?: string;
  profile?: CustomerProfile;
};

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cefPurple focus:ring-2 focus:ring-purple-100";

function profileValues(profile: CustomerProfile): CustomerProfile {
  return {
    ...profile,
    phone: profile.phone ?? "",
    addressLine1: profile.addressLine1 ?? "",
    addressLine2: profile.addressLine2 ?? "",
    city: profile.city ?? "",
    region: profile.region ?? "",
    deliveryNote: profile.deliveryNote ?? "",
  };
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => profileValues(initialProfile));
  const [savedProfile, setSavedProfile] = useState(() =>
    profileValues(initialProfile),
  );
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const hasUnsavedChanges =
    JSON.stringify(profile) !== JSON.stringify(savedProfile);

  function updateField(
    field: keyof CustomerProfile,
    value: string,
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
    setNotice("");
    setError("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/store/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          addressLine1: profile.addressLine1,
          addressLine2: profile.addressLine2,
          city: profile.city,
          region: profile.region,
          deliveryNote: profile.deliveryNote,
        }),
      });
      const result: ProfileResponse = await response.json();

      if (!response.ok || !result.profile) {
        setError(result.error ?? "Could not save your profile. Please try again.");
        return;
      }

      const nextProfile = profileValues(result.profile);
      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setNotice("Your profile has been saved.");
      router.refresh();
    } catch (requestError) {
      console.error("Customer profile save request failed.", requestError);
      setError("Could not reach the store. Your profile was not saved.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    setError("");
    setNotice("");

    try {
      const result = await neonAuthClient.signOut();
      if (result.error) {
        setError(result.error.message || "Could not sign out.");
        return;
      }

      router.replace("/store");
      router.refresh();
    } catch (requestError) {
      console.error("Neon Auth sign-out request failed.", requestError);
      setError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/store"
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-600 transition hover:text-cefPurple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cefPurple"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to bookstore
        </Link>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-purple-950/5">
          <header className="cef-hero-backdrop flex flex-col gap-5 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-8">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <CircleUserRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-200">
                  CEF Bookstore account
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  My profile
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut || saving}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60 sm:self-center"
            >
              {signingOut ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="h-4 w-4" aria-hidden="true" />
              )}
              Sign out
            </button>
          </header>

          <div className="space-y-7 p-5 sm:p-9">
            <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cefBlue shadow-sm">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    Your account email
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-700">
                    {profile.email}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Email is managed by Neon Auth and cannot be changed here.
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-cefBlue">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Verified account
              </span>
            </div>

            {notice && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                {notice}
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <form onSubmit={saveProfile} className="space-y-8">
              <section aria-labelledby="personal-information-title">
                <div className="mb-4">
                  <h2
                    id="personal-information-title"
                    className="font-serif text-xl font-bold text-gray-950"
                  >
                    Personal information
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep your contact details up to date.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                    Full name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                      value={profile.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                    Phone number
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={32}
                      value={profile.phone ?? ""}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      className={fieldClassName}
                      placeholder="+233 ..."
                    />
                  </label>
                </div>
              </section>

              <section aria-labelledby="delivery-information-title">
                <div className="mb-4">
                  <h2
                    id="delivery-information-title"
                    className="flex items-center gap-2 font-serif text-xl font-bold text-gray-950"
                  >
                    <MapPin
                      className="h-5 w-5 text-cefPurple"
                      aria-hidden="true"
                    />
                    Default delivery information
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    These details can be edited again for each order.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
                    Address line 1
                    <input
                      name="addressLine1"
                      autoComplete="address-line1"
                      maxLength={200}
                      value={profile.addressLine1 ?? ""}
                      onChange={(event) =>
                        updateField("addressLine1", event.target.value)
                      }
                      className={fieldClassName}
                      placeholder="House number, street, neighbourhood"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
                    Address line 2{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                    <input
                      name="addressLine2"
                      autoComplete="address-line2"
                      maxLength={200}
                      value={profile.addressLine2 ?? ""}
                      onChange={(event) =>
                        updateField("addressLine2", event.target.value)
                      }
                      className={fieldClassName}
                      placeholder="Apartment, landmark, or additional directions"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                    City or town
                    <input
                      name="city"
                      autoComplete="address-level2"
                      maxLength={100}
                      value={profile.city ?? ""}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                    Region
                    <input
                      name="region"
                      autoComplete="address-level1"
                      maxLength={100}
                      value={profile.region ?? ""}
                      onChange={(event) =>
                        updateField("region", event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-gray-700 sm:col-span-2">
                    Delivery instructions{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                    <textarea
                      name="deliveryNote"
                      rows={3}
                      maxLength={500}
                      value={profile.deliveryNote ?? ""}
                      onChange={(event) =>
                        updateField("deliveryNote", event.target.value)
                      }
                      className={`${fieldClassName} resize-y`}
                      placeholder="Helpful directions for delivering your order"
                    />
                  </label>
                </div>
              </section>

              <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-sm font-medium ${
                    hasUnsavedChanges ? "text-amber-700" : "text-gray-500"
                  }`}
                  aria-live="polite"
                >
                  {hasUnsavedChanges
                    ? "You have unsaved changes."
                    : "Your profile is up to date."}
                </p>
                <button
                  type="submit"
                  disabled={saving || signingOut || !hasUnsavedChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cefPurple px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/10 transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {saving ? "Saving profile..." : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
