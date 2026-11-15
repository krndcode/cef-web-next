import type { LucideIcon } from "lucide-react";

type AuthHeadingProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
};

export default function AuthHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: AuthHeadingProps) {
  return (
    <div className="mb-6 space-y-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-cefPurple ring-1 ring-purple-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cefBlueInk">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-gray-950 sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      </div>
    </div>
  );
}
