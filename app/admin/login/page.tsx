"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#002395]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#ED2939]/8 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <div className="flex w-full h-full">
              <div className="flex-1 bg-[#002395]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#ED2939]" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Administration
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Présidentielle 2027
          </p>
        </div>

        {/* Form */}
        <div className="glass-dark rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-[#002395]/20">
              <Lock size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Connexion</h2>
              <p className="text-xs text-gray-400">Accès réservé aux administrateurs</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all text-sm"
                placeholder="admin@exemple.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center py-3"
              size="lg"
            >
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
