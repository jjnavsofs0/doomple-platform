"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  BadgeCheck,
  BellOff,
  ChevronLeft,
  Eye,
  Mail,
  Phone,
  Shield,
  UserCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/components/ui/toast";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  emailVerificationStatus: "PENDING" | "VERIFIED";
  emailVerifiedAt: string | null;
  transactionalEmailsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  isActive: boolean;
  isDeletedAccount?: boolean;
  createdAt: string;
  updatedAt: string;
  pendingEmailChange?: {
    id: string;
    newEmail: string;
    expiresAt: string;
    createdAt: string;
  } | null;
  erasureRequest?: {
    id: string;
    status: "REQUESTED" | "RESTRICTED" | "ANONYMIZED" | "RETAINED_FOR_FINANCE";
    requestedReason: string;
    retentionReason: string | null;
    internalNotes: string | null;
    requestedAt: string;
    restrictedAt: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  erasureImpact?: {
    hasClientRecord: boolean;
    clientId: string | null;
    invoices: number;
    payments: number;
    quotations: number;
    activeProjects: number;
    requiresRetention: boolean;
    recommendedStatus: "ANONYMIZED" | "RETAINED_FOR_FINANCE";
  };
  auditTrail?: Array<{
    id: string;
    action: string;
    summary: string;
    createdAt: string;
    userName: string;
  }>;
};

const roleOptions = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "PROJECT_MANAGER",
  "FINANCE",
  "CLIENT",
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  PROJECT_MANAGER: "Project Manager",
  FINANCE: "Finance",
  CLIENT: "Client",
};

