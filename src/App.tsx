import React, { useMemo, useState } from "react";

type Role = "admin" | "employee";
type View = "dashboard" | "ledger" | "personal" | "reports";

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

const today = new Date().toISOString().slice(0, 10);

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

function calculateLedger(party: Party) {
  const ledger = party.ledger;

  // Client-confirmed business rule used in this demo:
  // Credit = addition, Debit = subtraction.
  // Before production, finalize this rule in backend with the client.
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

  return { closingBalance, srProfit, commissionProfit, totalProfit };
}

function balanceStatus(value: number) {
  if (value > 0)
    return {
      label: "Receivable",
      description: "Party balance positive",
      tone: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    };
  if (value < 0)
    return {
      label: "Advance",
      description: "Business owes party",
      tone: "text-rose-600 bg-rose-50 ring-rose-100",
    };
  return {
    label: "Settled",
    description: "No balance remaining",
    tone: "text-slate-600 bg-slate-100 ring-slate-200",
  };
}

export default function LedgerFrontendDemo() {
  const [role, setRole] = useState<Role>("admin");
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

  const isAdmin = role === "admin";

  const totals = useMemo(() => {
    const rows = parties.map((party) => ({
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
      (sum, party) => sum + party.calc.totalProfit,
      0,
    );
    const totalBalance = partySubtotal + personalBalance;
    const lockedCount = rows.filter((party) => party.ledger.locked).length;

    return {
      rows,
      partySubtotal,
      personalBalance,
      todayCredit,
      todayDebit,
      todayProfit,
      totalBalance,
      lockedCount,
    };
  }, [parties, personalEntries]);

  const updateLedger = (
    partyId: number,
    field: keyof Ledger,
    value: string,
  ) => {
    setParties((previous) =>
      previous.map((party) => {
        if (party.id !== partyId || party.ledger.locked || !isAdmin)
          return party;
        return {
          ...party,
          ledger: { ...party.ledger, [field]: safeNumber(value) },
        };
      }),
    );
  };

  const closeDay = (partyId: number) => {
    if (!isAdmin) return;
    setParties((previous) =>
      previous.map((party) =>
        party.id === partyId
          ? { ...party, ledger: { ...party.ledger, locked: true } }
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_34%,#f1f5f9_100%)] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-slate-950 text-white shadow-2xl lg:flex lg:flex-col">
          <div className="p-7">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 text-2xl font-black shadow-lg shadow-cyan-500/20">
                ৳
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Ledger System
                </h1>
                <p className="text-sm text-slate-400">
                  Saudi accounting ledger
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white/8 p-1.5 ring-1 ring-white/10">
              <div className="grid grid-cols-2 gap-1">
                <RoleButton
                  active={role === "admin"}
                  onClick={() => setRole("admin")}
                >
                  Admin
                </RoleButton>
                <RoleButton
                  active={role === "employee"}
                  onClick={() => setRole("employee")}
                >
                  Employee
                </RoleButton>
              </div>
            </div>

            <nav className="mt-8 grid gap-2">
              <NavButton
                active={view === "dashboard"}
                onClick={() => setView("dashboard")}
                icon="📊"
                label="Dashboard"
              />
              <NavButton
                active={view === "ledger"}
                onClick={() => setView("ledger")}
                icon="🧾"
                label="Daily Ledger"
              />
              <NavButton
                active={view === "personal"}
                onClick={() => setView("personal")}
                icon="💼"
                label="Personal Balance"
              />
              <NavButton
                active={view === "reports"}
                onClick={() => setView("reports")}
                icon="📁"
                label="Reports"
              />
            </nav>
          </div>

          <div className="mt-auto p-7">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {isAdmin ? "Admin mode" : "Employee mode"}
                </span>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/20">
                  Active
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                {isAdmin
                  ? "Create parties, enter daily ledger values, and close records."
                  : "View-only access. Ledger modification is blocked."}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                  {today}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {pageTitle(view)}
                  </h2>
                  <span className="hidden rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white sm:inline-flex">
                    {role.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    setRole(role === "admin" ? "employee" : "admin")
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:hidden"
                >
                  Switch: {role}
                </button>
                <button
                  onClick={() => setView("reports")}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  View Reports
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddParty(true)}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    + Add Party
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-10">
            {view === "dashboard" && (
              <Dashboard totals={totals} setView={setView} />
            )}
            {view === "ledger" && (
              <LedgerView
                rows={totals.rows}
                isAdmin={isAdmin}
                updateLedger={updateLedger}
                closeDay={closeDay}
              />
            )}
            {view === "personal" && (
              <PersonalBalance
                isAdmin={isAdmin}
                balance={totals.personalBalance}
                entries={personalEntries}
                newPersonal={newPersonal}
                setNewPersonal={setNewPersonal}
                addPersonalEntry={addPersonalEntry}
              />
            )}
            {view === "reports" && <Reports totals={totals} />}
          </div>
        </section>
      </div>

      {showAddParty && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={addParty}
            className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">Add New Party</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Opening balance is manually entered for a new party.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddParty(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <ModalField
                label="Party Name"
                value={newParty.name}
                onChange={(value) => setNewParty({ ...newParty, name: value })}
                placeholder="Example: Party D"
              />
              <ModalField
                label="Phone / Note"
                value={newParty.phone}
                onChange={(value) => setNewParty({ ...newParty, phone: value })}
                placeholder="Optional"
              />
              <ModalField
                label="Manual Opening Balance"
                type="number"
                value={newParty.openingBalance}
                onChange={(value) =>
                  setNewParty({ ...newParty, openingBalance: value })
                }
                placeholder="0"
              />
              <button
                className="mt-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5"
                type="submit"
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

function Dashboard({
  totals,
  setView,
}: {
  totals: ReturnType<typeof useDashboardTotals>;
  setView: React.Dispatch<React.SetStateAction<View>>;
}) {
  const maxPartyBalance = Math.max(
    ...totals.rows.map((party) => Math.abs(party.calc.closingBalance)),
    1,
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total Balance"
          value={formatBDT(totals.totalBalance)}
          hint="Party subtotal + personal"
          tone="blue"
          onClick={() => setView("reports")}
        />
        <MetricCard
          title="Party Subtotal"
          value={formatBDT(totals.partySubtotal)}
          hint={`${totals.rows.length} active parties`}
          tone="slate"
        />
        <MetricCard
          title="Personal Balance"
          value={formatBDT(totals.personalBalance)}
          hint="Owner personal tracker"
          tone="green"
          onClick={() => setView("personal")}
        />
        <MetricCard
          title="Today's Profit"
          value={formatBDT(totals.todayProfit)}
          hint="SR + commission + charges"
          tone="orange"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-black">Party Balance Breakdown</h3>
              <p className="mt-1 text-sm text-slate-500">
                Live closing balance preview based on today’s draft values.
              </p>
            </div>
            <button
              onClick={() => setView("ledger")}
              className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
            >
              Open Ledger
            </button>
          </div>

          <div className="grid gap-4">
            {totals.rows.map((party) => {
              const status = balanceStatus(party.calc.closingBalance);
              const percent = Math.min(
                100,
                Math.round(
                  (Math.abs(party.calc.closingBalance) / maxPartyBalance) * 100,
                ),
              );
              return (
                <div
                  key={party.id}
                  className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900">
                          {party.name}
                        </h4>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${status.tone}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {status.description}
                      </p>
                    </div>
                    <strong
                      className={
                        party.calc.closingBalance >= 0
                          ? "text-lg text-emerald-600"
                          : "text-lg text-rose-600"
                      }
                    >
                      {formatBDT(party.calc.closingBalance)}
                    </strong>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${party.calc.closingBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-900 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/80">
            <p className="text-sm font-bold text-slate-400">Daily Summary</p>
            <div className="mt-5 grid gap-4">
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

          <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-slate-200/80">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
              Audit posture
            </p>
            <h3 className="mt-3 text-2xl font-black">Immutable after close</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Saved records become locked. Any correction should be handled
              through a later adjustment entry.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LedgerView({
  rows,
  isAdmin,
  updateLedger,
  closeDay,
}: {
  rows: Array<Party & { calc: ReturnType<typeof calculateLedger> }>;
  isAdmin: boolean;
  updateLedger: (partyId: number, field: keyof Ledger, value: string) => void;
  closeDay: (partyId: number) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {rows.map((party) => {
        const disabled = !isAdmin || party.ledger.locked;
        const status = balanceStatus(party.calc.closingBalance);
        return (
          <section
            key={party.id}
            className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-xl shadow-slate-200/80 backdrop-blur"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{party.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Opening balance: {formatBDT(party.openingBalance)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${party.ledger.locked ? "bg-slate-700 text-slate-200 ring-slate-600" : "bg-cyan-400/15 text-cyan-200 ring-cyan-300/20"}`}
                >
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

              <div className="mt-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Closing Balance
                    </p>
                    <strong
                      className={
                        party.calc.closingBalance >= 0
                          ? "text-2xl font-black text-emerald-600"
                          : "text-2xl font-black text-rose-600"
                      }
                    >
                      {formatBDT(party.calc.closingBalance)}
                    </strong>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
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
                    highlight
                  />
                </div>
              </div>

              <button
                disabled={disabled}
                onClick={() => closeDay(party.id)}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
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

function PersonalBalance({
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
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-7 text-white shadow-xl shadow-emerald-500/20">
        <p className="text-sm font-bold text-emerald-50">
          Current Personal Balance
        </p>
        <h3 className="mt-4 text-4xl font-black tracking-tight">
          {formatBDT(balance)}
        </h3>
        <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-50/90">
          Owner personal expenses such as home rent, school fee, and personal
          cash movement.
        </p>
      </div>

      <section className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-slate-200/80">
        <div className="mb-6">
          <h3 className="text-xl font-black">Expense Tracker</h3>
          <p className="mt-1 text-sm text-slate-500">
            Personal-only history, separated from party ledgers.
          </p>
        </div>

        {isAdmin && (
          <form
            onSubmit={addPersonalEntry}
            className="mb-6 grid gap-3 xl:grid-cols-[1fr_0.7fr_1fr_auto]"
          >
            <input
              value={newPersonal.title}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, title: event.target.value })
              }
              placeholder="Title"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500/10 transition focus:border-blue-500 focus:ring-4"
            />
            <input
              type="number"
              value={newPersonal.amount}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, amount: event.target.value })
              }
              placeholder="Amount (+/-)"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500/10 transition focus:border-blue-500 focus:ring-4"
            />
            <input
              value={newPersonal.note}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, note: event.target.value })
              }
              placeholder="Note"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500/10 transition focus:border-blue-500 focus:ring-4"
            />
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
              Add
            </button>
          </form>
        )}

        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <strong className="text-slate-900">{entry.title}</strong>
                <p className="mt-1 text-sm text-slate-500">
                  {entry.date} · {entry.note || "No note"}
                </p>
              </div>
              <strong
                className={
                  entry.amount >= 0 ? "text-emerald-600" : "text-rose-600"
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

function Reports({
  totals,
}: {
  totals: ReturnType<typeof useDashboardTotals>;
}) {
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
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="border-b border-slate-100 py-3">Date</th>
                <th className="border-b border-slate-100 py-3">Party</th>
                <th className="border-b border-slate-100 py-3">Credit</th>
                <th className="border-b border-slate-100 py-3">Debit</th>
                <th className="border-b border-slate-100 py-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {totals.rows.map((party) => (
                <tr key={party.id}>
                  <td className="border-b border-slate-100 py-3 text-slate-500">
                    {party.ledger.date}
                  </td>
                  <td className="border-b border-slate-100 py-3 font-bold">
                    {party.name}
                  </td>
                  <td className="border-b border-slate-100 py-3">
                    {formatBDT(party.ledger.credit)}
                  </td>
                  <td className="border-b border-slate-100 py-3">
                    {formatBDT(party.ledger.debit)}
                  </td>
                  <td className="border-b border-slate-100 py-3 font-black">
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

function useDashboardTotals() {
  return {
    rows: [] as Array<Party & { calc: ReturnType<typeof calculateLedger> }>,
    partySubtotal: 0,
    personalBalance: 0,
    todayCredit: 0,
    todayDebit: 0,
    todayProfit: 0,
    totalBalance: 0,
    lockedCount: 0,
  };
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-black transition ${active ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${active ? "bg-white text-slate-950 shadow-xl" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({
  title,
  value,
  hint,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  hint: string;
  tone: "blue" | "green" | "orange" | "slate";
  onClick?: () => void;
}) {
  const toneClass = {
    blue: "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/20",
    green:
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20",
    orange:
      "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/20",
    slate: "bg-white text-slate-950 shadow-slate-200/80 border border-white",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`min-h-[154px] rounded-[2rem] p-6 text-left shadow-xl transition hover:-translate-y-1 ${toneClass}`}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <p
          className={
            tone === "slate"
              ? "text-sm font-bold text-slate-500"
              : "text-sm font-bold text-white/80"
          }
        >
          {title}
        </p>
        <div>
          <strong className="block text-2xl font-black tracking-tight sm:text-3xl">
            {value}
          </strong>
          <span
            className={
              tone === "slate"
                ? "mt-2 block text-sm text-slate-500"
                : "mt-2 block text-sm text-white/75"
            }
          >
            {hint}
          </span>
        </div>
      </div>
    </button>
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
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className={strong ? "text-lg text-emerald-300" : "text-white"}>
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
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-blue-500/10 transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function MiniCalc({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${highlight ? "bg-slate-950 text-white" : "bg-white ring-1 ring-slate-100"}`}
    >
      <span
        className={
          highlight
            ? "text-xs font-bold text-slate-300"
            : "text-xs font-bold text-slate-500"
        }
      >
        {label}
      </span>
      <strong className="mt-1 block text-sm font-black">{value}</strong>
    </div>
  );
}

function ModalField({
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
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500/10 transition focus:border-blue-500 focus:ring-4"
      />
    </label>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur">
      <h3 className="mb-4 text-xl font-black">{title}</h3>
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <span className={strong ? "font-black text-slate-950" : "text-slate-600"}>
        {label}
      </span>
      <strong className={strong ? "text-lg text-slate-950" : "text-slate-900"}>
        {value}
      </strong>
    </div>
  );
}

function pageTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: "Dashboard",
    ledger: "Daily Ledger Entry",
    personal: "Personal Balance",
    reports: "Reports",
  };
  return titles[view];
}
