import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Logo */}
        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
          <Image
            src="/logo.png"
            alt="Mortis Atlas"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-[#8AFF53] via-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
            Mortis Atlas
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg text-neutral-400 sm:text-xl">
          VC Fund Management Platform
        </p>

        {/* Description */}
        <p className="max-w-2xl text-sm text-neutral-500">
          Track deal flow, manage portfolio companies, and gain insights across
          your entire investment lifecycle.
        </p>

        {/* CTA Button */}
        <div className="mt-4">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </div>

        {/* Footer accent */}
        <div className="mt-16 flex items-center gap-2 text-xs text-neutral-600">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8AFF53]" />
          <span>Solving Humanity&apos;s Greatest Problems</span>
          <div className="h-px w-12 bg-gradient-to-r from-[#A855F7] to-transparent" />
        </div>
      </div>
    </main>
  );
}
