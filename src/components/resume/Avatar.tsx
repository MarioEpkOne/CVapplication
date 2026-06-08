"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src: string;
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ src, name, size = 96 }: AvatarProps) {
  const [error, setError] = useState(false);
  const initials = getInitials(name);

  if (error) {
    // Tasteful initials fallback — never breaks layout or PDF
    return (
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-300 text-brand-800 font-bold text-xl flex-shrink-0 sm:h-24 sm:w-24"
        aria-label={`${name} avatar — initials`}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} photo`}
      width={size}
      height={size}
      className="h-16 w-16 rounded-full object-cover flex-shrink-0 sm:h-24 sm:w-24"
      onError={() => setError(true)}
      priority
    />
  );
}
