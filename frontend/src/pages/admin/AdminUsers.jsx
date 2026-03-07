import { useEffect, useMemo, useRef, useState } from "react";
import {
  adminFetchUsers,
  adminUpdateUser,
} from "../../services/adminUsersService";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["customer", "admin"];

function badgeActive(is_active) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold";
  return Number(is_active) === 1
    ? `${base} bg-emerald-100 text-emerald-700`
    : `${base} bg-red-100 text-red-700`;
}

function badgeRole(role) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold";
  return role === "admin"
    ? `${base} bg-slate-900 text-white`
    : `${base} bg-slate-100 text-slate-700`;
}

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({}); // { [id_user]: { role, is_active } }
  const [updating, setUpdating] = useState({}); // { [id_user]: true }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);
    try {
      const res = await adminFetchUsers({}, { signal: controller.signal });
      const data = res?.data || [];
      setUsers(data);

      const init = {};
      for (const u of data) {
        init[u.id_user] = { role: u.role, is_active: Number(u.is_active) };
      }
      setSelected(init);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const haystack = [u.id_user, u.first_name, u.last_name, u.email, u.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [users, query]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage roles and enable/disable accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users (name, email, role, id)..."
            className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Clear
            </button>
          )}

          <button
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Showing {filteredRows.length} of {users.length} users
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((u) => {
                  const sel = selected[u.id_user] || {
                    role: u.role,
                    is_active: Number(u.is_active),
                  };
                  const busy = !!updating[u.id_user];
                  const changed =
                    sel.role !== u.role ||
                    Number(sel.is_active) !== Number(u.is_active);

                  const meId = me?.id_user ?? me?.id ?? null;
                  const isMe = meId && Number(meId) === Number(u.id_user);
                  const disablingSelf = isMe && Number(sel.is_active) === 0;

                  return (
                    <tr key={u.id_user} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">
                          {u.id_user}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {u.first_name} {u.last_name}
                        </div>
                        {isMe && (
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            (you)
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-700">{u.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={badgeRole(sel.role)}>
                            {sel.role}
                          </span>

                          <select
                            value={sel.role}
                            disabled={busy}
                            onChange={(e) =>
                              setSelected((prev) => ({
                                ...prev,
                                [u.id_user]: {
                                  ...prev[u.id_user],
                                  role: e.target.value,
                                },
                              }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={badgeActive(sel.is_active)}>
                            {Number(sel.is_active) === 1
                              ? "active"
                              : "disabled"}
                          </span>

                          <select
                            value={String(sel.is_active)}
                            disabled={busy}
                            onChange={(e) =>
                              setSelected((prev) => ({
                                ...prev,
                                [u.id_user]: {
                                  ...prev[u.id_user],
                                  is_active: Number(e.target.value),
                                },
                              }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                          >
                            <option value="1">active</option>
                            <option value="0">disabled</option>
                          </select>
                        </div>

                        {disablingSelf && (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            You can’t disable your own account.
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            disabled={busy || !changed || disablingSelf}
                            onClick={async () => {
                              setError("");
                              setUpdating((p) => ({
                                ...p,
                                [u.id_user]: true,
                              }));
                              try {
                                await adminUpdateUser(u.id_user, {
                                  role: sel.role,
                                  is_active: sel.is_active,
                                });
                                await load();
                              } catch (err) {
                                setError(
                                  err?.message || "Failed to update user",
                                );
                              } finally {
                                setUpdating((p) => ({
                                  ...p,
                                  [u.id_user]: false,
                                }));
                              }
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busy ? "Updating..." : "Update"}
                          </button>

                          {changed && (
                            <span className="text-xs text-slate-500">
                              pending changes
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Tip: role changes take effect immediately.</div>
          <div>Remember: you can’t disable your own account.</div>
        </div>
      </div>
    </div>
  );
}
