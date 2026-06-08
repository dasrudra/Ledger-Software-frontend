import { useMemo, useState } from "react";
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
  const historyDates = useMemo(() => {
    return Array.from(new Set(ledgerHistory.map((record) => record.date))).sort(
      (a, b) => b.localeCompare(a),
    );
  }, [ledgerHistory]);

  const [selectedDate, setSelectedDate] = useState("");
  const activeSelectedDate = selectedDate || historyDates[0] || "";

  const filteredHistory = useMemo(() => {
    if (!activeSelectedDate) return [];
    return ledgerHistory.filter((record) => record.date === activeSelectedDate);
  }, [ledgerHistory, activeSelectedDate]);

  const selectedDateTotals = useMemo(() => {
    return filteredHistory.reduce(
      (summary, record) => {
        summary.opening += record.openingBalance;
        summary.credit += record.credit;
        summary.debit += record.debit;
        summary.closing += record.closingBalance;
        summary.profit += record.totalProfit;
        return summary;
      },
      {
        opening: 0,
        credit: 0,
        debit: 0,
        closing: 0,
        profit: 0,
      },
    );
  }, [filteredHistory]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ReportCard title="Current Daily Summary">
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
          label="Current Total Balance"
          value={formatBDT(totals.totalBalance)}
          strong
        />
      </ReportCard>

      <ReportCard title="Previous Records Checker">
        <div className="mb-5">
          <label className="grid gap-2 text-sm font-black text-[#3a3127]">
            Select Closed Ledger Date
            <select
              value={activeSelectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            >
              {historyDates.length === 0 && (
                <option value="">No closed record yet</option>
              )}

              {historyDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ReportLine
          label="Closed Party Records"
          value={String(filteredHistory.length)}
        />
        <ReportLine
          label="Total Opening Balance"
          value={formatBDT(selectedDateTotals.opening)}
        />
        <ReportLine
          label="Total Credit"
          value={formatBDT(selectedDateTotals.credit)}
        />
        <ReportLine
          label="Total Debit"
          value={formatBDT(selectedDateTotals.debit)}
        />
        <ReportLine
          label="Previous Day Closing Balance"
          value={formatBDT(selectedDateTotals.closing)}
          strong
        />
        <ReportLine
          label="Previous Day Profit"
          value={formatBDT(selectedDateTotals.profit)}
        />
      </ReportCard>

      <ReportCard title="Current Party-wise Balance">
        {totals.rows.map((party) => (
          <ReportLine
            key={party.id}
            label={party.name}
            value={formatBDT(party.calc.closingBalance)}
          />
        ))}
      </ReportCard>

      <ReportCard title="Current Profit Report">
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
          <div className="mb-5 rounded-3xl border border-[#eadcc8] bg-[#f8efdf] px-5 py-4 text-sm font-bold text-[#756b5c]">
            This table shows closed ledger records only. Draft ledgers are not
            counted as previous records.
          </div>

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
                {filteredHistory.map((record) => (
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

                {filteredHistory.length === 0 && (
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
