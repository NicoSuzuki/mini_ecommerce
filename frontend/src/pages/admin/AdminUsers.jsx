import { useEffect, useRef, useState } from "react";
import {
  adminFetchUsers,
  adminUpdateUser,
} from "../../services/adminUsersService";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["customer", "admin"];

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({});
  const [updating, setUpdating] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        init[u.id_user] = { role: u.role, is_active: u.is_active };
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
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Users</h2>
        <button onClick={load} style={{ height: 36 }}>
          Refresh
        </button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Role</th>
              <th style={{ padding: 10 }}>Active</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const sel = selected[u.id_user] || {
                role: u.role,
                is_active: u.is_active,
              };
              const changed =
                sel.role !== u.role ||
                Number(sel.is_active) !== Number(u.is_active);
              const isMe = me?.id === u.id_user || me?.sub === u.id_user; // depende cómo guardás user
              const disabledSelf = isMe && Number(sel.is_active) === 0;

              return (
                <tr
                  key={u.id_user}
                  style={{ borderBottom: "1px solid #f1f1f1" }}
                >
                  <td style={{ padding: 10 }}>
                    <strong>{u.id_user}</strong>
                  </td>
                  <td style={{ padding: 10 }}>
                    {u.first_name} {u.last_name}
                  </td>
                  <td style={{ padding: 10, color: "#444" }}>{u.email}</td>

                  <td style={{ padding: 10 }}>
                    <select
                      value={sel.role}
                      disabled={!!updating[u.id_user]}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          [u.id_user]: {
                            ...prev[u.id_user],
                            role: e.target.value,
                          },
                        }))
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: 10 }}>
                    <select
                      value={String(sel.is_active)}
                      disabled={!!updating[u.id_user]}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          [u.id_user]: {
                            ...prev[u.id_user],
                            is_active: Number(e.target.value),
                          },
                        }))
                      }
                    >
                      <option value="1">active</option>
                      <option value="0">disabled</option>
                    </select>
                  </td>

                  <td style={{ padding: 10 }}>
                    <button
                      disabled={
                        !!updating[u.id_user] || !changed || disabledSelf
                      }
                      onClick={async () => {
                        setUpdating((prev) => ({ ...prev, [u.id_user]: true }));
                        setError("");
                        try {
                          await adminUpdateUser(u.id_user, {
                            role: sel.role,
                            is_active: sel.is_active,
                          });
                          await load();
                        } catch (err) {
                          setError(err?.message || "Failed to update user");
                        } finally {
                          setUpdating((prev) => ({
                            ...prev,
                            [u.id_user]: false,
                          }));
                        }
                      }}
                    >
                      {updating[u.id_user] ? "Updating..." : "Update"}
                    </button>

                    {disabledSelf && (
                      <div
                        style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}
                      >
                        You can’t disable yourself
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
