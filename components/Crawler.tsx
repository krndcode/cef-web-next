"use client";

import { Sparkles } from "lucide-react";

export default function Crawler() {
  return (
    <div className="bg-cefPurple text-white py-2.5 overflow-hidden border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="whitespace-nowrap animate-marquee">
        <div className="inline-flex items-center gap-2 text-xs md:text-sm font-medium px-4">
          <Sparkles className="w-4 h-4 text-cefBlue flex-shrink-0 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-cefBlue">
            Core Script for the Foundation — Isaiah 2:2-5 (KJV):
          </span>
          <span>
            &ldquo;And it shall come to pass in the last days, that the mountain of the LORD&apos;S house shall be established in the top of the mountains, and shall be exalted above the hills; and all nations shall flow unto it. And many people shall go and say, Come ye, and let us go up to the mountain of the LORD... for out of Zion shall go forth the law, and the word of the LORD from Jerusalem... O house of Jacob, come ye, and let us walk in the light of the LORD.&rdquo;
          </span>
        </div>
      </div>
    </div>
  );
}