import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { NewPartyForm, Party } from "../../types/ledger";
import { formatBDT } from "../../utils/calculations";

export function PartyManagementPage({
  parties,
  isAdmin,
  onOpenAddParty,
  onUpdateParty,
  onTogglePartyStatus,
}: {
  parties: Party[];
  isAdmin: boolean;
  onOpenAddParty: () => void;
  onUpdateParty: (partyId: number, values: NewPartyForm) => void;
  onTogglePartyStatus: (partyId: number) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editForm, setEditForm] = useState<NewPartyForm>({
    name: "",
    phone: "",
    openingBalance: "",
  });

  const activeCount = parties.filter((party) => party.active).length;
  const inactiveCount = parties.length - activeCount;

  const filteredParties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return parties;

    return parties.filter((party) => {
      return (
        party.name.toLowerCase().includes(normalizedSearch) ||
        party.phone.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [parties, searchTerm]);

  const openEditModal = (party: Party) => {
    setEditingParty(party);
    setEditForm({
      name: party.name,
      phone: party.phone,
      openingBalance: String(party.openingBalance),
    });
  };

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingParty || !editForm.name.trim()) return;

    onUpdateParty(editingParty.id, editForm);
    setEditingParty(null);
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <PartyStatCard
          label="Total Parties"
          value={String(parties.length)}
          helper="All registered customers"
          variant="dark"
        />
        <PartyStatCard
          label="Active Parties"
          value={String(activeCount)}
          helper="Included in ledger flow"
          variant="green"
        />
        <PartyStatCard
          label="Inactive Parties"
          value={String(inactiveCount)}
          helper="Hidden from daily ledger"
          variant="gold"
        />
      </section>

      <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
              Customer registry
            </p>
            <h3 className="mt-1 text-2xl font-black">Party Management</h3>
            <p className="mt-2 text-sm leading-6 text-[#756b5c]">
              Manage customer records before creating daily ledgers. Inactive
              parties stay saved but are excluded from active ledger work.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or phone"
              className="min-w-[260px] rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-[#a89c8a] focus:border-[#9c6f22]"
            />

            {isAdmin && (
              <button
                onClick={onOpenAddParty}
                className="rounded-2xl bg-[#17130f] px-5 py-3 text-sm font-black text-[#fff7e8] shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
              >
                + Add Party
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#eadcc8]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f8efdf]">
              <tr className="text-xs uppercase tracking-[0.18em] text-[#9c6f22]">
                <th className="px-5 py-4">Party</th>
                <th className="px-5 py-4">Phone / Note</th>
                <th className="px-5 py-4">Opening Balance</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredParties.map((party) => (
                <tr
                  key={party.id}
                  className="border-t border-[#eadcc8] bg-[#fffaf0] transition hover:bg-[#f8efdf]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#17130f] text-sm font-black text-[#d6a84f]">
                        {party.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black">{party.name}</p>
                        <p className="mt-1 text-xs text-[#756b5c]">
                          Party ID: {party.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#756b5c]">
                    {party.phone || "No phone/note added"}
                  </td>

                  <td className="px-5 py-4 font-black">
                    {formatBDT(party.openingBalance)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        party.active
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                          : "border-rose-200 bg-rose-100 text-rose-700"
                      }`}
                    >
                      {party.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => openEditModal(party)}
                            className="rounded-xl border border-[#d8c9b4] bg-[#fffaf0] px-4 py-2 text-xs font-black text-[#17130f] transition hover:bg-[#efe3cf]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => onTogglePartyStatus(party.id)}
                            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                              party.active
                                ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            }`}
                          >
                            {party.active ? "Deactivate" : "Activate"}
                          </button>
                        </>
                      ) : (
                        <span className="rounded-xl bg-[#f8efdf] px-4 py-2 text-xs font-black text-[#756b5c]">
                          View only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredParties.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="bg-[#fffaf0] px-5 py-10 text-center text-sm font-bold text-[#756b5c]"
                  >
                    No party found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingParty && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17130f]/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitEdit}
            className="w-full max-w-lg rounded-[2rem] border border-[#e5d8c4] bg-[#fffaf0] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9c6f22]">
                  Edit party
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  {editingParty.name}
                </h3>
                <p className="mt-2 text-sm text-[#756b5c]">
                  Update party information. Later, backend audit logs will store
                  every edit history.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingParty(null)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[#efe3cf] text-xl font-black"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <EditField
                label="Party Name"
                value={editForm.name}
                onChange={(value) => setEditForm({ ...editForm, name: value })}
              />

              <EditField
                label="Phone / Note"
                value={editForm.phone}
                onChange={(value) => setEditForm({ ...editForm, phone: value })}
              />

              <EditField
                label="Opening Balance"
                type="number"
                value={editForm.openingBalance}
                onChange={(value) =>
                  setEditForm({ ...editForm, openingBalance: value })
                }
              />

              <button
                type="submit"
                className="rounded-2xl bg-[#17130f] px-5 py-4 text-sm font-black text-[#fff7e8]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PartyStatCard({
  label,
  value,
  helper,
  variant,
}: {
  label: string;
  value: string;
  helper: string;
  variant: "dark" | "green" | "gold";
}) {
  const classes = {
    dark: "bg-[#17130f] text-[#fff7e8]",
    green: "bg-[#173f35] text-[#f2fff8]",
    gold: "bg-[#d6a84f] text-[#17130f]",
  };

  return (
    <div
      className={`min-h-[145px] rounded-[2rem] p-6 shadow-xl shadow-[#d8c9b4]/40 ${classes[variant]}`}
    >
      <p className="text-sm font-black opacity-75">{label}</p>
      <strong className="mt-7 block text-4xl font-black tracking-tight">
        {value}
      </strong>
      <p className="mt-2 text-sm opacity-70">{helper}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#3a3127]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#9c6f22]"
      />
    </label>
  );
}
