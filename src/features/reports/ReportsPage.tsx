import { ReportCard, ReportLine } from "../../components/Cards";
import type { DashboardTotals } from "../../types/ledger";
import { formatBDT } from "../../utils/calculations";

export function ReportsPage({ totals }: { totals: DashboardTotals }) {
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
