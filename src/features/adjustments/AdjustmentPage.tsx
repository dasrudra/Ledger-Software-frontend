import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  AdjustmentEntry,
  NewAdjustmentForm,
  Party,
} from "../../types/ledger";
import { formatBDT, safeNumber } from "../../utils/calculations";

export function AdjustmentPage({
  parties,
  adjustments,
  isAdmin,
  newAdjustment,
  setNewAdjustment,
  addAdjustment,
}: {
  parties: Party[];
  adjustments: AdjustmentEntry[];
  isAdmin: boolean;
  newAdjustment: NewAdjustmentForm;
  setNewAdjustment: Dispatch<SetStateAction<NewAdjustmentForm>>;
  addAdjustment: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const selectedParty = parties.find(
    (party) => party.id === Number(newAdjustment.partyId),
  );

  const rawAmount = Math.abs(safeNumber(newAdjustment.amount));
  const previewAmount =
    newAdjustment.direction === "increase" ? rawAmount : -rawAmount;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
            Correction control
          </p>
          <h3 className="mt-1 text-2xl font-black">Create Adjustment Entry</h3>
          <p className="mt-2 text-sm leading-6 text-[#756b5c]">
            Use this only when a closed ledger needs correction. The old record
            stays locked; the correction is recorded separately.
          </p>
        </div>

        {isAdmin ? (
          <form onSubmit={addAdjustment} className="grid gap-4">
            <label className="grid gap-2 text-sm font-black text-[#3a3127]">
              Select Party
              <select
                value={newAdjustment.partyId}
                onChange={(event) =>
                  setNewAdjustment({
                    ...newAdjustment,
                    partyId: event.target.value,
                  })
                }
                className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
              >
                <option value="">Select party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} {party.active ? "" : "(Inactive)"}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-black text-[#3a3127]">
              Adjustment Type
              <select
                value={newAdjustment.direction}
                onChange={(event) =>
                  setNewAdjustment({
                    ...newAdjustment,
                    direction: event.target.value as "increase" | "decrease",
                  })
                }
                className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
              >
                <option value="increase">Increase party balance</option>
                <option value="decrease">Decrease party balance</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-black text-[#3a3127]">
              Amount
              <input
                type="number"
                value={newAdjustment.amount}
                onChange={(event) =>
                  setNewAdjustment({
                    ...newAdjustment,
                    amount: event.target.value,
                  })
                }
                placeholder="Example: 500"
                className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#3a3127]">
              Reason
              <textarea
                value={newAdjustment.reason}
                onChange={(event) =>
                  setNewAdjustment({
                    ...newAdjustment,
                    reason: event.target.value,
                  })
                }
                placeholder="Example: Correction for previous day debit entry"
                rows={4}
                className="resize-none rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
              />
            </label>

            <div className="rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9c6f22]">
                Preview
              </p>
              <p className="mt-2 text-sm text-[#756b5c]">
                Party:{" "}
                <strong className="text-[#17130f]">
                  {selectedParty ? selectedParty.name : "Not selected"}
                </strong>
              </p>
              <p className="mt-2 text-sm text-[#756b5c]">
                Balance effect:{" "}
                <strong
                  className={
                    previewAmount >= 0 ? "text-emerald-700" : "text-rose-700"
                  }
                >
                  {formatBDT(previewAmount)}
                </strong>
              </p>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#17130f] px-5 py-4 text-sm font-black text-[#fff7e8] shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
            >
              Save Adjustment
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-5 text-sm leading-6 text-[#756b5c]">
            Employee access is view-only. Adjustment creation is available only
            for admin.
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
            Audit trail
          </p>
          <h3 className="mt-1 text-2xl font-black">Adjustment History</h3>
          <p className="mt-2 text-sm leading-6 text-[#756b5c]">
            Every correction is listed here separately from the original locked
            ledger.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#eadcc8]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f8efdf]">
              <tr className="text-xs uppercase tracking-[0.18em] text-[#9c6f22]">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Party</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Reason</th>
              </tr>
            </thead>

            <tbody>
              {adjustments.map((adjustment) => (
                <tr
                  key={adjustment.id}
                  className="border-t border-[#eadcc8] bg-[#fffaf0]"
                >
                  <td className="px-5 py-4 text-[#756b5c]">
                    {adjustment.date}
                  </td>
                  <td className="px-5 py-4 font-black">
                    {adjustment.partyName}
                  </td>
                  <td className="px-5 py-4 capitalize">
                    {adjustment.direction}
                  </td>
                  <td
                    className={`px-5 py-4 font-black ${
                      adjustment.amount >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formatBDT(adjustment.amount)}
                  </td>
                  <td className="px-5 py-4 text-[#756b5c]">
                    {adjustment.reason}
                  </td>
                </tr>
              ))}

              {adjustments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="bg-[#fffaf0] px-5 py-10 text-center text-sm font-bold text-[#756b5c]"
                  >
                    No adjustment entry has been created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
