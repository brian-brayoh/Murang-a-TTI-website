"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Popup } from "@/lib/home";
import { waHref } from "@/lib/contact-links";

const voices = [
  { label: "English (United States)", lang: "en-US" },
  { label: "English (United Kingdom)", lang: "en-GB" },
  { label: "Swahili (Kenya)", lang: "sw-KE" },
];

export default function WelcomeModal({ popup, version, whatsapp }: { popup: Popup; version: string; whatsapp: string }) {
  const { headline: HEADLINE, notice: NOTICE, welcome: WELCOME } = popup;
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // How often it shows is set in Admin > Home page. Editing the message shows it again to everyone.
  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    const KEY = "mtti-welcome";
    const DAY = 24 * 60 * 60 * 1000;
    const gap = popup.frequency === "daily" ? DAY : popup.frequency === "weekly" ? 7 * DAY : 0;
    let show = true;
    try {
      if (popup.frequency === "session") {
        show = sessionStorage.getItem(KEY) !== version;
        if (show) sessionStorage.setItem(KEY, version);
      } else if (gap) {
        const seen = JSON.parse(localStorage.getItem(KEY) || "null");
        show = !(seen && seen.v === version && Date.now() - seen.t < gap);
        if (show) localStorage.setItem(KEY, JSON.stringify({ v: version, t: Date.now() }));
      }
    } catch {}
    if (show) setOpen(true);
  }, [popup.frequency, version]);

  function close() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function speak() {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(`${HEADLINE}. ${NOTICE} Welcome to Murang'a Technical Training Institute, ${WELCOME}`);
    u.lang = lang;
    const match =
      synth.getVoices().find((v) => v.lang.replace("_", "-") === lang) ||
      synth.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) u.voice = match;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.cancel();
    synth.speak(u);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/70 px-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="relative w-full max-w-lg bg-paper border-t-4 border-accent shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 h-8 w-8 text-2xl leading-none text-steel hover:text-brand-700"
        >
          &times;
        </button>

        <div className="px-7 pt-8 pb-6">
          <p className="tick text-accent-dark font-mono text-sm">{HEADLINE}</p>
          <p className="mt-3 text-sm text-steel leading-relaxed">{NOTICE}</p>

          <h2
            id="welcome-title"
            className="mt-6 font-display font-semibold text-2xl text-brand-700"
          >
            Welcome to Murang&apos;a TTI
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{WELCOME}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref(whatsapp, "Hello MTTI, I want to apply")}
              className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors"
            >
              WhatsApp us
            </a>
            <Link
              href="/admissions"
              onClick={close}
              className="bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors"
            >
              Apply now
            </Link>
          </div>
        </div>

        {canSpeak && (
          <div className="border-t border-paper-line px-7 py-3 flex flex-wrap items-center gap-3 text-sm">
            <button
              onClick={speak}
              className="flex items-center gap-2 font-medium text-brand-700 hover:text-accent-dark"
              aria-pressed={speaking}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
              {speaking ? "Stop" : "Listen"}
            </button>
            <label className="sr-only" htmlFor="voice">Select voice</label>
            <select
              id="voice"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="border border-paper-line bg-white px-2 py-1.5 text-xs"
            >
              {voices.map((v) => (
                <option key={v.lang} value={v.lang}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
