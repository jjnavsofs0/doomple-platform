"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  UserCog,
  Users2,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { useAdminLiveRefetch } from "@/hooks/use-live-refetch";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  emailVerificationStatus: "PENDING" | "VERIFIED";
  emailVerifiedAt?: string | null;
  transactionalEmailsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  isActive: boolean;
  isDeletedAccount?: boolean;
  erasureStatus?: "REQUESTED" | "RESTRICTED" | "ANONYMIZED" | "RETAINED_FOR_FINANCE" | null;
  createdAt?: string;
}

const roleOptions = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "PROJECT_MANAGER",
  "FINANCE",
  "CLIENT",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "SALES",
  phone: "",
  isActive: true,
  transactionalEmailsEnabled: true,
  marketingEmailsEnabled: true,
};

const summaryCardStyles = [
  "from-sky-50 to-white border-sky-100",
  "from-emerald-50 to-white border-emerald-100",
  "from-amber-50 to-white border-amber-100",
  "from-violet-50 to-white border-violet-100",
];

const prettifyRole = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function UserForm({
  form,
  editingId,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: typeof initialForm;
  editingId: string | null;
  saving: boolean;
  onChange: (patch: Partial<typeof initialForm>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
        <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
          {editingId ? "Edit user" : "Create user"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {editingId
            ? "Update role, contact information, password, or account status."
            : "Add a new internal or client account without leaving the roster."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => onChange({ email: event.target.value })}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50"
        />
        <Input
          label={editingId ? "Reset Password (optional)" : "Password"}
          type="password"
          value={form.password}
          onChange={(event) => onChange({ password: event.target.value })}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50"
        />
        <Select
          label="Role"
          value={form.role}
          onValueChange={(value) => onChange({ role: value })}
          options={roleOptions.map((role) => ({ value: role, label: prettifyRole(role) }))}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50"
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50"
        />
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => onChange({ isActive: event.target.checked })}
          />
          Active account
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.transactionalEmailsEnabled}
            onChange={(event) => onChange({ transactionalEmailsEnabled: event.target.checked })}
          />
          Transactional emails enabled
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.marketingEmailsEnabled}
            onChange={(event) => onChange({ marketingEmailsEnabled: event.target.checked })}
          />
          Promotional emails enabled
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-5">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update User" : "Create User"}
        </Button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(initialForm);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ role: "", status: "" });
  const [panelOpen, setPanelOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/users?limit=250", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAdminLiveRefetch(["dashboard", "users"], fetchUsers);

  const closePanel = React.useCallback(() => {
    setPanelOpen(false);
    setEditingId(null);
    setForm(initialForm);
  }, []);

  const openCreatePanel = React.useCallback(() => {
    setEditingId(null);
    setForm(initialForm);
    setPanelOpen(true);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        password: form.password || undefined,
      };

      const response = await fetch(editingId ? `/api/users/${editingId}` : "/api/users", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save user");
      }

      toast({
        type: "success",
        title: editingId ? "User updated" : "User created",
        description: result.message || (editingId ? "User updated successfully." : "User created successfully."),
      });
      closePanel();
      await fetchUsers();
    } catch (err) {
      toast({
        type: "error",
        title: editingId ? "Failed to update user" : "Failed to create user",
        description: err instanceof Error ? err.message : "Failed to save user",
      });
    } finally {
      setSaving(false);
    }
  }, [closePanel, editingId, fetchUsers, form, toast]);

  const handleEdit = React.useCallback((user: AdminUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      isActive: user.isActive,
      transactionalEmailsEnabled: user.transactionalEmailsEnabled,
      marketingEmailsEnabled: user.marketingEmailsEnabled,
    });
    setPanelOpen(true);
  }, []);

  const handleToggleStatus = React.useCallback(
    async (user: AdminUser) => {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to update user");
        }

        toast({
          type: "success",
          title: user.isActive ? "User deactivated" : "User reactivated",
          description: result.message || (user.isActive ? "User deactivated successfully." : "User activated successfully."),
        });
        await fetchUsers();
      } catch (err) {
        toast({
          type: "error",
          title: "Failed to update user",
          description: err instanceof Error ? err.message : "Failed to update user",
        });
      }
    },
    [fetchUsers, toast]
  );

  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.status) {
        const matchesStatus = filters.status === "active" ? user.isActive : !user.isActive;
        if (!matchesStatus) return false;
      }

      if (!query) return true;

      return [user.name, user.email, user.phone || "", user.role].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [filters.role, filters.status, searchQuery, users]);

  const summary = React.useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive).length;
    const internalUsers = users.filter((user) => user.role !== "CLIENT").length;
    const clientUsers = users.filter((user) => user.role === "CLIENT").length;
    const financeManagers = users.filter((user) =>
      ["FINANCE", "PROJECT_MANAGER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
    ).length;

    return [
      {
        label: "Accounts",
        value: users.length,
        helper: `${activeUsers} currently active`,
        icon: Users2,
      },
      {
        label: "Internal team",
        value: internalUsers,
        helper: `${clientUsers} client-facing login accounts`,
        icon: Shield,
      },
      {
        label: "Ops owners",
        value: financeManagers,
        helper: "Finance, project, and admin roles combined",
        icon: UserCog,
      },
      {
        label: "Inactive accounts",
        value: Math.max(0, users.length - activeUsers),
        helper: "Accounts currently paused from access",
        icon: RefreshCcw,
      },
    ];
  }, [users]);

  const roleFilterOptions = React.useMemo(
    () => [
      { value: "", label: "All roles" },
      ...roleOptions.map((role) => ({ value: role, label: prettifyRole(role) })),
    ],
    []
  );

  const statusFilterOptions = React.useMemo(
    () => [
      { value: "", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    []
  );

  const activeFilters = React.useMemo(
    () => [searchQuery, filters.role, filters.status].filter(Boolean).length,
    [filters.role, filters.status, searchQuery]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-7 md:px-8 lg:grid-cols-[1.18fr_1fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit border-white/20 text-white/90">
              User management
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Manage access, role coverage, and account health from one cleaner people workspace.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/72 md:text-base">
                Create, update, activate, and review team or client accounts without losing sight of who should have access to what.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={fetchUsers}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={openCreatePanel}>
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {summary.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-3xl border bg-gradient-to-br p-5 text-slate-900",
                    summaryCardStyles[index]
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{item.value}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{item.helper}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <div className="space-y-5 border-b border-slate-100 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Access roster</h2>
              <p className="text-sm text-muted-foreground">
                Search by name, email, phone, role, or status and manage users from a side panel.
              </p>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-slate-900"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ role: "", status: "" });
                }}
              >
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, email, phone, or role"
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters((current) => ({ ...current, role: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={roleFilterOptions}
            />
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}
              className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              options={statusFilterOptions}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Users2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">No users match these filters</h3>
              <p className="text-sm text-muted-foreground">
                Reset the filters or create a new user account to expand access coverage.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ role: "", status: "" });
                }}
              >
                Clear filters
              </Button>
              <Button onClick={openCreatePanel}>
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const initials = user.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("");

              const isDeletedAccount = Boolean(user.isDeletedAccount);

              return (
                <div key={user.id} className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                  <Link href={`/admin/users/${user.id}`} className="flex items-start gap-4 rounded-2xl transition-colors hover:bg-slate-50 xl:flex-1 xl:px-2 xl:py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                      {initials || "US"}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                          <StatusBadge status={user.isActive ? "active" : "inactive"} />
                          {isDeletedAccount ? (
                            <Badge variant="outline" className="rounded-full border-rose-200 px-3 py-1 text-rose-700">
                              Deleted
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                          {prettifyRole(user.role)}
                        </Badge>
                        <Badge
                          variant={user.emailVerificationStatus === "VERIFIED" ? "success" : "outline"}
                          className="rounded-full px-3 py-1"
                        >
                          {user.emailVerificationStatus === "VERIFIED" ? "Email verified" : "Email pending"}
                        </Badge>
                        {!user.transactionalEmailsEnabled && (
                          <Badge variant="outline" className="rounded-full border-amber-200 px-3 py-1 text-amber-700">
                            Transactional opt-out
                          </Badge>
                        )}
                        {!user.marketingEmailsEnabled && (
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            Promotional opt-out
                          </Badge>
                        )}
                        {user.createdAt && (
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            Added {format(new Date(user.createdAt), "dd MMM yyyy")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <Button variant="outline" onClick={() => handleEdit(user)} disabled={isDeletedAccount}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleToggleStatus(user)} disabled={isDeletedAccount}>
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog
        open={panelOpen}
        onOpenChange={(open) => {
          if (open) {
            setPanelOpen(true);
          } else {
            closePanel();
          }
        }}
      >
        <DialogContent className="left-auto right-0 top-0 h-screen max-w-[520px] translate-x-0 translate-y-0 rounded-none border-l border-slate-200 p-0 sm:max-w-[520px]">
          <UserForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
            onSubmit={handleSubmit}
            onCancel={closePanel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