export default function UserDetailPage() {
  const { data: session } = useSession();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const [erasureForm, setErasureForm] = React.useState({
    requestedReason: "",
    retentionReason: "",
    internalNotes: "",
  });
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "CLIENT",
    isActive: true,
    transactionalEmailsEnabled: true,
    marketingEmailsEnabled: true,
    password: "",
  });
  const { toast } = useToast();

  const fetchUser = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/${params.id}`, { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch user");
      }

      setUser(result.data);
      setForm({
        name: result.data.name || "",
        email: result.data.pendingEmailChange?.newEmail || result.data.email || "",
        phone: result.data.phone || "",
        role: result.data.role || "CLIENT",
        isActive: result.data.isActive !== false,
        transactionalEmailsEnabled: result.data.transactionalEmailsEnabled !== false,
        marketingEmailsEnabled: result.data.marketingEmailsEnabled !== false,
        password: "",
      });
      setErasureForm({
        requestedReason: result.data.erasureRequest?.requestedReason || "",
        retentionReason: result.data.erasureRequest?.retentionReason || "",
        internalNotes: result.data.erasureRequest?.internalNotes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    if (params.id) {
      void fetchUser();
    }
  }, [fetchUser, params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-44 rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[360px] rounded-[28px]" />
          <Skeleton className="h-[360px] rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card className="border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error || "User not found"}
        </Card>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const viewerRole = session?.user?.role || "";
  const canManageSuperAdmin = viewerRole === "SUPER_ADMIN";
  const canManageTarget = user.role !== "SUPER_ADMIN" || canManageSuperAdmin;
  const isDeletedAccount = user.isDeletedAccount || user.erasureRequest?.status === "ANONYMIZED";
  const canManageMutableAccount = canManageTarget && !isDeletedAccount;
  const isOwnAccount = session?.user?.id === user.id;

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          isActive: form.isActive,
          transactionalEmailsEnabled: form.transactionalEmailsEnabled,
          marketingEmailsEnabled: form.marketingEmailsEnabled,
          password: form.password || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      toast({
        type: "success",
        title: "User updated",
        description: result.message || "User updated successfully.",
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to update user",
        description: err instanceof Error ? err.message : "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update user status");
      }

      toast({
        type: "success",
        title: user.isActive ? "User deactivated" : "User reactivated",
        description:
          result.message ||
          (user.isActive ? "User deactivated successfully." : "User reactivated successfully."),
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to update user status",
        description: err instanceof Error ? err.message : "Failed to update user status",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkEmailVerified = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailVerificationStatus: "VERIFIED",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mark email as verified");
      }

      toast({
        type: "success",
        title: "Email verified",
        description: result.message || "Email marked as verified.",
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to verify email",
        description: err instanceof Error ? err.message : "Failed to mark email as verified",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkEmailUnverified = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailVerificationStatus: "PENDING",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mark email as unverified");
      }

      toast({
        type: "success",
        title: "Email marked unverified",
        description: result.message || "Email marked as unverified.",
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to unverify email",
        description: err instanceof Error ? err.message : "Failed to mark email as unverified",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateErasureRequest = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}/erasure-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedReason: erasureForm.requestedReason,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create close account request");
      }

      toast({
        type: "success",
        title: "Close account request logged",
        description: result.message || "Close account request logged successfully.",
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to create close account request",
        description: err instanceof Error ? err.message : "Failed to create close account request",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleErasureStatusUpdate = async (
    status: "RESTRICTED" | "ANONYMIZED" | "RETAINED_FOR_FINANCE"
  ) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${user.id}/erasure-request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: user.erasureRequest?.id,
          status,
          retentionReason: erasureForm.retentionReason,
          internalNotes: erasureForm.internalNotes,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update close account workflow");
      }

      toast({
        type: "success",
        title: "Close account workflow updated",
        description: result.message || "Close account workflow updated.",
      });
      await fetchUser();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to update close account workflow",
        description: err instanceof Error ? err.message : "Failed to update close account workflow",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <section className="overflow-hidden rounded-[32px] border border-[#D9E8F6] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FBFF_48%,#EEF6FF_100%)] shadow-sm">
        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex items-start gap-5">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setAvatarOpen(true)}
                className="block rounded-[28px] focus:outline-none focus:ring-2 focus:ring-[#1ABFAD] focus:ring-offset-2"
              >
                <Avatar size="xl" className="h-20 w-20 rounded-[28px] border border-[#D9E8F6] bg-[#042042] shadow-lg">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-[28px] bg-[#042042] text-2xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAvatarOpen(true)}
                className="rounded-2xl"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Photo
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#1ABFAD]">
                  User Profile
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#042042]">
                  {user.name}
                </h1>
                <p className="text-sm leading-6 text-[#64748B]">
                  Review role access, verification state, and communication settings for this account.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-700">
                  {roleLabels[user.role] || user.role}
                </Badge>
                <Badge variant={user.isActive ? "success" : "outline"} className="rounded-full px-3 py-1">
                  {user.isActive ? "Active account" : "Inactive account"}
                </Badge>
                {isDeletedAccount ? (
                  <Badge variant="outline" className="rounded-full border-rose-200 px-3 py-1 text-rose-700">
                    Deleted account
                  </Badge>
                ) : null}
                <Badge
                  variant={user.emailVerificationStatus === "VERIFIED" ? "success" : "outline"}
                  className="rounded-full px-3 py-1"
                >
                  {user.emailVerificationStatus === "VERIFIED" ? "Email verified" : "Email pending"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                      return;
                    }

                    router.push("/admin/users");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Go back
                </button>
                <Link href="/admin/users">
                  <Button>Manage in Roster</Button>
                </Link>
                {canManageMutableAccount ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={
                      user.emailVerificationStatus === "VERIFIED"
                        ? handleMarkEmailUnverified
                        : handleMarkEmailVerified
                    }
                  >
                    {user.emailVerificationStatus === "VERIFIED"
                      ? "Mark Email Unverified"
                      : "Mark Email Verified"}
                  </Button>
                ) : null}
                {canManageMutableAccount && !isOwnAccount ? (
                  <Button
                    type="button"
                    variant={user.isActive ? "outline" : "default"}
                    disabled={saving}
                    onClick={handleStatusToggle}
                  >
                    {user.isActive ? "Deactivate User" : "Reactivate User"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Member since</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {format(new Date(user.createdAt), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {format(new Date(user.updatedAt), "dd MMM yyyy")}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{user.email}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{user.phone || "Not added"}</p>
            </div>
          </div>
        </div>
      </section>

      {user.pendingEmailChange && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Pending email verification</p>
          <p className="mt-1 text-sm text-amber-800">
            {user.pendingEmailChange.newEmail} is waiting for verification until{" "}
            {format(new Date(user.pendingEmailChange.expiresAt), "dd MMM yyyy, hh:mm a")}.
          </p>
        </Card>
      )}

      {isDeletedAccount && (
        <Card className="border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-900">Deleted account</p>
          <p className="mt-1 text-sm text-rose-800">
            This account has already been anonymized under the erasure workflow. It is now read-only and cannot be reactivated, edited, or re-verified.
          </p>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Account Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Core identity and sign-in information for this user.
            </p>
          </div>
          <div className="space-y-3 p-6">
            {[
              { label: "Role", value: roleLabels[user.role] || user.role, icon: Shield },
              { label: "Email", value: user.email, icon: Mail },
              { label: "Phone", value: user.phone || "Not added", icon: Phone },
              {
                label: "Verification",
                value:
                  user.emailVerificationStatus === "VERIFIED"
                    ? user.emailVerifiedAt
                      ? `Verified ${format(new Date(user.emailVerifiedAt), "dd MMM yyyy")}`
                      : "Verified"
                    : "Pending verification",
                icon: BadgeCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-2 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                  <span className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Admin Controls</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Admin and Super Admins can manage role, contact details, access state, and email preferences here.
              </p>
            </div>
            <div className="space-y-4 p-6">
              {!canManageTarget && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  This is a Super Admin account. Only a Super Admin can change its role, status, or access settings.
                </div>
              )}
              {isDeletedAccount && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                  This account has been deleted through anonymization. Admin controls are locked for audit and compliance.
                </div>
              )}

              <div className="grid gap-4">
                <Input
                  label="Full Name"
                  value={form.name}
                  disabled={!canManageMutableAccount || saving}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  disabled={!canManageMutableAccount || saving}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  helperText="Changing this sends a verification link to the new address before the sign-in email updates."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50"
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  disabled={!canManageMutableAccount || saving}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50"
                />
                <Select
                  label="Role"
                  value={form.role}
                  disabled={!canManageMutableAccount || saving}
                  onValueChange={(value) => setForm((current) => ({ ...current, role: value }))}
                  options={roleOptions.map((role) => ({
                    value: role,
                    label: roleLabels[role] || role,
                    disabled: role === "SUPER_ADMIN" && !canManageSuperAdmin,
                  }))}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50"
                />
                <Input
                  label="Reset Password"
                  type="password"
                  value={form.password}
                  disabled={!canManageMutableAccount || saving}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  helperText="Leave this blank if you do not want to change the password."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.transactionalEmailsEnabled}
                    disabled={!canManageMutableAccount || saving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        transactionalEmailsEnabled: event.target.checked,
                      }))
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Transactional emails</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Keep billing, account, and service emails enabled unless there is a documented compliance reason to suppress them.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.marketingEmailsEnabled}
                    disabled={!canManageMutableAccount || saving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        marketingEmailsEnabled: event.target.checked,
                      }))
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Promotional emails</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Respect campaign opt-out preferences independently from operational or billing communication.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {!isOwnAccount && (
                  <Button
                    type="button"
                    variant={user.isActive ? "outline" : "default"}
                    disabled={!canManageTarget || saving}
                    onClick={handleStatusToggle}
                  >
                    {user.isActive ? "Deactivate User" : "Reactivate User"}
                  </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canManageTarget || saving}
                    onClick={
                      user.emailVerificationStatus === "VERIFIED"
                        ? handleMarkEmailUnverified
                        : handleMarkEmailVerified
                    }
                  >
                    {user.emailVerificationStatus === "VERIFIED"
                      ? "Mark Email Unverified"
                      : "Mark Email Verified"}
                  </Button>
                </div>
                <Button type="button" disabled={!canManageMutableAccount || saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save User Changes"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Close Account Workflow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track erasure requests, restrict access, retain finance-critical records, or anonymize the account when no blockers remain.
              </p>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {user.erasureRequest?.status
                      ? user.erasureRequest.status.replaceAll("_", " ")
                      : "No request yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Recommended path
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {user.erasureImpact?.recommendedStatus
                      ? user.erasureImpact.recommendedStatus.replaceAll("_", " ")
                      : "ANONYMIZED"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Invoices", value: user.erasureImpact?.invoices ?? 0 },
                  { label: "Payments", value: user.erasureImpact?.payments ?? 0 },
                  { label: "Quotations", value: user.erasureImpact?.quotations ?? 0 },
                  { label: "Active projects", value: user.erasureImpact?.activeProjects ?? 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  user.erasureImpact?.requiresRetention
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {user.erasureImpact?.requiresRetention
                  ? "This account is linked to financial or delivery records. Restrict access first, then retain the minimum record set with a documented reason."
                  : "No retention blockers were detected. This account can be anonymized after review if the request is approved."}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    User request reason
                  </label>
                  <textarea
                    rows={4}
                    value={erasureForm.requestedReason}
                    onChange={(event) =>
                      setErasureForm((current) => ({
                        ...current,
                        requestedReason: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1ABFAD] focus:bg-white"
                    placeholder="Document the user's erasure request or account closure reason."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Retention reason
                  </label>
                  <textarea
                    rows={3}
                    value={erasureForm.retentionReason}
                    onChange={(event) =>
                      setErasureForm((current) => ({
                        ...current,
                        retentionReason: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1ABFAD] focus:bg-white"
                    placeholder="Explain why finance, legal, tax, or project records must still be retained."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Internal notes
                  </label>
                  <textarea
                    rows={3}
                    value={erasureForm.internalNotes}
                    onChange={(event) =>
                      setErasureForm((current) => ({
                        ...current,
                        internalNotes: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1ABFAD] focus:bg-white"
                    placeholder="Capture the review outcome, legal basis, or operator notes."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || isDeletedAccount}
                  onClick={handleCreateErasureRequest}
                >
                  {user.erasureRequest ? "Refresh Request Context" : "Create Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || !user.erasureRequest || isDeletedAccount}
                  onClick={() => handleErasureStatusUpdate("RESTRICTED")}
                >
                  Mark Restricted
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || !user.erasureRequest || isDeletedAccount}
                  onClick={() => handleErasureStatusUpdate("RETAINED_FOR_FINANCE")}
                >
                  Retain for Finance
                </Button>
                <Button
                  type="button"
                  disabled={saving || !user.erasureRequest || isDeletedAccount}
                  onClick={() => handleErasureStatusUpdate("ANONYMIZED")}
                >
                  Anonymize Account
                </Button>
              </div>

              {user.auditTrail && user.auditTrail.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">Recent account access audit</p>
                  <div className="space-y-2">
                    {user.auditTrail
                      .filter((entry) => entry.action.includes("erasure"))
                      .slice(0, 5)
                      .map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-900">{entry.summary}</p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(entry.createdAt), "dd MMM yyyy")}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">By {entry.userName}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Email Preferences</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Delivery preferences and communication guardrails.
              </p>
            </div>
            <div className="space-y-3 p-6">
              {[
                user.transactionalEmailsEnabled
                  ? "Transactional emails are enabled."
                  : "Transactional emails are opted out.",
                user.marketingEmailsEnabled
                  ? "Promotional emails are enabled."
                  : "Promotional emails are opted out.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <BellOff className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="text-sm leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Role Access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What this account is expected to manage in the platform.
              </p>
            </div>
            <div className="space-y-3 p-6">
              {[
                "Admin visibility and role-bound access apply.",
                user.role === "CLIENT"
                  ? "Portal-only usage and client communication controls."
                  : "Internal operations access based on role policy.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <UserCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="text-sm leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent className="max-w-3xl rounded-[28px] border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle>{user.name}</DialogTitle>
            <DialogDescription>
              Full-size profile photo preview.
            </DialogDescription>
          </DialogHeader>
          {user.avatar ? (
            <div className="flex justify-end border-b border-slate-100 px-6 py-3">
              <a
                href={user.avatar}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#0B6E99] transition hover:text-[#084c72]"
              >
                Open in new tab
              </a>
            </div>
          ) : null}
          <div className="flex items-center justify-center bg-slate-950/95 p-6">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="max-h-[70vh] w-auto max-w-full rounded-3xl object-contain"
              />
            ) : (
              <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-dashed border-slate-700 text-slate-300">
                No profile photo uploaded
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
