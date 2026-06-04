import { useState } from "react";
import { BrandLogo } from "../../components/BrandLogo";
import { FormField } from "../../components/FormField";
import { LoginStat } from "../../components/Cards";
import { demoUsers } from "../../data/mockData";
import type { SessionUser } from "../../types/ledger";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (user: SessionUser) => void;
}) {
  const [email, setEmail] = useState("admin@ledger.local");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const matchedUser = demoUsers.find(
      (user) => user.email === email.trim() && user.password === password,
    );

    if (!matchedUser) {
      setError("Invalid email or password.");
      return;
    }

    setError("");
    onLogin({
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#17130f] p-4 text-[#17130f]">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-[#403729] bg-[#fffaf0] shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[#211b15] p-8 text-[#fff7e8] sm:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d6a84f]/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between">
            <div>
              <BrandLogo />

              <p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-[#d6a84f]">
                ACCOUNTS & LEDGER SYSTEM
              </p>

              <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Daily accounting control for business ledger records.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#cdbfae]">
                Manage party balances, SR calculations, commission profit,
                locked daily records, and personal balance from one clean
                dashboard.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <LoginStat label="Parties" value="70–100" />
              <LoginStat label="Access" value="Role based" />
              <LoginStat label="Records" value="Locked" />
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9c6f22]">
              Secure access
            </p>
            <h2 className="mt-3 text-3xl font-black">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-[#756b5c]">
              Use admin or employee demo credentials. Backend authentication
              will replace this mock login later.
            </p>

            <form onSubmit={submitLogin} className="mt-8 grid gap-5">
              <FormField
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="admin@ledger.local"
              />

              <div className="grid gap-2 text-sm font-black text-[#3a3127]">
                <label htmlFor="password">Password</label>

                <div className="flex items-center rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 transition focus-within:border-[#9c6f22]">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="admin123"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#a89c8a]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="ml-3 grid h-9 w-9 place-items-center rounded-xl text-[#756b5c] transition hover:bg-[#efe3cf] hover:text-[#17130f]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="rounded-2xl bg-[#17130f] px-5 py-4 text-sm font-black text-[#fff7e8] shadow-xl shadow-black/15 transition hover:-translate-y-0.5"
              >
                Login to Accounts System
              </button>
            </form>

            <div className="mt-8 grid gap-3 rounded-3xl border border-[#e5d8c4] bg-[#f7ecd9] p-5 text-sm">
              <p className="font-black">Demo credentials</p>
              <p>
                <strong>Admin:</strong> admin@ledger.local / admin123
              </p>
              <p>
                <strong>Employee:</strong> employee@ledger.local / employee123
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
