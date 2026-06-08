import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BrandLogo } from "./components/BrandLogo";
import { FormField } from "./components/FormField";
import { NavButton } from "./components/Navigation";
import {
  initialAdjustmentEntries,
  initialLedgerHistoryRecords,
  initialParties,
  initialPersonalEntries,
  today,
} from "./data/mockData";
import { AdjustmentPage } from "./features/adjustments/AdjustmentPage";
import { LoginScreen } from "./features/auth/LoginScreen";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { LedgerPage } from "./features/ledger/LedgerPage";
import { PartyManagementPage } from "./features/parties/PartyManagementPage";
import { PersonalPage } from "./features/personal/PersonalPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import type {
  AdjustmentEntry,
  DashboardTotals,
  Ledger,
  LedgerHistoryRecord,
  LedgerNumericField,
  NewAdjustmentForm,
  NewPartyForm,
  NewPersonalForm,
  Party,
  PersonalEntry,
  SessionUser,
  View,
} from "./types/ledger";
import { calculateLedger, safeNumber } from "./utils/calculations";

const STORAGE_KEYS = {
  sessionUser: "ledger-system-session-user",
  activeView: "ledger-system-active-view",
  businessDate: "ledger-system-business-date",
};

const validViews: View[] = [
  "dashboard",
  "parties",
  "ledger",
  "adjustments",
  "personal",
  "reports",
];

function getStoredSessionUser(): SessionUser | null {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.sessionUser);

    if (!storedUser) return null;

    return JSON.parse(storedUser) as SessionUser;
  } catch {
    return null;
  }
}

function getStoredView(): View {
  const storedView = localStorage.getItem(STORAGE_KEYS.activeView);

  if (storedView && validViews.includes(storedView as View)) {
    return storedView as View;
  }

  return "dashboard";
}

function getStoredBusinessDate() {
  return localStorage.getItem(STORAGE_KEYS.businessDate) || today;
}

function getNextDate(date: string) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);

  return nextDate.toISOString().slice(0, 10);
}

function createBlankLedger(date: string): Ledger {
  return {
    date,
    debit: 0,
    credit: 0,
    srAmount: 0,
    marketRate: 0,
    givenRate: 0,
    commissionRate: 0,
    rdCharge: 0,
    others: 0,
    locked: false,
  };
}

