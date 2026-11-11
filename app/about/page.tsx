"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ShieldCheck, Users, Target, Eye, Tv, ArrowRight, UserPlus } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Philip K. Kpodo",
      role: "Vision Bearer",
      department: "Executive Leadership",
      description: "Spearheads the foundation, receives divine administrative and spiritual burdens, and oversees the execution of the 3 main trees.",
      image: "/team/Philip.jpg",
      accentColor: "border-cefPurple text-cefPurple bg-purple-50",
    },
    {
      name: "Ephraim Queiku Charway",
      role: "Assistant Director to the Vision Bearer",
      department: "Executive Leadership",
      description: "Provides key resource support, operational guidance, and direct executive coordination alongside the Vision Bearer across all foundation strategies.",
      image: "/team/ephraim.jpg",
      accentColor: "border-cefBlue text-cefBlue bg-blue-50",
    },
    {
      name: "Richard Nyame Dadzie",
      role: "Media & IT Director",
      department: "Media & Technology",
      description: "Oversees software engineering, web platforms, media production infrastructure, and digital communications.",
      image: "/team/richard.jpg",
      accentColor: "border-cefPurple text-cefPurple bg-purple-50",
    },
    {
      name: "Irene Gamor",
      role: "Director for Ministering Life To The Needy (M.L.T.N)",
      department: "M.L.T.N Outreach",
      description: "Leads physical and spiritual outreach initiatives for schools, orphanages, and less privileged communities.",
      image: "/team/irene.jpg",
      accentColor: "border-cefBlue text-cefBlue bg-blue-50",
    },
    {
      name: "Ayub Yaw Manful",
      role: "Quality Control Officer",
      department: "Administration & Standards",
      description: "Ensures administrative excellence, operational standards, and quality management across all foundation projects.",
      image: "/team/ayub-2.jpg",
      accentColor: "border-cefPurple text-cefPurple bg-purple-50",
    },
    {
      name: "Caleb Elevine",
      role: "Director for Voice of the Cross (V.O.C)",
      department: "V.O.C Publishing",
      description: "Directs book publishing, spiritual literature creation, and gospel editorial distributions.",
      image: "/team/caleb.jpg",
      accentColor: "border-cefBlue text-cefBlue bg-blue-50",
    },
    {
      name: "Michael Ngorma",
      role: "Sound & Music Director",
      department: "Media & Audio Production",
      description: "Manages audio engineering, live production sound setups, music arrangements, and broadcast mixing.",
      image: "/team/michael.jpeg",
      accentColor: "border-cefPurple text-cefPurple bg-purple-50",
    },
    {
      name: "Wisdom Apenteng",
      role: "Assistant Media Director",
      department: "Media & Publicity",
      description: "Assists with media coverage, video editing, social media management, and event publicity.",
      image: "/team/Wisdom.jpg",
      accentColor: "border-cefBlue text-cefBlue bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* PAGE HEADER HERO */}
      <section className="cef-hero-backdrop relative overflow-hidden text-white py-16 sm:py-24 px-4 text-center">
        <FadeIn direction="up" delay={0.1} className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <span className="bg-white/15 border border-white/20 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase inline-block">
            About Our Ministry
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            The Story & Leadership Behind CEF
          </h1>
          <p className="text-purple-100 text-sm sm:text-lg font-light italic">
            &ldquo;It is all about Jesus. Jesus is Lord.&rdquo;
          </p>
        </FadeIn>
      </section>

      {/* FOUNDATIONAL ORIGIN STORY */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <FadeIn direction="right" delay={0.2} className="space-y-4 sm:space-y-6">
            <div className="inline-block text-cefBlue font-bold text-xs sm:text-sm uppercase tracking-wider bg-blue-50 px-3 py-1 rounded">
              Divine Origins
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Birthed from Divine Encounters & Spiritual Burdens
            </h2>
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
              Indeed, our Lord and master Jesus Christ is the author and finisher of our faith. Christ The Entirety Foundation was created based on direct instruction from our Lord to make His Kingdom come and His will be done on Earth as it is in Heaven.
            </p>
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
              The foundation rests upon two primary spiritual encounters:
            </p>
            <ul className="space-y-2.5 text-gray-600 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-cefPurple">•</span>
                <span><strong>The Voice of the Cross (V.O.C):</strong> Birthed in September 2019 when the Vision Bearer experienced a profound burden from God the Father regarding the lost, leading to inspired writings pointing entirely to the cross.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-cefBlue">•</span>
                <span><strong>Touching the Heart of Realities (T.H.O.R):</strong> Birthed on July 10, 2020, following an intense prayer vision of deliverance, healing, and angelic encounters commanding video interviews to prove the reality of God.</span>
              </li>
            </ul>
          </FadeIn>

          <FadeIn direction="left" delay={0.3} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-purple-100 space-y-5">
            <h3 className="text-xl sm:text-2xl font-bold text-cefPurple flex items-center gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-cefBlue" /> Mission & Vision Statements
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm text-gray-700">
              <div className="bg-purple-50 p-3.5 sm:p-4 rounded-xl border border-purple-100">
                <h4 className="font-bold text-cefPurple mb-1 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Our Vision</h4>
                <p>Turning the heart of the lost back to the Father and reconciling the children of God unto God through Jesus Christ by operationalizing the 3 main trees.</p>
              </div>
              <div className="bg-blue-50 p-3.5 sm:p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-cefBlue mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Our Mission</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Perfecting the children of God through the Word.</li>
                  <li>Ministering both physical and spiritual needs to the needy.</li>
                  <li>Litigating and legislating the pure doctrines of our Lord Jesus Christ.</li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* LEADERSHIP & EXECUTIVE TEAM */}
      <section className="py-14 sm:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0.1} className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-cefPurple">Executive Leadership & Team</h2>
            <p className="text-gray-600 text-xs sm:text-base">Operationalized through dedicated officers under the philosophy that <em>TEAM</em> means <strong>Together Everyone Achieves More</strong>.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10 sm:mb-12">
            {teamMembers.map((member, index) => (
              <FadeIn key={index} direction="up" delay={0.1 * (index % 4)}>
                <div className={`bg-white p-6 sm:p-8 rounded-3xl shadow-lg border-t-4 ${member.accentColor.split(' ')[0]} flex flex-col items-center text-center sm:flex-row sm:text-left gap-6 sm:gap-8 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1`}>
                  
                  {/* LARGER PORTRAIT PHOTO CONTAINER */}
                  <div className={`relative h-44 w-36 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-purple-50 shadow-md sm:h-52 sm:w-44 ${member.accentColor}`}>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
                    >
                      {member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                    </span>
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(min-width: 640px) 176px, 144px"
                        quality={75}
                        loading="lazy"
                        className="object-cover object-top transition duration-300 hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2.5 flex-1">
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${member.accentColor} px-3 py-1 rounded-md inline-block shadow-sm`}>
                      {member.role}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{member.name}</h3>
                    <p className="text-xs font-semibold text-cefBlue uppercase tracking-wider">{member.department}</p>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed pt-1">
                      {member.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* DEPARTMENTS SUMMARY */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <FadeIn direction="right" delay={0.2} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-cefPurple" /> Media, Sound & Technology Department
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Manages software development, video production, live broadcast audio engineering, social media handles, survey coverage, and public broadcasting.
                </p>
              </div>
              <div>
                <Link 
                  href="/contact" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-50 hover:bg-cefPurple text-cefPurple hover:text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl border border-purple-200 transition"
                >
                  Join Department <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.3} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cefBlue" /> Outreach & Administration Department
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Coordinates physical support for orphanages and schools, maintains organizational quality control standards, and oversees financial reporting.
                </p>
              </div>
              <div>
                <Link 
                  href="/contact" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-cefBlue text-cefBlue hover:text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl border border-blue-200 transition"
                >
                  Join Department <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* JOIN OUR COMMUNITY SECTION */}
      <section className="cef-hero-backdrop relative overflow-hidden py-14 sm:py-20 text-white text-center px-4">
        <FadeIn direction="up" delay={0.1} className="max-w-3xl mx-auto space-y-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Join Our Community & Partner With Us
          </h2>
          <p className="text-purple-100 text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
            Whether you want to volunteer, join a department, or support our outreach programs for the needy, your hands can help spread the message of the cross.
          </p>
          <div className="pt-2 flex justify-center">
            <Link 
              href="/contact" 
              className="w-full sm:w-auto bg-white text-cefPurple hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Register & Join <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}