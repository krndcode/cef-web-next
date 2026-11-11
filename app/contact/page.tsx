"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

const contactPhone = "+233246474984";
const contactEmail = "info@christtheentiretyfoundation.org";

export default function ContactPage() {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/contact/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          topic: String(formData.get("topic") ?? ""),
          message: String(formData.get("message") ?? ""),
        }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not send your message.");
        return;
      }
      setNotice("Thank you. Your message has been sent to the CEF support team.");
      form.reset();
    } catch (requestError) {
      console.error("Contact message submission failed.", requestError);
      setError("Could not reach the contact service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      <section className="cef-hero-backdrop relative overflow-hidden px-4 py-16 text-center text-white sm:py-24">
        <FadeIn
          direction="up"
          delay={0.1}
          className="mx-auto max-w-3xl space-y-4"
        >
          <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider sm:text-xs">
            Get in touch
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Contact Christ The Entirety Foundation
          </h1>
          <p className="text-sm leading-relaxed text-purple-100 sm:text-lg">
            We&apos;d be glad to hear from you about our work, departments,
            outreach, or how to get involved.
          </p>
        </FadeIn>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-5 lg:px-8">
        <FadeIn
          direction="right"
          className="space-y-5 lg:col-span-2"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Contact details
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Reach our team directly. For a donation or ministry partnership,
              visit our{" "}
              <a
                href="/give-partner"
                className="font-semibold text-cefPurple underline underline-offset-2"
              >
                Give &amp; Partner page
              </a>
              .
            </p>

            <div className="space-y-5">
              <a
                href={`tel:${contactPhone}`}
                className="flex items-start gap-3 text-gray-800 transition hover:text-cefPurple"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-cefPurple">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Phone
                  </span>
                  <span className="text-sm font-medium">+233 24 647 4984</span>
                </span>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="flex items-start gap-3 text-gray-800 transition hover:text-cefBlue"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-cefBlue">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </span>
                  <span className="break-all text-sm font-medium">
                    {contactEmail}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-cefPurple">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Location
                  </span>
                  <span className="text-sm font-medium">Tuba, Accra, Ghana</span>
                </span>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/233246474984?text=${encodeURIComponent("Hello Christ The Entirety Foundation, I would like to get in touch.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 font-bold text-white shadow transition hover:bg-green-800"
          >
            <MessageCircle className="h-5 w-5" /> Message us on WhatsApp
          </a>
        </FadeIn>

        <FadeIn
          direction="left"
          delay={0.15}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9 lg:col-span-3"
        >
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Send us a message
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Send your message directly to our support inbox. Our team can
              review it and reply to your email.
            </p>
          </div>

          {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
          {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                <span>Your name</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-cefPurple/20"
                  placeholder="Your full name"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-gray-700">
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-cefPurple/20"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
              <span>What is your message about?</span>
              <select
                name="topic"
                required
                defaultValue="General inquiry"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-cefPurple/20"
              >
                <option>General inquiry</option>
                <option>Volunteering or joining a department</option>
                <option>Ministering Life to the Needy (M.L.T.N)</option>
                <option>Voice of the Cross (V.O.C)</option>
                <option>Touching the Heart of Realities (T.H.O.R)</option>
                <option>Donation or partnership</option>
              </select>
            </label>

            <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
              <span>Your message</span>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-cefPurple/20"
                placeholder="How can our team help?"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-6 py-3.5 font-bold text-white shadow transition hover:bg-purple-800 disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Sending..." : "Send message"} <Send className="h-4 w-4" />
            </button>
          </form>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
