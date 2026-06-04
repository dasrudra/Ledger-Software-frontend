import type { LedgerCalculation, Party } from "../types/ledger";

export const formatBDT = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function calculateLedger(party: Party): LedgerCalculation {
  const ledger = party.ledger;

  /*
    Client-confirmed demo rule:
    Credit = addition
    Debit = subtraction

    Demo formula:
    Closing Balance = Opening Balance + Credit - Debit

    Backend must finalize this rule before production because the SRS formula
    and the client clarification are not fully aligned.
  */
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

export function getBalanceStatus(value: number) {
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