export default function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() =>
    getStoredSessionUser(),
  );

  const [view, setView] = useState<View>(() => getStoredView());
  const [businessDate, setBusinessDate] = useState<string>(() =>
    getStoredBusinessDate(),
  );

  const [parties, setParties] = useState<Party[]>(initialParties);

  const [personalEntries, setPersonalEntries] = useState<PersonalEntry[]>(
    initialPersonalEntries,
  );

  const [ledgerHistory, setLedgerHistory] = useState<LedgerHistoryRecord[]>(
    initialLedgerHistoryRecords,
  );

  const [adjustmentEntries, setAdjustmentEntries] = useState<AdjustmentEntry[]>(
    initialAdjustmentEntries,
  );

  const [showAddParty, setShowAddParty] = useState(false);

  const [newParty, setNewParty] = useState<NewPartyForm>({
    name: "",
    phone: "",
    openingBalance: "",
  });

  const [newPersonal, setNewPersonal] = useState<NewPersonalForm>({
    title: "",
    amount: "",
    note: "",
  });

  const [newAdjustment, setNewAdjustment] = useState<NewAdjustmentForm>({
    partyId: "",
    direction: "increase",
    amount: "",
    reason: "",
  });

  const isAdmin = sessionUser?.role === "admin";

  useEffect(() => {
    if (sessionUser) {
      localStorage.setItem(
        STORAGE_KEYS.sessionUser,
        JSON.stringify(sessionUser),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.sessionUser);
    }
  }, [sessionUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeView, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.businessDate, businessDate);
  }, [businessDate]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.sessionUser);
    localStorage.removeItem(STORAGE_KEYS.activeView);

    setSessionUser(null);
    setView("dashboard");
  };

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

  const canStartNextDay =
    totals.rows.length > 0 && totals.rows.every((party) => party.ledger.locked);

  const updateLedger = (
    partyId: number,
    field: LedgerNumericField,
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
    if (!isAdmin || !sessionUser) return;

    const targetParty = parties.find((party) => party.id === partyId);

    if (!targetParty || targetParty.ledger.locked) return;

    const calc = calculateLedger(targetParty);

    const historyRecord: LedgerHistoryRecord = {
      id: Date.now(),
      date: businessDate,
      partyId: targetParty.id,
      partyName: targetParty.name,
      openingBalance: targetParty.openingBalance,
      debit: targetParty.ledger.debit,
      credit: targetParty.ledger.credit,
      srAmount: targetParty.ledger.srAmount,
      marketRate: targetParty.ledger.marketRate,
      givenRate: targetParty.ledger.givenRate,
      commissionRate: targetParty.ledger.commissionRate,
      rdCharge: targetParty.ledger.rdCharge,
      others: targetParty.ledger.others,
      closingBalance: calc.closingBalance,
      srProfit: calc.srProfit,
      commissionProfit: calc.commissionProfit,
      totalProfit: calc.totalProfit,
      closedBy: sessionUser.name,
      closedAt: new Date().toISOString(),
    };

    setLedgerHistory((previous) => [historyRecord, ...previous]);

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

  const startNextBusinessDay = () => {
    if (!isAdmin || !canStartNextDay) return;

    const nextDate = getNextDate(businessDate);

    setParties((previous) =>
      previous.map((party) => {
        if (!party.active) return party;

        const calc = calculateLedger(party);

        return {
          ...party,
          openingBalance: calc.closingBalance,
          ledger: createBlankLedger(nextDate),
        };
      }),
    );

    setBusinessDate(nextDate);
    setView("ledger");
  };

  const addParty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAdmin || !newParty.name.trim()) return;

    const nextParty: Party = {
      id: Date.now(),
      name: newParty.name.trim(),
      phone: newParty.phone.trim(),
      openingBalance: safeNumber(newParty.openingBalance),
      active: true,
      ledger: {
        date: businessDate,
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

    setNewParty({
      name: "",
      phone: "",
      openingBalance: "",
    });

    setShowAddParty(false);
  };

  const updatePartyInfo = (partyId: number, values: NewPartyForm) => {
    if (!isAdmin || !values.name.trim()) return;

    setParties((previous) =>
      previous.map((party) =>
        party.id === partyId
          ? {
              ...party,
              name: values.name.trim(),
              phone: values.phone.trim(),
              openingBalance: safeNumber(values.openingBalance),
            }
          : party,
      ),
    );
  };

  const togglePartyStatus = (partyId: number) => {
    if (!isAdmin) return;

    setParties((previous) =>
      previous.map((party) =>
        party.id === partyId
          ? {
              ...party,
              active: !party.active,
            }
          : party,
      ),
    );
  };

  const addPersonalEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAdmin || !newPersonal.title.trim()) return;

    setPersonalEntries((previous) => [
      {
        id: Date.now(),
        title: newPersonal.title.trim(),
        date: businessDate,
        amount: safeNumber(newPersonal.amount),
        note: newPersonal.note.trim(),
      },
      ...previous,
    ]);

    setNewPersonal({
      title: "",
      amount: "",
      note: "",
    });
  };

  const addAdjustment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !isAdmin ||
      !sessionUser ||
      !newAdjustment.partyId ||
      !newAdjustment.reason.trim()
    ) {
      return;
    }

    const partyId = Number(newAdjustment.partyId);
    const targetParty = parties.find((party) => party.id === partyId);

    if (!targetParty) return;

    const rawAmount = Math.abs(safeNumber(newAdjustment.amount));

    if (rawAmount <= 0) return;

    const signedAmount =
      newAdjustment.direction === "increase" ? rawAmount : -rawAmount;

    const nextAdjustment: AdjustmentEntry = {
      id: Date.now(),
      date: businessDate,
      partyId: targetParty.id,
      partyName: targetParty.name,
      direction: newAdjustment.direction,
      amount: signedAmount,
      reason: newAdjustment.reason.trim(),
      createdBy: sessionUser.name,
      createdAt: new Date().toISOString(),
    };

    setAdjustmentEntries((previous) => [nextAdjustment, ...previous]);

    setParties((previous) =>
      previous.map((party) =>
        party.id === partyId
          ? {
              ...party,
              openingBalance: safeNumber(party.openingBalance) + signedAmount,
            }
          : party,
      ),
    );

    setNewAdjustment({
      partyId: "",
      direction: "increase",
      amount: "",
      reason: "",
    });
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
                active={view === "parties"}
                onClick={() => setView("parties")}
                code="02"
                label="Party Management"
              />
              <NavButton
                active={view === "ledger"}
                onClick={() => setView("ledger")}
                code="03"
                label="Daily Ledger Desk"
              />
              <NavButton
                active={view === "adjustments"}
                onClick={() => setView("adjustments")}
                code="04"
                label="Adjustments"
              />
              <NavButton
                active={view === "personal"}
                onClick={() => setView("personal")}
                code="05"
                label="Personal Balance"
              />
              <NavButton
                active={view === "reports"}
                onClick={() => setView("reports")}
                code="06"
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
                onClick={handleLogout}
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
                  Business Date · {businessDate}
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
                  onClick={handleLogout}
                  className="rounded-2xl border border-[#d8c9b4] bg-[#fffaf0] px-4 py-3 text-sm font-black text-[#17130f] xl:hidden"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-10">
            {view === "dashboard" && (
              <DashboardPage totals={totals} setView={setView} />
            )}

            {view === "parties" && (
              <PartyManagementPage
                parties={parties}
                isAdmin={isAdmin}
                onOpenAddParty={() => setShowAddParty(true)}
                onUpdateParty={updatePartyInfo}
                onTogglePartyStatus={togglePartyStatus}
              />
            )}

            {view === "ledger" && (
              <LedgerPage
                rows={totals.rows}
                isAdmin={isAdmin}
                businessDate={businessDate}
                canStartNextDay={canStartNextDay}
                updateLedger={updateLedger}
                closeDay={closeDay}
                startNextBusinessDay={startNextBusinessDay}
              />
            )}

            {view === "adjustments" && (
              <AdjustmentPage
                parties={parties}
                adjustments={adjustmentEntries}
                isAdmin={isAdmin}
                newAdjustment={newAdjustment}
                setNewAdjustment={setNewAdjustment}
                addAdjustment={addAdjustment}
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

            {view === "reports" && (
              <ReportsPage
                totals={totals}
                ledgerHistory={ledgerHistory}
                adjustmentEntries={adjustmentEntries}
              />
            )}
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

function pageTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: "Control Dashboard",
    parties: "Party Management",
    ledger: "Daily Ledger Desk",
    adjustments: "Adjustment Entries",
    personal: "Personal Balance",
    reports: "Reports Archive",
  };

  return titles[view];
}
