"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { 
  BookOpen, 
  Tv, 
  HeartHandshake, 
  ShoppingBag, 
  FileText, 
  Quote, 
  Calendar, 
  BookMarked, 
  Flame, 
  Mic, 
  ArrowRight, 
  Sparkles,
  Images
} from "lucide-react";

export default function ThreeTreesPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HERO SECTION */}
      <section className="cef-hero-backdrop relative overflow-hidden py-20 text-white text-center px-4">
        <FadeIn direction="up" delay={0.1} className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="inline-block bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            The Foundation Pillars
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            The Three Main Trees of CEF
          </h1>
          <p className="max-w-2xl mx-auto text-purple-100 text-sm sm:text-base leading-relaxed">
            Birthed from profound spiritual encounters and divine burdens to turn the hearts of the lost back to the Father and perfect His children.
          </p>
        </FadeIn>
      </section>

      {/* TREE 1: VOICE OF THE CROSS (V.O.C) */}
      <section id="voc" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn direction="right" delay={0.2} className="space-y-6">
            <div className="inline-flex items-center gap-2 text-cefPurple font-bold text-xs sm:text-sm uppercase tracking-wider bg-purple-50 px-3.5 py-1.5 rounded-lg border border-purple-100">
              <BookOpen className="w-4 h-4" /> Tree One
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Voice of the Cross (V.O.C)
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              The literary and publication arm of Christ The Entirety Foundation. Inspired by the Holy Spirit in September 2019, V.O.C is dedicated to communicating spiritual needs, deep kingdom insights, and salvation to the lost through anointed writings, books, and parchments.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-cefPurple flex items-center justify-center font-bold">
                  <BookMarked className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Books & Parchments</h3>
                <p className="text-xs text-gray-500">Access spiritual literature and study parchments designed to anchor your faith.</p>
                <span className="inline-flex items-center gap-1 pt-1 text-xs font-bold text-cefPurple">
                  Store coming soon
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-cefBlue flex items-center justify-center font-bold">
                  <Quote className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">V.O.C Quotes Hub</h3>
                <p className="text-xs text-gray-500">Profound kingdom declarations centered on the absolute supremacy of Christ.</p>
                <span className="inline-block text-xs font-semibold text-cefBlue bg-blue-50 px-2 py-0.5 rounded mt-1">
                  &ldquo;Jesus is Lord.&rdquo;
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.3} className="bg-gradient-to-br from-purple-900 to-cefPurple p-8 sm:p-10 rounded-3xl text-white shadow-xl space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-300" /> Featured V.O.C Resources
            </h3>
            <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
              Explore our collection of published books and sacred study parchments crafted to guide believers in walking uprightly in the light of God&apos;s word.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-4">
                <span className="font-medium text-sm">V.O.C Books Collection — coming soon</span>
                <ShoppingBag className="w-4 h-4 text-purple-200" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-4">
                <span className="font-medium text-sm">Study Parchments — coming soon</span>
                <FileText className="w-4 h-4 text-purple-200" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TREE 2: TOUCHING THE HEART OF REALITIES (T.H.O.R) */}
      <section id="thor" className="py-16 sm:py-24 bg-gray-100 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0.1} className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-cefBlue font-bold text-xs sm:text-sm uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-100">
              <Tv className="w-4 h-4" /> Tree Two
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Touching the Heart of Realities (T.H.O.R)
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              A dynamic media and broadcast branch showcasing video interviews, testimonies, and spiritual sessions that prove the absolute reality of God and kingdom principles.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Segment 1 */}
            <FadeIn direction="up" delay={0.2} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-cefPurple flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">End of Month Live Worship</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Power-packed monthly gatherings in God&apos;s presence featuring intense praise, worship, and spiritual renewal.
                </p>
              </div>
              <Link href="/production" className="inline-flex items-center gap-1.5 text-xs font-bold text-cefPurple hover:underline pt-2">
                Read T.H.O.R features <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>

            {/* Segment 2 */}
            <FadeIn direction="up" delay={0.3} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-cefBlue flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Doctrine and Balance</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Sound biblical teachings addressing theological foundations, correcting errors, and anchoring believers in true Christian balance.
                </p>
              </div>
              <Link href="/production" className="inline-flex items-center gap-1.5 text-xs font-bold text-cefBlue hover:underline pt-2">
                Read Articles <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>

            {/* Segment 3 */}
            <FadeIn direction="up" delay={0.4} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-cefPurple flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Weekend Declaration</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Prophetic decrees, faith confessions, and spiritual framing to position believers for victory throughout the weekend.
                </p>
              </div>
              <Link href="/production" className="inline-flex items-center gap-1.5 text-xs font-bold text-cefPurple hover:underline pt-2">
                View Weekend Word <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>

            {/* Segment 4 */}
            <FadeIn direction="up" delay={0.5} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-cefBlue flex items-center justify-center font-bold">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Interviews & Testimonies</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Deep-dive conversations, life testimonies, and faith journeys highlighting God&apos;s miraculous interventions.
                </p>
              </div>
              <Link href="/production" className="inline-flex items-center gap-1.5 text-xs font-bold text-cefBlue hover:underline pt-2">
                Explore T.H.O.R stories <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>

            {/* Segment 5 */}
            <FadeIn direction="up" delay={0.6} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-cefPurple flex items-center justify-center font-bold">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cloven Tongues of Fire</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Immersive spiritual awakening and intercessory prayer sessions designed to ignite spiritual revival in every home.
                </p>
              </div>
              <Link href="/production" className="inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-cefPurple hover:underline">
                Explore T.H.O.R stories <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TREE 3: MINISTERING LIFE TO THE NEEDY (M.L.T.N) */}
      <section id="mltn" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <FadeIn direction="up" delay={0.1} className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-cefBlue font-bold text-xs sm:text-sm uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-100">
              <HeartHandshake className="w-4 h-4" /> Tree Three
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Ministering Life to the Needy (M.L.T.N)
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              The compassionate outreach arm of CEF. We reach out physically—providing food, clothing, shelter, and educational support—and spiritually to schools, orphanages, and less privileged communities across Ghana.
            </p>
          </FadeIn>

          {/* Outreach Gallery Grid */}
          <FadeIn direction="up" delay={0.2} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Images className="w-5 h-5 text-cefPurple" /> Outreach & Community Gallery
              </h3>
              <span className="text-xs text-gray-500 font-medium">Past Foundation Activities & Outreaches</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-purple-900 to-cefPurple flex items-center justify-center p-6 text-center text-white group">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"></div>
                <div className="relative z-10 space-y-2">
                  <HeartHandshake className="w-10 h-10 mx-auto text-purple-300" />
                  <h4 className="font-bold text-base">Community Support Drive</h4>
                  <p className="text-xs text-purple-100">Ministering physical provisions and the love of Christ to underprivileged families.</p>
                </div>
              </div>

              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-blue-900 to-cefBlue flex items-center justify-center p-6 text-center text-white group">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"></div>
                <div className="relative z-10 space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-blue-200" />
                  <h4 className="font-bold text-base">School & Youth Outreach</h4>
                  <p className="text-xs text-blue-100">Equipping students with educational materials and spiritual mentorship.</p>
                </div>
              </div>

              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-6 text-center text-white group sm:col-span-2 md:col-span-1">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"></div>
                <div className="relative z-10 space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-purple-400" />
                  <h4 className="font-bold text-base">Orphanage Visits</h4>
                  <p className="text-xs text-gray-300">Sharing joy, essentials, and the word of life with children in homes across Accra.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* UNIVERSAL FOOTER */}
      <Footer />
    </div>
  );
}