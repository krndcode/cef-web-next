import type { Metadata } from "next";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  HandHeart,
  Heart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Tv,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Donate & Partner | Christ The Entirety Foundation",
  description:
    "Support Christ The Entirety Foundation through a donation, practical help, or a ministry partnership.",
};

const whatsappLink = (message: string) =>
  `https://wa.me/233246474984?text=${encodeURIComponent(message)}`;

const givingOptions = [
  {
    title: "Support an outreach",
    description:
      "Help M.L.T.N provide practical and spiritual support through visits to schools, orphanages, and communities in need.",
    icon: HandHeart,
    color: "text-cefPurple bg-purple-50",
    message:
      "Hello, I would like to support a Ministering Life to the Needy (M.L.T.N) outreach. Please share the current giving options and upcoming outreach information.",
  },
  {
    title: "Support books and the Word",
    description:
      "Help V.O.C create and share Christ-centered books and publications with more people.",
    icon: BookOpen,
    color: "text-cefBlue bg-blue-50",
    message:
      "Hello, I would like to support Voice of the Cross (V.O.C) publishing. Please share the current giving options and ways I can help.",
  },
  {
    title: "Support gospel media",
    description:
      "Help T.H.O.R produce and share video interviews, testimonies, and media that point people to Jesus.",
    icon: Tv,
    color: "text-purple-700 bg-purple-50",
    message:
      "Hello, I would like to support Touching the Heart of Realities (T.H.O.R) media work. Please share the current giving options and ways I can help.",
  },
];

const partnershipOptions = [
  {
    title: "Give regularly",
    description:
      "Stand with the foundation through recurring support for the work and its ongoing needs.",
  },
  {
    title: "Share your skills",
    description:
      "Contribute your time or professional skills in outreach, publishing, media, technology, or administration.",
  },
  {
    title: "Partner as a church or organisation",
    description:
      "Explore a joint outreach, resource contribution, or other practical way to serve together.",
  },
];

export default function GivePartnerPage() {
  const donationMessage =
    "Hello, I would like to make a donation to support Christ The Entirety Foundation. Please share the current verified giving options.";
  const partnershipMessage =
    "Hello, I am interested in partnering with Christ The Entirety Foundation. Please let me know how we can work together.";

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      <section className="cef-hero-backdrop relative overflow-hidden px-4 py-16 text-center text-white sm:py-24">
        <FadeIn
          direction="up"
          delay={0.1}
          className="mx-auto max-w-4xl space-y-5"
        >
          <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider sm:text-xs">
            Give • Serve • Partner
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Help the work reach further
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-purple-100 sm:text-lg">
            Your generosity and partnership help Christ The Entirety Foundation
            share the Word, serve people in need, and tell stories of faith.
          </p>
          <p className="text-sm font-light italic text-purple-100 sm:text-base">
            &ldquo;Together Everyone Achieves More (TEAM) for the Kingdom.&rdquo;
          </p>
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <a
              href="#donate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-cefPurple shadow-lg transition hover:bg-gray-100"
            >
              <Heart className="h-4 w-4" /> Make a difference
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#partner"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              <HeartHandshake className="h-4 w-4" /> Explore partnership
            </a>
          </div>
        </FadeIn>
      </section>

      <section
        id="donate"
        className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <FadeIn
            direction="up"
            className="mx-auto mb-10 max-w-3xl space-y-3 text-center"
          >
            <span className="inline-block rounded bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cefPurple">
              Your giving supports the mission
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-4xl">
              Choose what you&apos;d like to support
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Every contribution helps the foundation put its faith into
              action. Let us know which area matters to you, or give toward the
              work more broadly.
            </p>
          </FadeIn>

          <div className="grid gap-5 md:grid-cols-3">
            {givingOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <FadeIn
                  key={option.title}
                  direction="up"
                  delay={0.1 * (index + 1)}
                  className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${option.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {option.title}
                  </h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
                    {option.description}
                  </p>
                  <a
                    href={whatsappLink(option.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-cefPurple transition hover:text-purple-800"
                  >
                    Ask how to give <ArrowRight className="h-4 w-4" />
                  </a>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn
            direction="up"
            delay={0.2}
            className="mt-8 rounded-2xl bg-gradient-to-br from-cefPurple to-purple-900 p-6 text-white shadow-lg sm:p-9"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h3 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                  <Heart className="h-5 w-5 text-pink-200" />
                  Ready to make a donation?
                </h3>
                <p className="text-sm leading-relaxed text-purple-100">
                  Contact our team for current, verified giving details and to
                  let us know how you would like your gift to support the work.
                  Please confirm payment details with us directly before
                  sending funds.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink(donationMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-cefPurple shadow transition hover:bg-purple-50"
                >
                  <MessageCircle className="h-4 w-4" /> Request giving details
                </a>
                <a
                  href={`mailto:info@christtheentiretyfoundation.org?subject=${encodeURIComponent("Donation to Christ The Entirety Foundation")}&body=${encodeURIComponent(donationMessage)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Mail className="h-4 w-4" /> Email us
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section
        id="partner"
        className="scroll-mt-24 bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn direction="right" className="space-y-4">
            <span className="inline-block rounded bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cefBlue">
              Kingdom partnership
            </span>
            <h2 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              There are many ways to stand with the mission
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              Partnership is more than a financial gift. Bring your time,
              skills, resources, church, or organisation alongside the work of
              CEF. We&apos;d be glad to hear what you have in mind.
            </p>
            <a
              href={whatsappLink(partnershipMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-5 py-3 font-bold text-white shadow transition hover:bg-purple-800"
            >
              <Users className="h-4 w-4" /> Start a partnership conversation
              <ArrowRight className="h-4 w-4" />
            </a>
          </FadeIn>

          <div className="space-y-4">
            {partnershipOptions.map((option, index) => (
              <FadeIn
                key={option.title}
                direction="left"
                delay={0.1 * (index + 1)}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-cefPurple">
                  <span className="text-sm font-extrabold">{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{option.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {option.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <FadeIn
          direction="up"
          className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                Let&apos;s talk
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Have a question about giving, volunteering, or working
                together? Get in touch with the foundation directly.
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0 text-cefPurple" />
                Tuba, Accra, Ghana
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+233246474984"
                className="inline-flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 font-semibold text-gray-800 transition hover:bg-purple-100"
              >
                <Phone className="h-5 w-5 text-cefPurple" />
                <span>+233 24 647 4984</span>
              </a>
              <a
                href="mailto:info@christtheentiretyfoundation.org"
                className="inline-flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-gray-800 transition hover:bg-blue-100"
              >
                <Mail className="h-5 w-5 text-cefBlue" />
                <span className="break-all">
                  info@christtheentiretyfoundation.org
                </span>
              </a>
              <a
                href={whatsappLink(donationMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 font-semibold text-gray-800 transition hover:bg-green-100"
              >
                <MessageCircle className="h-5 w-5 text-green-700" />
                <span>Message us on WhatsApp</span>
              </a>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
