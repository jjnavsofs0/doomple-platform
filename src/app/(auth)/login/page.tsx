"use client";

import { Suspense, useState, useEffect } from "react";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrlParam = searchParams.get("callbackUrl");
  const callbackPath =
    callbackUrlParam && callbackUrlParam.startsWith("/") ? callbackUrlParam : "/admin";

  const submitCredentials = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const session = await getSession();
        const role = session?.user?.role || "";
        const fallbackPath = role === "CLIENT" ? "/portal" : "/admin";
        const destination =
          callbackUrlParam && callbackUrlParam.startsWith("/")
            ? callbackPath
            : fallbackPath;

        window.location.assign(destination);
        return;
      }

      setError("Unable to sign in. Please try again.");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Invalid credentials. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#031B37_0%,#08274A_42%,#F4F7FB_42%,#F4F7FB_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[28px] border border-white/10 bg-white/5 p-10 text-white shadow-2xl backdrop-blur lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-[#7CE6DA]">
            <Sparkles className="h-4 w-4" />
            Client workspace and admin operations
          </div>
          <h1 className="mt-6 max-w-lg text-5xl font-bold leading-tight">
            Sign in to manage delivery, projects, invoices, and client communication.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            One secure access point for Doomple admins and clients, with role-aware routing after sign in.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Track projects, invoices, files, and payment status in one place.",
              "Route client users into the portal and internal teams into admin automatically.",
              "Keep delivery updates and approvals moving with less back-and-forth.",
              "Use a cleaner, more premium sign-in experience that matches the brand.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0B2E55]/70 p-5">
                <div className="mb-3 inline-flex rounded-xl bg-white/10 p-2 text-[#7CE6DA]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1ABFAD] to-[#3BB2F6] p-3 shadow-lg shadow-cyan-500/20">
                <span className="text-xl font-bold text-white">D</span>
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.28em] text-[#1ABFAD]">
                Secure Access
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#042042]">Welcome to Doomple</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Enter your credentials to continue to the right workspace.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#DCE6F3] bg-white p-8 shadow-[0_30px_80px_rgba(4,32,66,0.10)] sm:p-10">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1ABFAD]">
                  Account Sign In
                </p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Admin users go to the operations console. Client users go to the portal automatically.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#374151]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[#94A3B8]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-[#D7E3F0] bg-[#F8FBFF] py-3 pl-12 pr-4 text-[#042042] outline-none transition-all focus:border-[#1ABFAD] focus:bg-white focus:ring-2 focus:ring-[#1ABFAD]/20 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#374151]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[#94A3B8]" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-[#D7E3F0] bg-[#F8FBFF] py-3 pl-12 pr-4 text-[#042042] outline-none transition-all focus:border-[#1ABFAD] focus:bg-white focus:ring-2 focus:ring-[#1ABFAD]/20 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void submitCredentials();
                  }}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#042042] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#07315F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 h-px bg-[#E5EDF5]" />

              <div className="space-y-2 text-center text-sm text-[#6B7280]">
                <p>
                  Need access?{" "}
                  <Link href="/contact" className="font-medium text-[#1ABFAD] hover:text-[#15a89a]">
                    Contact our team
                  </Link>
                </p>
                <p>
                  <Link href="/" className="text-[#64748B] hover:text-[#042042]">
                    Back to homepage
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-[#94A3B8]">
              <p>&copy; 2026 Doomple Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}
