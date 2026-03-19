"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  isActive: boolean;
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
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users?limit=100", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        ...form,
        password: form.password || undefined,
      };

      const response = await fetch(
        editingId ? `/api/users/${editingId}` : "/api/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save user");
      }

      setSuccess(editingId ? "User updated successfully" : "User created successfully");
      resetForm();
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      isActive: user.isActive,
    });
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      setError(null);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      id: "name",
      header: "Name",
      accessor: (row: AdminUser) => row.name,
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row: AdminUser) => row.email,
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      accessor: (row: AdminUser) => (
        <Badge variant="outline">{row.role.replaceAll("_", " ")}</Badge>
      ),
      sortable: true,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (row: AdminUser) => row.phone || "N/A",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row: AdminUser) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row: AdminUser) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Users"
        description="Create, update, activate, and deactivate admin or client accounts"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit User" : "Create User"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
          />
          <Input
            label={editingId ? "Reset Password (optional)" : "Password"}
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((current) => ({ ...current, password: e.target.value }))
            }
          />
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
          />
          <label className="flex items-center gap-2 pt-8 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((current) => ({ ...current, isActive: e.target.checked }))
              }
            />
            Active account
          </label>
          <div className="md:col-span-2 flex gap-3">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update User" : "Create User"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Search users by name or email..."
              emptyMessage="No users found."
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
