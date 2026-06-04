import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type Role = "admin" | "employee";
type View = "dashboard" | "ledger" | "personal" | "reports";

type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

type Ledger = {
  date: string;
  debit: number;
  credit: number;
  srAmount: number;
  marketRate: number;
  givenRate: number;
  commissionRate: number;
  rdCharge: number;
  others: number;
  locked: boolean;
};

type Party = {
  id: number;
  name: string;
  phone: string;
  openingBalance: number;
  active: boolean;
  ledger: Ledger;
};

type PersonalEntry = {
  id: number;
  title: string;
  date: string;
  amount: number;
  note: string;
};

type LedgerCalculation = {
  closingBalance: number;
  srProfit: number;
  commissionProfit: number;
  totalProfit: number;
};

type LedgerRow = Party & {
  calc: LedgerCalculation;
};

type DashboardTotals = {
  rows: LedgerRow[];
  partySubtotal: number;
  personalBalance: number;
  todayCredit: number;
  todayDebit: number;
  todayProfit: number;
  totalBalance: number;
  lockedCount: number;
};

const today = new Date().toISOString().slice(0, 10);

const demoUsers: Array<SessionUser & { password: string }> = [
  {
    name: "Business Owner",
    email: "admin@ledger.local",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Ledger Employee",
    email: "employee@ledger.local",
    password: "employee123",
    role: "employee",
  },
];

const initialParties: Party[] = [
  {
    id: 1,
    name: "Party A",
    phone: "01700000001",
    openingBalance: 10000,
    active: true,
    ledger: {
      date: today,
      debit: 2500,
      credit: 5000,
      srAmount: 100,
      marketRate: 31.2,
      givenRate: 30.8,
      commissionRate: 1,
      rdCharge: 120,
      others: 0,
      locked: false,
    },
  },
  {
    id: 2,
    name: "Party B",
    phone: "01700000002",
    openingBalance: -2500,
    active: true,
    ledger: {
      date: today,
      debit: 1000,
      credit: 500,
      srAmount: 50,
      marketRate: 31.1,
      givenRate: 30.9,
      commissionRate: 0.75,
      rdCharge: 80,
      others: 0,
      locked: false,
    },
  },
  {
    id: 3,
    name: "Party C",
    phone: "01700000003",
    openingBalance: 7500,
    active: true,
    ledger: {
      date: today,
      debit: 0,
      credit: 2000,
      srAmount: 0,
      marketRate: 0,
      givenRate: 0,
      commissionRate: 0,
      rdCharge: 0,
      others: 0,
      locked: false,
    },
  },
];

const initialPersonalEntries: PersonalEntry[] = [
  {
    id: 1,
    title: "Owner Deposit",
    date: today,
    amount: 25000,
    note: "Personal balance top-up",
  },
  {
    id: 2,
    title: "Home Rent",
    date: today,
    amount: -12000,
    note: "Monthly personal expense",
  },
  {
    id: 3,
    title: "School Fee",
    date: today,
    amount: -4500,
    note: "Personal expense",
  },
];

const formatBDT = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function calculateLedger(party: Party): LedgerCalculation {
  const ledger = party.ledger;

  // Client-confirmed rule for demo:
  // Credit = addition, Debit = subtraction.
  const closingBalance =
    safeNumber(party.openingBalance) +
    safeNumber(ledger.credit) -
    safeNumber(ledger.debit);

  const srProfit =
    (safeNumber(ledger.marketRate) - safeNumber(ledger.givenRate)) *
    safeNumber(ledger.srAmount);

  const commissionProfit =
    safeNumber(ledger.debit) * (safeNumber(ledger.commissionRate) / 100);

  const totalProfit =
    srProfit +
    commissionProfit +
    safeNumber(ledger.rdCharge) +
    safeNumber(ledger.others);

  return {
    closingBalance,
    srProfit,
    commissionProfit,
    totalProfit,
  };
}

