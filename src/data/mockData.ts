import type {
  AdjustmentEntry,
  DemoUser,
  LedgerHistoryRecord,
  Party,
  PersonalEntry,
} from "../types/ledger";

export const today = new Date().toISOString().slice(0, 10);

export const demoUsers: DemoUser[] = [
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

export const initialParties: Party[] = [
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

export const initialPersonalEntries: PersonalEntry[] = [
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

export const initialLedgerHistoryRecords: LedgerHistoryRecord[] = [];

export const initialAdjustmentEntries: AdjustmentEntry[] = [];
