import { MiniCalc } from "../../components/Cards";
import { InputField } from "../../components/InputField";
import type { LedgerNumericField, LedgerRow } from "../../types/ledger";
import { formatBDT, getBalanceStatus } from "../../utils/calculations";

export function LedgerPage({
  rows,
  isAdmin,
  updateLedger,
  closeDay,
}: {
  rows: LedgerRow[];
  isAdmin: boolean;
  updateLedger: (
    partyId: number,
    field: LedgerNumericField,
    value: string,
  ) => void;
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
                  label="SR Amount"
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