function getBalanceStatus(value: number) {
  if (value > 0) {
    return {
      label: "Receivable",
      description: "Party owes business",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    };
  }

  if (value < 0) {
    return {
      label: "Advance",
      description: "Business owes party",
      badge: "bg-rose-100 text-rose-700 border-rose-200",
      text: "text-rose-700",
      bar: "bg-rose-500",
    };
  }

  return {
    label: "Settled",
    description: "No due balance",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    text: "text-slate-700",
    bar: "bg-slate-400",
  };
}

export default function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [personalEntries, setPersonalEntries] = useState<PersonalEntry[]>(
    initialPersonalEntries,
  );
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState({
    name: "",
    phone: "",
    openingBalance: "",
  });
  const [newPersonal, setNewPersonal] = useState({
    title: "",
    amount: "",
    note: "",
  });

  const isAdmin = sessionUser?.role === "admin";

  const totals = useMemo<DashboardTotals>(() => {
    const rows = parties
      .filter((party) => party.active)
      .map((party) => ({
        ...party,
        calc: calculateLedger(party),
      }));

    const partySubtotal = rows.reduce(
      (sum, party) => sum + party.calc.closingBalance,
      0,
    );

    const personalBalance = personalEntries.reduce(
      (sum, entry) => sum + safeNumber(entry.amount),
      0,
    );

    const todayCredit = rows.reduce(
      (sum, party) => sum + safeNumber(party.ledger.credit),
      0,
    );

    const todayDebit = rows.reduce(
      (sum, party) => sum + safeNumber(party.ledger.debit),
      0,
    );

    const todayProfit = rows.reduce(
      (sum, party) => sum + safeNumber(party.calc.totalProfit),
      0,
    );

    const lockedCount = rows.filter((party) => party.ledger.locked).length;

    return {
      rows,
      partySubtotal,
      personalBalance,
      todayCredit,
      todayDebit,
      todayProfit,
      totalBalance: partySubtotal + personalBalance,
      lockedCount,
    };
  }, [parties, personalEntries]);

  const updateLedger = (
    partyId: number,
    field: keyof Ledger,
    value: string,
  ) => {
    if (!isAdmin) return;

    setParties((previous) =>
      previous.map((party) => {
        if (party.id !== partyId || party.ledger.locked) return party;

        return {
          ...party,
          ledger: {
            ...party.ledger,
            [field]: safeNumber(value),
          },
        };
      }),
    );
  };

  const closeDay = (partyId: number) => {
    if (!isAdmin) return;

    setParties((previous) =>
      previous.map((party) =>
        party.id === partyId
          ? {
              ...party,
              ledger: {
                ...party.ledger,
                locked: true,
              },
            }
          : party,
      ),
    );
  };

  const addParty = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !newParty.name.trim()) return;

    const nextParty: Party = {
      id: Date.now(),
      name: newParty.name.trim(),
      phone: newParty.phone.trim(),
      openingBalance: safeNumber(newParty.openingBalance),
      active: true,
      ledger: {
        date: today,
        debit: 0,
        credit: 0,
        srAmount: 0,
        marketRate: 0,
        givenRate: 0,
        commissionRate: 0,
        rdCharge: 0,
        others: 0,
        locked: false,
      },
    };

    setParties((previous) => [...previous, nextParty]);
    setNewParty({ name: "", phone: "", openingBalance: "" });
    setShowAddParty(false);
  };

  const addPersonalEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !newPersonal.title.trim()) return;

    setPersonalEntries((previous) => [
      {
        id: Date.now(),
        title: newPersonal.title.trim(),
        date: today,
        amount: safeNumber(newPersonal.amount),
        note: newPersonal.note.trim(),
      },
      ...previous,
    ]);

    setNewPersonal({ title: "", amount: "", note: "" });
  };

  if (!sessionUser) {
    return <LoginScreen onLogin={setSessionUser} />;
  }

  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#17130f]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[310px] shrink-0 border-r border-[#2b241b] bg-[#17130f] text-[#f8efe0] xl:flex xl:flex-col">
          <div className="p-7">
            <div className="rounded-[2rem] border border-[#403729] bg-[#211b15] p-5">
              <div className="flex items-center gap-4">
                <BrandLogo compact />
                <div>
                  <h1 className="text-lg font-black leading-tight tracking-tight">
                    Accounts and Ledger System
                  </h1>
                  <p className="text-sm text-[#b8ab99]">
                    Daily balance control
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#403729] bg-[#17130f] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#b8ab99]">
                  Signed in
                </p>
                <p className="mt-2 font-black">{sessionUser.name}</p>
                <p className="mt-1 text-sm capitalize text-[#d6a84f]">
                  {sessionUser.role}
                </p>
              </div>
            </div>

            <nav className="mt-8 grid gap-2">
              <NavButton
                active={view === "dashboard"}
                onClick={() => setView("dashboard")}
                code="01"
                label="Control Dashboard"
              />
              <NavButton
                active={view === "ledger"}
                onClick={() => setView("ledger")}
                code="02"
                label="Daily Ledger Desk"
              />
              <NavButton
                active={view === "personal"}
                onClick={() => setView("personal")}
                code="03"
                label="Personal Balance"
              />
              <NavButton
                active={view === "reports"}
                onClick={() => setView("reports")}
                code="04"
                label="Reports Archive"
              />
            </nav>
          </div>

          <div className="mt-auto p-7">
            <div className="rounded-[2rem] border border-[#403729] bg-[#211b15] p-5">
              <p className="text-sm font-black text-[#f8efe0]">
                {isAdmin ? "Admin privileges" : "Employee view"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#b8ab99]">
                {isAdmin
                  ? "You can create parties, update ledgers, and close daily records."
                  : "You can view summaries and reports only. Editing is locked."}
              </p>
              <button
                onClick={() => {
                  setSessionUser(null);
                  setView("dashboard");
                }}
                className="mt-5 w-full rounded-2xl border border-[#403729] px-4 py-3 text-sm font-black text-[#f8efe0] transition hover:bg-[#2b241b]"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#ded3c1] bg-[#f4efe6]/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9c6f22]">
                  Business Date · {today}
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  {pageTitle(view)}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setView("reports")}
                  className="rounded-2xl border border-[#d8c9b4] bg-[#fffaf0] px-4 py-3 text-sm font-black text-[#17130f] shadow-sm transition hover:-translate-y-0.5"
                >
                  Open Reports
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddParty(true)}
                    className="rounded-2xl bg-[#17130f] px-5 py-3 text-sm font-black text-[#fff7e8] shadow-xl shadow-black/15 transition hover:-translate-y-0.5"
                  >
                    + New Party
                  </button>
                )}

                <button
                  onClick={() => {
                    setSessionUser(null);
                    setView("dashboard");
                  }}
                  className="rounded-2xl border border-[#d8c9b4] bg-[#fffaf0] px-4 py-3 text-sm font-black text-[#17130f] xl:hidden"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-10">
            {view === "dashboard" && (
              <Dashboard totals={totals} setView={setView} />
            )}

            {view === "ledger" && (
              <LedgerPage
                rows={totals.rows}
                isAdmin={isAdmin}
                updateLedger={updateLedger}
                closeDay={closeDay}
              />
            )}

            {view === "personal" && (
              <PersonalPage
                isAdmin={isAdmin}
                balance={totals.personalBalance}
                entries={personalEntries}
                newPersonal={newPersonal}
                setNewPersonal={setNewPersonal}
                addPersonalEntry={addPersonalEntry}
              />
            )}

            {view === "reports" && <ReportsPage totals={totals} />}
          </div>
        </section>
      </div>

      {showAddParty && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17130f]/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={addParty}
            className="w-full max-w-lg rounded-[2rem] border border-[#e5d8c4] bg-[#fffaf0] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
                  Party management
                </p>
                <h3 className="mt-1 text-2xl font-black">Add New Party</h3>
                <p className="mt-2 text-sm text-[#756b5c]">
                  Opening balance is manually entered for new customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddParty(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[#efe3cf] text-xl font-black"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <FormField
                label="Party Name"
                value={newParty.name}
                onChange={(value) => setNewParty({ ...newParty, name: value })}
                placeholder="Example: Party D"
              />
              <FormField
                label="Phone / Note"
                value={newParty.phone}
                onChange={(value) => setNewParty({ ...newParty, phone: value })}
                placeholder="Optional"
              />
              <FormField
                label="Manual Opening Balance"
                type="number"
                value={newParty.openingBalance}
                onChange={(value) =>
                  setNewParty({ ...newParty, openingBalance: value })
                }
                placeholder="0"
              />

              <button
                type="submit"
                className="rounded-2xl bg-[#17130f] px-5 py-4 text-sm font-black text-[#fff7e8]"
              >
                Save Party
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: SessionUser) => void }) {
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
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3L21 21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.88 5.18A9.6 9.6 0 0 1 12 5C17.5 5 21 12 21 12A15.2 15.2 0 0 1 19.27 14.61"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.61 6.61C4.18 8.25 3 12 3 12C3 12 6.5 19 12 19A9.7 9.7 0 0 0 16.08 18.09"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 12C3 12 6.5 5 12 5C17.5 5 21 12 21 12C21 12 17.5 19 12 19C6.5 19 3 12 3 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
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
                Login to LedgerDesk
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

function Dashboard({
  totals,
  setView,
}: {
  totals: DashboardTotals;
  setView: React.Dispatch<React.SetStateAction<View>>;
}) {
  const maxBalance = Math.max(
    ...totals.rows.map((party) => Math.abs(party.calc.closingBalance)),
    1,
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Balance"
          value={formatBDT(totals.totalBalance)}
          helper="Party subtotal + personal"
          variant="dark"
        />
        <MetricCard
          label="Party Subtotal"
          value={formatBDT(totals.partySubtotal)}
          helper={`${totals.rows.length} active customers`}
          variant="paper"
        />
        <MetricCard
          label="Personal Balance"
          value={formatBDT(totals.personalBalance)}
          helper="Owner personal tracker"
          variant="green"
        />
        <MetricCard
          label="Today's Profit"
          value={formatBDT(totals.todayProfit)}
          helper="SR + commission + charges"
          variant="gold"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
                Party control
              </p>
              <h3 className="mt-1 text-2xl font-black">Balance Breakdown</h3>
              <p className="mt-2 text-sm text-[#756b5c]">
                Live closing balance preview from today's ledger values.
              </p>
            </div>

            <button
              onClick={() => setView("ledger")}
              className="rounded-2xl bg-[#17130f] px-4 py-3 text-sm font-black text-[#fff7e8]"
            >
              Open Ledger
            </button>
          </div>

          <div className="grid gap-4">
            {totals.rows.map((party) => {
              const status = getBalanceStatus(party.calc.closingBalance);
              const width = Math.min(
                100,
                Math.round(
                  (Math.abs(party.calc.closingBalance) / maxBalance) * 100,
                ),
              );

              return (
                <div
                  key={party.id}
                  className="rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-4 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-black">{party.name}</h4>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#756b5c]">
                        {status.description}
                      </p>
                    </div>

                    <strong className={`text-lg ${status.text}`}>
                      {formatBDT(party.calc.closingBalance)}
                    </strong>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8dac7]">
                    <div
                      className={`h-full rounded-full ${status.bar}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] bg-[#17130f] p-6 text-[#fff7e8] shadow-xl shadow-black/10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6a84f]">
              Today
            </p>
            <h3 className="mt-2 text-2xl font-black">Daily Summary</h3>

            <div className="mt-6 grid gap-4">
              <SummaryLine
                label="Credit received"
                value={formatBDT(totals.todayCredit)}
              />
              <SummaryLine
                label="Debit spent"
                value={formatBDT(totals.todayDebit)}
              />
              <SummaryLine
                label="Locked ledgers"
                value={`${totals.lockedCount}/${totals.rows.length}`}
              />
              <SummaryLine
                label="Profit"
                value={formatBDT(totals.todayProfit)}
                strong
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
              Audit rule
            </p>
            <h3 className="mt-2 text-2xl font-black">Locked after close</h3>
            <p className="mt-3 text-sm leading-6 text-[#756b5c]">
              Once a daily ledger is closed, the frontend blocks editing. Later
              the backend will enforce the same rule permanently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LedgerPage({
  rows,
  isAdmin,
  updateLedger,
  closeDay,
}: {
  rows: LedgerRow[];
  isAdmin: boolean;
  updateLedger: (partyId: number, field: keyof Ledger, value: string) => void;
  closeDay: (partyId: number) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {rows.map((party) => {
        const disabled = !isAdmin || party.ledger.locked;
        const status = getBalanceStatus(party.calc.closingBalance);

        return (
          <section
            key={party.id}
            className="overflow-hidden rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] shadow-xl shadow-[#d8c9b4]/40"
          >
            <div className="border-b border-[#e1d2bd] bg-[#17130f] p-6 text-[#fff7e8]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6a84f]">
                    Daily ledger
                  </p>
                  <h3 className="mt-1 text-2xl font-black">{party.name}</h3>
                  <p className="mt-1 text-sm text-[#cdbfae]">
                    Opening balance: {formatBDT(party.openingBalance)}
                  </p>
                </div>

                <span className="rounded-full border border-[#403729] bg-[#211b15] px-3 py-1 text-xs font-black">
                  {party.ledger.locked ? "LOCKED" : "DRAFT"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Credit (+)"
                  value={party.ledger.credit}
                  disabled={disabled}
                  onChange={(value) => updateLedger(party.id, "credit", value)}
                />
                <InputField
                  label="Debit (-)"
                  value={party.ledger.debit}
                  disabled={disabled}
                  onChange={(value) => updateLedger(party.id, "debit", value)}
                />
                <InputField
                  label="Saudi/SR Amount"
                  value={party.ledger.srAmount}
                  disabled={disabled}
                  onChange={(value) =>
                    updateLedger(party.id, "srAmount", value)
                  }
                />
                <InputField
                  label="Market Rate"
                  value={party.ledger.marketRate}
                  disabled={disabled}
                  onChange={(value) =>
                    updateLedger(party.id, "marketRate", value)
                  }
                />
                <InputField
                  label="Given Rate"
                  value={party.ledger.givenRate}
                  disabled={disabled}
                  onChange={(value) =>
                    updateLedger(party.id, "givenRate", value)
                  }
                />
                <InputField
                  label="Commission %"
                  value={party.ledger.commissionRate}
                  disabled={disabled}
                  onChange={(value) =>
                    updateLedger(party.id, "commissionRate", value)
                  }
                />
                <InputField
                  label="R&D Charge"
                  value={party.ledger.rdCharge}
                  disabled={disabled}
                  onChange={(value) =>
                    updateLedger(party.id, "rdCharge", value)
                  }
                />
                <InputField
                  label="Others"
                  value={party.ledger.others}
                  disabled={disabled}
                  onChange={(value) => updateLedger(party.id, "others", value)}
                />
              </div>

              <div className="mt-6 rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#756b5c]">
                      Closing Balance
                    </p>
                    <strong
                      className={`mt-1 block text-3xl font-black ${status.text}`}
                    >
                      {formatBDT(party.calc.closingBalance)}
                    </strong>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${status.badge}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniCalc
                    label="SR Profit"
                    value={formatBDT(party.calc.srProfit)}
                  />
                  <MiniCalc
                    label="Commission"
                    value={formatBDT(party.calc.commissionProfit)}
                  />
                  <MiniCalc
                    label="Total Profit"
                    value={formatBDT(party.calc.totalProfit)}
                    dark
                  />
                </div>
              </div>

              <button
                disabled={disabled}
                onClick={() => closeDay(party.id)}
                className="mt-5 w-full rounded-2xl bg-[#17130f] px-5 py-4 text-sm font-black text-[#fff7e8] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#d7c8b5] disabled:text-[#756b5c]"
              >
                {party.ledger.locked
                  ? "Saved and Locked"
                  : isAdmin
                    ? "Close Day"
                    : "View Only"}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PersonalPage({
  isAdmin,
  balance,
  entries,
  newPersonal,
  setNewPersonal,
  addPersonalEntry,
}: {
  isAdmin: boolean;
  balance: number;
  entries: PersonalEntry[];
  newPersonal: { title: string; amount: string; note: string };
  setNewPersonal: React.Dispatch<
    React.SetStateAction<{ title: string; amount: string; note: string }>
  >;
  addPersonalEntry: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-[2rem] bg-[#17130f] p-7 text-[#fff7e8] shadow-xl shadow-black/10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6a84f]">
          Personal cash
        </p>
        <h3 className="mt-4 text-4xl font-black tracking-tight">
          {formatBDT(balance)}
        </h3>
        <p className="mt-5 text-sm leading-7 text-[#cdbfae]">
          This section tracks only owner personal expenses such as home rent,
          school fee, and personal deposits.
        </p>
      </div>

      <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
            Personal tracker
          </p>
          <h3 className="mt-1 text-2xl font-black">Expense History</h3>
        </div>

        {isAdmin && (
          <form
            onSubmit={addPersonalEntry}
            className="mb-6 grid gap-3 xl:grid-cols-[1fr_0.65fr_1fr_auto]"
          >
            <input
              value={newPersonal.title}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, title: event.target.value })
              }
              placeholder="Title"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <input
              type="number"
              value={newPersonal.amount}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, amount: event.target.value })
              }
              placeholder="Amount"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <input
              value={newPersonal.note}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, note: event.target.value })
              }
              placeholder="Note"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <button className="rounded-2xl bg-[#17130f] px-5 py-3 text-sm font-black text-[#fff7e8]">
              Add
            </button>
          </form>
        )}

        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <strong>{entry.title}</strong>
                <p className="mt-1 text-sm text-[#756b5c]">
                  {entry.date} · {entry.note}
                </p>
              </div>

              <strong
                className={
                  entry.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                }
              >
                {formatBDT(entry.amount)}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportsPage({ totals }: { totals: DashboardTotals }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ReportCard title="Daily Summary">
        <ReportLine
          label="Today's Credit"
          value={formatBDT(totals.todayCredit)}
        />
        <ReportLine
          label="Today's Debit"
          value={formatBDT(totals.todayDebit)}
        />
        <ReportLine
          label="Today's Profit"
          value={formatBDT(totals.todayProfit)}
        />
        <ReportLine
          label="Total Balance"
          value={formatBDT(totals.totalBalance)}
          strong
        />
      </ReportCard>

      <ReportCard title="Party-wise Balance">
        {totals.rows.map((party) => (
          <ReportLine
            key={party.id}
            label={party.name}
            value={formatBDT(party.calc.closingBalance)}
          />
        ))}
      </ReportCard>

      <ReportCard title="Profit Report">
        {totals.rows.map((party) => (
          <ReportLine
            key={party.id}
            label={party.name}
            value={formatBDT(party.calc.totalProfit)}
          />
        ))}
      </ReportCard>

      <ReportCard title="Ledger History Preview">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-[#9c6f22]">
                <th className="border-b border-[#e1d2bd] py-3">Date</th>
                <th className="border-b border-[#e1d2bd] py-3">Party</th>
                <th className="border-b border-[#e1d2bd] py-3">Credit</th>
                <th className="border-b border-[#e1d2bd] py-3">Debit</th>
                <th className="border-b border-[#e1d2bd] py-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {totals.rows.map((party) => (
                <tr key={party.id}>
                  <td className="border-b border-[#eadcc8] py-3 text-[#756b5c]">
                    {party.ledger.date}
                  </td>
                  <td className="border-b border-[#eadcc8] py-3 font-black">
                    {party.name}
                  </td>
                  <td className="border-b border-[#eadcc8] py-3">
                    {formatBDT(party.ledger.credit)}
                  </td>
                  <td className="border-b border-[#eadcc8] py-3">
                    {formatBDT(party.ledger.debit)}
                  </td>
                  <td className="border-b border-[#eadcc8] py-3 font-black">
                    {formatBDT(party.calc.closingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  code,
  label,
}: {
  active: boolean;
  onClick: () => void;
  code: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
        active
          ? "bg-[#d6a84f] text-[#17130f]"
          : "text-[#cdbfae] hover:bg-[#211b15] hover:text-[#fff7e8]"
      }`}
    >
      <span className="text-xs font-black opacity-70">{code}</span>
      <span className="font-black">{label}</span>
    </button>
  );
}

function MetricCard({
  label,
  value,
  helper,
  variant,
}: {
  label: string;
  value: string;
  helper: string;
  variant: "dark" | "paper" | "green" | "gold";
}) {
  const classes = {
    dark: "bg-[#17130f] text-[#fff7e8]",
    paper: "bg-[#fffaf0] text-[#17130f] border border-[#e1d2bd]",
    green: "bg-[#173f35] text-[#f2fff8]",
    gold: "bg-[#d6a84f] text-[#17130f]",
  };

  return (
    <div
      className={`min-h-[160px] rounded-[2rem] p-6 shadow-xl shadow-[#d8c9b4]/40 ${classes[variant]}`}
    >
      <p className="text-sm font-black opacity-75">{label}</p>
      <strong className="mt-8 block text-2xl font-black tracking-tight sm:text-3xl">
        {value}
      </strong>
      <p className="mt-2 text-sm opacity-70">{helper}</p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#403729] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#cdbfae]">{label}</span>
      <strong className={strong ? "text-lg text-[#d6a84f]" : ""}>
        {value}
      </strong>
    </div>
  );
}

function InputField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#3a3127]">
      {label}
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#17130f] outline-none transition focus:border-[#9c6f22] disabled:cursor-not-allowed disabled:bg-[#eee2cf] disabled:text-[#8a7d6b]"
      />
    </label>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#3a3127]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-[#a89c8a] focus:border-[#9c6f22]"
      />
    </label>
  );
}

function MiniCalc({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${dark ? "bg-[#17130f] text-[#fff7e8]" : "bg-[#fffaf0]"}`}
    >
      <span className="text-xs font-black opacity-70">{label}</span>
      <strong className="mt-1 block text-sm font-black">{value}</strong>
    </div>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
      <h3 className="mb-5 text-2xl font-black">{title}</h3>
      {children}
    </section>
  );
}

function ReportLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eadcc8] py-4 last:border-0">
      <span className={strong ? "font-black" : "text-[#756b5c]"}>{label}</span>
      <strong className={strong ? "text-lg" : ""}>{value}</strong>
    </div>
  );
}

function LoginStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#403729] bg-[#17130f]/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#b8ab99]">
        {label}
      </p>
      <p className="mt-2 font-black text-[#fff7e8]">{value}</p>
    </div>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative grid place-items-center ${
        compact ? "h-14 w-14 rounded-2xl" : "h-20 w-20 rounded-[1.7rem]"
      } bg-[#d6a84f] text-[#17130f] shadow-lg shadow-black/20`}
      aria-label="Accounts and Ledger System logo"
    >
      <svg
        viewBox="0 0 64 64"
        className={compact ? "h-9 w-9" : "h-12 w-12"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="13"
          y="10"
          width="38"
          height="44"
          rx="7"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M23 22H41"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M23 33H41"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M23 44H33"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="46" cy="46" r="8" fill="#17130f" />
        <path
          d="M42.5 46.2L45 48.7L50.2 43.3"
          stroke="#d6a84f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function pageTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: "Control Dashboard",
    ledger: "Daily Ledger Desk",
    personal: "Personal Balance",
    reports: "Reports Archive",
  };

  return titles[view];
}
