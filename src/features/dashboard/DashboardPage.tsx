import type { Dispatch, SetStateAction } from "react";
import { MetricCard, SummaryLine } from "../../components/Cards";
import type { DashboardTotals, View } from "../../types/ledger";
import { formatBDT, getBalanceStatus } from "../../utils/calculations";

export function DashboardPage({
  totals,
  setView,
}: {
  totals: DashboardTotals;
  setView: Dispatch<SetStateAction<View>>;
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
