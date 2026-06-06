import { ReportCard, ReportLine } from "../../components/Cards";
import type {
  AdjustmentEntry,
  DashboardTotals,
  LedgerHistoryRecord,
} from "../../types/ledger";
import { formatBDT } from "../../utils/calculations";

export function ReportsPage({
  totals,
  ledgerHistory,
  adjustmentEntries,
}: {
  totals: DashboardTotals;
  ledgerHistory: LedgerHistoryRecord[];
  adjustmentEntries: AdjustmentEntry[];
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

      <ReportCard title="Adjustment Summary">
        {adjustmentEntries.length > 0 ? (
          adjustmentEntries.map((entry) => (
            <ReportLine
              key={entry.id}
              label={`${entry.partyName} · ${entry.reason}`}
              value={formatBDT(entry.amount)}
            />
          ))
        ) : (
          <p className="text-sm font-bold text-[#756b5c]">
            No adjustment entry has been created yet.
          </p>
        )}
      </ReportCard>

      <section className="xl:col-span-2">
        <ReportCard title="Ledger History">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.18em] text-[#9c6f22]">
                  <th className="border-b border-[#e1d2bd] py-3">Date</th>
                  <th className="border-b border-[#e1d2bd] py-3">Party</th>
                  <th className="border-b border-[#e1d2bd] py-3">Opening</th>
                  <th className="border-b border-[#e1d2bd] py-3">Credit</th>
                  <th className="border-b border-[#e1d2bd] py-3">Debit</th>
                  <th className="border-b border-[#e1d2bd] py-3">Closing</th>
                  <th className="border-b border-[#e1d2bd] py-3">Profit</th>
                  <th className="border-b border-[#e1d2bd] py-3">Closed By</th>
                </tr>
              </thead>

              <tbody>
                {ledgerHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="border-b border-[#eadcc8] py-3 text-[#756b5c]">
                      {record.date}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3 font-black">
                      {record.partyName}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3">
                      {formatBDT(record.openingBalance)}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3">
                      {formatBDT(record.credit)}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3">
                      {formatBDT(record.debit)}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3 font-black">
                      {formatBDT(record.closingBalance)}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3">
                      {formatBDT(record.totalProfit)}
                    </td>
                    <td className="border-b border-[#eadcc8] py-3 text-[#756b5c]">
                      {record.closedBy}
                    </td>
                  </tr>
                ))}

                {ledgerHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm font-bold text-[#756b5c]"
                    >
                      No closed ledger history yet. Close a party ledger first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ReportCard>
      </section>
    </div>
  );
}
