import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { NewPersonalForm, PersonalEntry } from "../../types/ledger";
import { formatBDT } from "../../utils/calculations";

export function PersonalPage({
  isAdmin,
  balance,
  entries,
  newPersonal,
  setNewPersonal,
  addPersonalEntry,
}: {
  isAdmin: boolean;
  balance: number;
  entries: PersonalEntry[];
  newPersonal: NewPersonalForm;
  setNewPersonal: Dispatch<SetStateAction<NewPersonalForm>>;
  addPersonalEntry: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-[2rem] bg-[#17130f] p-7 text-[#fff7e8] shadow-xl shadow-black/10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6a84f]">
          Personal cash
        </p>
        <h3 className="mt-4 text-4xl font-black tracking-tight">
          {formatBDT(balance)}
        </h3>
        <p className="mt-5 text-sm leading-7 text-[#cdbfae]">
          This section tracks only owner personal expenses such as home rent,
          school fee, and personal deposits.
        </p>
      </div>

      <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
            Personal tracker
          </p>
          <h3 className="mt-1 text-2xl font-black">Expense History</h3>
        </div>

        {isAdmin && (
          <form
            onSubmit={addPersonalEntry}
            className="mb-6 grid gap-3 xl:grid-cols-[1fr_0.65fr_1fr_auto]"
          >
            <input
              value={newPersonal.title}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, title: event.target.value })
              }
              placeholder="Title"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <input
              type="number"
              value={newPersonal.amount}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, amount: event.target.value })
              }
              placeholder="Amount"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <input
              value={newPersonal.note}
              onChange={(event) =>
                setNewPersonal({ ...newPersonal, note: event.target.value })
              }
              placeholder="Note"
              className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#9c6f22]"
            />
            <button className="rounded-2xl bg-[#17130f] px-5 py-3 text-sm font-black text-[#fff7e8]">
              Add
            </button>
          </form>
        )}

        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-3xl border border-[#eadcc8] bg-[#f8efdf] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <strong>{entry.title}</strong>
                <p className="mt-1 text-sm text-[#756b5c]">
                  {entry.date} · {entry.note}
                </p>
              </div>

              <strong
                className={
                  entry.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                }
              >
                {formatBDT(entry.amount)}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
