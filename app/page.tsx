"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Tv,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 py-20 text-center sm:min-h-[90vh] sm:py-24">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <Image
            src="/hero-image.jpg"
            alt=""
            fill
            preload
            sizes="100vw"
            className="object-cover opacity-40 sm:opacity-50"
          />
        </div>

        <div className="absolute inset-0 cef-hero-overlay z-10"></div>

        <div className="relative z-20 mx-auto max-w-5xl space-y-6 text-white sm:space-y-7">
          <span className="inline-block rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md sm:text-sm">
            2 Corinthians 1:3 • Habakkuk 2:2
          </span>
          <h1 className="px-2 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Perfecting the Children of God Through His Word
          </h1>
          <p className="text-xl font-light italic text-purple-100 sm:text-2xl">
            &ldquo;It is all about Jesus. Jesus is Lord.&rdquo;
          </p>
          <p className="mx-auto max-w-3xl px-2 text-base leading-relaxed text-gray-200 sm:text-lg">
            Indeed, our Lord and master Jesus Christ is the author and finisher of our faith. He is the Alpha and Omega—everything consists by Him.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 px-4 pt-3 sm:flex-row sm:pt-5">
            <Link href="#pillars" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-cefPurple shadow-lg transition hover:scale-105 hover:bg-gray-100 sm:w-auto sm:text-lg">
              Explore Our Mission <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/give-partner" className="w-full rounded-xl border-2 border-white/80 px-8 py-4 text-center text-base font-bold text-white transition hover:scale-105 hover:bg-white hover:text-cefPurple sm:w-auto sm:text-lg">
              Give & Partner
            </Link>
          </div>
          <a
            href="#about"
            className="mx-auto inline-flex items-center gap-2 pt-3 text-sm font-medium text-white/80 transition hover:text-white sm:text-base"
          >
            Discover our story <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section aria-label="Explore the foundation" className="border-b border-purple-100 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-purple-100 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <a href="#about" className="group flex items-center gap-4 px-3 py-5 transition hover:bg-purple-50/60 sm:px-6 sm:py-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-cefPurple transition group-hover:bg-purple-100">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold text-gray-900 sm:text-lg">Our story</span>
              <span className="mt-1 block text-sm text-gray-600">The vision behind CEF</span>
            </span>
            <ArrowRight className="ml-auto h-5 w-5 text-cefPurple transition group-hover:translate-x-1" />
          </a>
          <a href="#pillars" className="group flex items-center gap-4 px-3 py-5 transition hover:bg-blue-50/60 sm:px-6 sm:py-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-cefBlue transition group-hover:bg-blue-100">
              <BookOpen className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold text-gray-900 sm:text-lg">Three main trees</span>
              <span className="mt-1 block text-sm text-gray-600">How the mission takes shape</span>
            </span>
            <ArrowRight className="ml-auto h-5 w-5 text-cefBlue transition group-hover:translate-x-1" />
          </a>
          <Link href="/contact" className="group flex items-center gap-4 px-3 py-5 transition hover:bg-purple-50/60 sm:px-6 sm:py-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-cefPurple transition group-hover:bg-purple-100">
              <Users className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold text-gray-900 sm:text-lg">Get involved</span>
              <span className="mt-1 block text-sm text-gray-600">Find your place in the work</span>
            </span>
            <ArrowRight className="ml-auto h-5 w-5 text-cefPurple transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ABOUT SUMMARY */}
      <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 sm:gap-14">
          <FadeIn direction="right" delay={0.2} className="space-y-5 sm:space-y-7">
            <div className="inline-block rounded bg-blue-50 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-cefBlue">
              Divine Mandate
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Founded on Divine Instructions to Make His Kingdom Come
            </h2>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              Christ The Entirety Foundation was created based on direct instruction from our Lord and Master Jesus Christ. Spearheaded by Vision Bearer <strong>Philip K. Kpodo-Kwakutse</strong> alongside Assistant Director <strong>Ephraim Queiku Charway</strong>, our operations are driven by a dedicated team where <em>Together Everyone Achieves More (TEAM)</em>.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <span className="block text-3xl font-extrabold text-cefPurple sm:text-4xl">3</span>
                <span className="mt-1 block text-sm font-medium text-gray-600 sm:text-base">Main ministry trees</span>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <span className="block text-3xl font-extrabold text-cefBlue sm:text-4xl">Jesus</span>
                <span className="mt-1 block text-sm font-medium text-gray-600 sm:text-base">At the heart of it all</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.3} className="space-y-6 rounded-2xl border border-purple-100 bg-gradient-to-br from-cefPurple/10 to-cefBlue/10 p-7 sm:rounded-3xl sm:p-10">
            <h3 className="flex items-center gap-3 text-2xl font-bold text-cefPurple sm:text-3xl">
              <ShieldCheck className="h-7 w-7 shrink-0 text-cefBlue" /> Mission & Vision
            </h3>
            <ul className="space-y-5 text-base leading-relaxed text-gray-700 sm:text-lg">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-cefPurple"></span>
                <span><strong>Vision:</strong> Turning the heart of the lost back to the Father and reconciling God&apos;s children unto Him through the three main trees.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-cefBlue"></span>
                <span><strong>Mission:</strong> Perfecting the children of God and ministering to physical and spiritual needs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-700"></span>
                <span><strong>Our calling:</strong> Upholding and sharing the teachings of Jesus Christ.</span>
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* THE THREE MAIN TREES */}
      <section id="pillars" className="scroll-mt-24 bg-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0.1} className="mx-auto mb-12 max-w-3xl space-y-4 text-center sm:mb-16">
            <span className="inline-block rounded bg-purple-50 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-cefPurple">Our work</span>
            <h2 className="text-3xl font-extrabold text-cefPurple sm:text-4xl lg:text-5xl">The Three Main Trees</h2>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">Three connected expressions of one mission: sharing the Word, bearing witness, and caring for people.</p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3 sm:gap-8">
            <FadeIn direction="up" delay={0.2} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="space-y-4 p-7 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-cefPurple transition hover:scale-110">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">The Voice of the Cross (V.O.C)</h3>
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                  The book aspect of the foundation. Inspired by the Holy Spirit in September 2019 to communicate spiritual needs and salvation to the lost.
                </p>
              </div>
              <div className="flex items-center justify-between px-7 pb-7 sm:px-9 sm:pb-9">
                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-sm font-semibold text-cefPurple">Books & publishing</span>
                <Link href="/trees" aria-label="Learn more about Voice of the Cross" className="rounded-full p-2 text-cefPurple transition hover:bg-purple-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="space-y-4 p-7 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-cefBlue transition hover:scale-110">
                  <Tv className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Touching the Heart of Realities (T.H.O.R)</h3>
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                  A TV series featuring video interviews and testimonies proving the reality of God and kingdom principles (giving, faith, salvation).
                </p>
              </div>
              <div className="flex items-center justify-between px-7 pb-7 sm:px-9 sm:pb-9">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-cefBlue">Video & media</span>
                <Link href="/production" aria-label="Watch Touching the Heart of Realities" className="rounded-full p-2 text-cefBlue transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefBlue">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.4} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="space-y-4 p-7 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-cefPurple transition hover:scale-110">
                  <HeartHandshake className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Ministering Life to the Needy (M.L.T.N)</h3>
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                  Reaching out physically (food, shelter, clothing, sponsorships) and spiritually to schools, orphanages, and less privileged communities.
                </p>
              </div>
              <div className="flex items-center justify-between px-7 pb-7 sm:px-9 sm:pb-9">
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">Community outreach</span>
                <Link href="/give-partner" aria-label="Support Ministering Life to the Needy" className="rounded-full p-2 text-cefPurple transition hover:bg-purple-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <FadeIn direction="up" className="cef-hero-backdrop relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100">
              <HeartHandshake className="h-4 w-4" /> Your next step
            </span>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Be part of what God is doing
            </h2>
            <p className="text-base leading-relaxed text-purple-100 sm:text-lg">
              Whether you want to volunteer, connect with a department, or support the mission, there is a place for you in the work.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-cefPurple shadow transition hover:scale-105 hover:bg-gray-100">
                Get in touch <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/give-partner" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-7 py-4 text-base font-bold text-white transition hover:bg-white hover:text-cefPurple">
                Give & Partner <HeartHandshake className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}