"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { daysUntilElection } from "@/lib/utils";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold font-display text-white border border-white/10">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs text-gray-400 mt-1.5 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function HeroSection() {
  const electionDate = new Date("2027-04-25T08:00:00");
  const countdown = useCountdown(electionDate);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 bg-dark-900">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#002395]/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#ED2939]/8 blur-[100px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-gray-300 border border-white/10 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#ED2939] animate-pulse" />
          <span>Élection présidentielle française • Avril 2027</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Présidentielle</span>
          <br />
          <span className="gradient-text">2027</span>
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Suivez en temps réel la course à l&apos;Élysée. Candidats, sondages,
          programmes et actualités pour vous forger une opinion éclairée.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/candidats"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#002395] hover:bg-[#002395]/80 text-white font-semibold transition-all duration-200 glow-blue"
          >
            Voir les candidats
            <ChevronRight size={18} />
          </Link>
          <Link
            href="/sondages"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl glass border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          >
            <TrendingUp size={18} />
            Sondages
          </Link>
        </div>

        {/* Countdown */}
        <div className="inline-block">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">
            Temps avant le 1er tour
          </p>
          <div className="flex items-center gap-3">
            <CountdownUnit value={countdown.days} label="Jours" />
            <span className="text-2xl text-gray-500 font-light pb-5">:</span>
            <CountdownUnit value={countdown.hours} label="Heures" />
            <span className="text-2xl text-gray-500 font-light pb-5">:</span>
            <CountdownUnit value={countdown.minutes} label="Minutes" />
            <span className="text-2xl text-gray-500 font-light pb-5">:</span>
            <CountdownUnit value={countdown.seconds} label="Secondes" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-2.5 rounded-full bg-white/60 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
