"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}


function getTimeLeft(launchDate: string): TimeLeft {
  const diff = new Date(launchDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function ComingSoon({ launchDate }: { launchDate: string }) {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(launchDate));
    const timer = setInterval(() => {
      setTime(getTimeLeft(launchDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { value: pad(time.days), label: "Days" },
    { value: pad(time.hours), label: "Hours" },
    { value: pad(time.minutes), label: "Mins" },
    { value: pad(time.seconds), label: "Secs" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Decorative lines */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "80%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "15%", width: 1, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.04), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: "15%", width: 1, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.04), transparent)", pointerEvents: "none" }} />

      {/* Big background APEX text */}
      <div aria-hidden style={{
        position: "absolute",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(120px, 25vw, 400px)",
        color: "rgba(255,255,255,0.02)",
        letterSpacing: "-0.02em",
        userSelect: "none",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 0,
      }}>
        APEX
      </div>

      {/* Main content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        width: "100%",
        maxWidth: 1000,
      }}>

        {/* Logo */}
        <div style={{ width: 48, height: 68, position: "relative", marginBottom: "3rem", opacity: 0.9 }}>
          <Image src="/White.png" alt="APEX SOLES" fill style={{ objectFit: "contain" }} priority unoptimized />
        </div>

        {/* Label */}
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <span style={{ display: "block", width: 40, height: 1, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ffffff", marginRight: 4, flexShrink: 0 }} />
          Something big is dropping
          <span style={{ display: "block", width: 40, height: 1, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(56px, 12vw, 140px)",
          color: "#ffffff",
          letterSpacing: "-0.01em",
          lineHeight: 0.9,
          marginBottom: "0.5rem",
          fontWeight: 400,
        }}>
          APEX SOLES
        </h1>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(36px, 7vw, 80px)",
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "-0.01em",
          lineHeight: 0.9,
          marginBottom: "4rem",
          fontWeight: 400,
        }}>
          GHANA
        </h2>

        {/* Countdown — only renders client-side to avoid hydration mismatch */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "clamp(12px, 3vw, 40px)",
          marginBottom: "4rem",
          minHeight: "clamp(120px, 22vw, 230px)",
        }}>
          {mounted ? units.map((unit, i) => (
            <div key={unit.label} style={{ display: "flex", alignItems: "flex-start", gap: "clamp(12px, 3vw, 40px)" }}>
              {i > 0 && (
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(48px, 10vw, 120px)",
                  color: "rgba(255,255,255,0.15)",
                  lineHeight: 1,
                  marginTop: "clamp(4px, 1vw, 12px)",
                  display: "block",
                }}>
                  :
                </span>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                  }} />
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(72px, 14vw, 170px)",
                    color: "#ffffff",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    display: "block",
                    minWidth: "clamp(80px, 16vw, 190px)",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {unit.value}
                  </span>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.25em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {unit.label}
                </span>
              </div>
            </div>
          )) : null}
        </div>

        {/* Divider */}
        <div style={{
          width: "100%",
          maxWidth: 600,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          marginBottom: "2.5rem",
        }} />

        {/* Launch date */}
        <p style={{
          fontSize: 13,
          fontWeight: 300,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "2.5rem",
          fontFamily: "'Inter', sans-serif",
        }}>
          Launching{" "}
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            Tuesday, March 24 · 2026
          </span>
          {" "}· Accra, Ghana
        </p>

        {/* Socials */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[
            { label: "Instagram", href: "https://www.instagram.com/apexsoles.gh" },
            { label: "TikTok", href: "https://www.tiktok.com/@apexsolesgh" },
            { label: "Snapchat", href: "https://snapchat.com/t/lF9kjWNu" },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {i > 0 && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {s.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
          © 2026 Apex Soles GH
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 20, height: 3, borderRadius: 2, background: "#006B3F" }} />
          <div style={{ width: 20, height: 3, borderRadius: 2, background: "#FCD116" }} />
          <div style={{ width: 20, height: 3, borderRadius: 2, background: "#CE1126" }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
          apexsolesgh.com
        </span>
      </div>
    </div>
  );
}