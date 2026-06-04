export type Role = "admin" | "employee";

export type View = "dashboard" | "ledger" | "personal" | "reports";

export type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

export type DemoUser = SessionUser & {
  password: string;
};

export type Ledger = {
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

export type LedgerNumericField =
  | "debit"
  | "credit"
  | "srAmount"
  | "marketRate"
  | "givenRate"
  | "commissionRate"
  | "rdCharge"
  | "others";

export type Party = {
  id: number;
  name: string;
  phone: string;
  openingBalance: number;
  active: boolean;
  ledger: Ledger;
};

export type PersonalEntry = {
  id: number;
  title: string;
  date: string;
  amount: number;
  note: string;
};

export type LedgerCalculation = {
  closingBalance: number;
  srProfit: number;
  commissionProfit: number;
  totalProfit: number;
};

export type LedgerRow = Party & {
  calc: LedgerCalculation;
};

export type DashboardTotals = {
  rows: LedgerRow[];
  partySubtotal: number;
  personalBalance: number;
  todayCredit: number;
  todayDebit: number;
  todayProfit: number;
  totalBalance: number;
  lockedCount: number;
};

export type NewPartyForm = {
  name: string;
  phone: string;
  openingBalance: string;
};

export type NewPersonalForm = {
  title: string;
  amount: string;
  note: string;
};
