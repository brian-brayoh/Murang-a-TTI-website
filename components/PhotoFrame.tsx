"use client";

import { useState } from "react";

// Photo with an intentional fallback: if the image is missing or fails to
// load, a blueprint-grid tile with the department monogram shows instead.
export default function PhotoFrame({
  src,
  alt,
  caption,
  label,
}: {
  src?: string;
  alt: string;
  caption?: string;
  label: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;

  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden border border-paper-line bg-brand-200/40">
        <div className="absolute inset-0 blueprint-grid-dark" aria-hidden />
        {!show && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display font-semibold text-7xl text-brand-700/20">
              {label
                .split(/[\s&]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}
        {show && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span className="absolute left-0 top-0 h-1 w-16 bg-accent" />
      </div>
      {caption && show && (
        <figcaption className="mt-2 font-mono text-xs text-steel">{caption}</figcaption>
      )}
    </figure>
  );
}
