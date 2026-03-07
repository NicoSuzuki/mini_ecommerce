import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Card({ to, title, desc, meta }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-extrabold tracking-tight text-slate-900">
            {title}
          </div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {meta}
        </span>
      </div>

      <div className="mt-4 text-sm font-semibold text-slate-900 underline underline-offset-4 opacity-80 group-hover:opacity-100">
        Open →
      </div>
    </Link>
  );
}

export default function AdminHome() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage users, products, and orders from one place.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card
          to="/admin/orders"
          title="Orders"
          desc="View all orders and update status."
          meta="Status updates"
        />
        <Card
          to="/admin/products"
          title="Products"
          desc="Create, edit, delete and restore products."
          meta="CRUD + trash"
        />
        <Card
          to="/admin/users"
          title="Users"
          desc="Manage roles and enable/disable accounts."
          meta="RBAC"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-bold text-slate-900">Quick actions</div>
        <p className="mt-1 text-sm text-slate-600">
          Jump directly to the most common admin tasks.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Manage products
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Review orders
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Manage users
          </Link>
        </div>
      </div>
    </div>
  );
}
