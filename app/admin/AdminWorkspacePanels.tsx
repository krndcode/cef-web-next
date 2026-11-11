"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Send, ShieldPlus } from "lucide-react";
import type { StoreUser } from "@/lib/store-types";

type SupportMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "closed";
  is_read: boolean;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

async function requestSupportMessages(): Promise<SupportMessage[]> {
  const response = await fetch("/api/admin/messages", { cache: "no-store" });
  const result: { error?: string; messages?: SupportMessage[] } = await response.json();
  if (!response.ok || !result.messages) {
    throw new Error(result.error ?? "Could not load messages.");
  }
  return result.messages;
}

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100";

export function AdminInvitePanel({
  admin,
  users,
}: {
  admin: StoreUser;
  users: StoreUser[];
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result: { error?: string; email?: string } = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not add this administrator.");
        return;
      }
      setNotice(`${result.email} can now administer the foundation workspace.`);
      form.reset();
      router.refresh();
    } catch (requestError) {
      console.error("Administrator invite request failed.", requestError);
      setError("Could not reach the administration service.");
    } finally {
      setBusy(false);
    }
  }

  const admins = users.filter((user) => user.role === "admin");
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefPurple">Administration access</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-gray-950">Add Admin</h2>
        <p className="mt-2 text-sm text-gray-600">Promote an active, verified bookstore customer to administrator.</p>
      </header>
      {!admin.isPrimaryAdmin && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Only the primary administrator can grant admin access.
        </p>
      )}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      <form onSubmit={(event) => void submit(event)} className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="block space-y-2 text-sm font-bold text-gray-800">
          Existing account email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="colleague@example.com"
            className={fieldClass}
          />
        </label>
        <p className="mt-2 text-xs leading-5 text-gray-500">The person must first create and verify their bookstore account using this email.</p>
        <button
          type="submit"
          disabled={busy || !admin.isPrimaryAdmin}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cefPurple px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          <ShieldPlus className="h-4 w-4" aria-hidden="true" />
          {busy ? "Adding admin..." : "Grant admin access"}
        </button>
      </form>
      <section className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-950">Administrators</h3>
        <ul className="mt-3 divide-y divide-gray-100">
          {admins.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="font-semibold text-gray-900">{user.name}<span className="ml-2 text-xs font-normal text-gray-500">{user.email}</span></span>
              <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase text-cefPurple">
                {user.isPrimaryAdmin ? "Primary" : "Admin"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

export function AdminMessagesPanel({ unreadOnly = false }: { unreadOnly?: boolean }) {
  const router = useRouter();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    requestSupportMessages()
      .then((result) => {
        if (active) setMessages(result);
      })
      .catch((requestError: unknown) => {
        console.error("Support inbox request failed.", requestError);
        if (active) setError("Could not load support messages.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateMessage(
    message: SupportMessage,
    values: {
      status?: SupportMessage["status"];
      reply?: string;
      isRead?: boolean;
    },
  ) {
    setError("");
    setNotice("");
    setBusy(message.id);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not update this message.");
        return false;
      }
      setNotice(values.reply
        ? "Reply saved. Your email app is opening; mark the message Replied after sending."
        : values.isRead !== undefined
          ? `Message marked as ${values.isRead ? "read" : "unread"}.`
          : "Message status updated.");
      setMessages(await requestSupportMessages());
      router.refresh();
      return true;
    } catch (requestError) {
      console.error("Support message update failed.", requestError);
      setError("Could not update this message.");
      return false;
    } finally {
      setBusy("");
    }
  }

  function submitReply(event: FormEvent<HTMLFormElement>, message: SupportMessage) {
    event.preventDefault();
    const reply = String(new FormData(event.currentTarget).get("reply") ?? "").trim();
    void updateMessage(message, { reply }).then((updated) => {
      if (updated) {
        const subject = encodeURIComponent(`Re: ${message.topic}`);
        const body = encodeURIComponent(reply);
        window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
      }
    });
  }

  const visibleMessages = unreadOnly
    ? messages.filter((message) => !message.is_read)
    : messages;

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefPurple">Customer care</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-gray-950">
          {unreadOnly ? "Unread support messages" : "Support messages"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">Review contact form messages, save a reply, then send it from your email app.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {loading ? (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600">Loading messages…</p>
      ) : visibleMessages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700">
          {unreadOnly ? "There are no unread messages." : "No support messages yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleMessages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-cefPurple">{message.topic}</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-950">{message.name}</h3>
                  <a className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline" href={`mailto:${message.email}`}>
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />{message.email}
                  </a>
                </div>
                <label className="text-xs font-semibold text-gray-600">
                  Status
                  <select
                    value={message.status}
                    disabled={busy === message.id}
                    onChange={(event) => void updateMessage(message, { status: event.target.value as SupportMessage["status"] })}
                    className="mt-1 block rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">{message.message}</p>
              <p className="mt-3 text-[11px] text-gray-400">{new Date(message.created_at).toLocaleString()}</p>
              <button
                type="button"
                disabled={busy === message.id}
                onClick={() => void updateMessage(message, { isRead: !message.is_read })}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-cefPurple hover:text-cefPurple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple disabled:opacity-50"
              >
                {message.is_read ? (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <MailOpen className="h-4 w-4" aria-hidden="true" />
                )}
                Mark as {message.is_read ? "unread" : "read"}
              </button>
              {message.reply && (
                <blockquote className="mt-4 rounded-xl border-l-4 border-cefPurple bg-purple-50 p-4 text-sm text-gray-700">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-cefPurple">Saved reply</p>
                  <p className="mt-2 whitespace-pre-wrap">{message.reply}</p>
                </blockquote>
              )}
              <form onSubmit={(event) => submitReply(event, message)} className="mt-4 space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  Reply
                  <textarea name="reply" required minLength={1} maxLength={5000} rows={3} defaultValue={message.reply ?? ""} className={`${fieldClass} mt-1.5`} />
                </label>
                <button type="submit" disabled={busy === message.id} className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  <Send className="h-4 w-4" aria-hidden="true" />Save reply &amp; open email
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminSettingsPanel({
  darkMode,
  compact,
  onDarkModeChange,
  onCompactChange,
}: {
  darkMode: boolean;
  compact: boolean;
  onDarkModeChange: (value: boolean) => void;
  onCompactChange: (value: boolean) => void;
}) {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefPurple">Workspace preferences</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-gray-950">Dashboard settings</h2>
        <p className="mt-2 text-sm text-gray-600">Personalize this dashboard in your browser. These preferences do not change the public website.</p>
      </header>
      <div className="max-w-2xl divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 shadow-sm">
        <label className="flex items-center justify-between gap-5 py-5">
          <span>
            <span className="block text-sm font-bold text-gray-900">Dark workspace</span>
            <span className="mt-1 block text-xs text-gray-500">Use a darker canvas while administering the site.</span>
          </span>
          <input type="checkbox" checked={darkMode} onChange={(event) => onDarkModeChange(event.target.checked)} className="h-5 w-5 accent-cefPurple" />
        </label>
        <label className="flex items-center justify-between gap-5 py-5">
          <span>
            <span className="block text-sm font-bold text-gray-900">Compact layout</span>
            <span className="mt-1 block text-xs text-gray-500">Reduce content spacing to show more on screen.</span>
          </span>
          <input type="checkbox" checked={compact} onChange={(event) => onCompactChange(event.target.checked)} className="h-5 w-5 accent-cefPurple" />
        </label>
      </div>
    </section>
  );
}
