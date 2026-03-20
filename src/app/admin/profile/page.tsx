"use client";

import * as React from "react";
import {
  BadgeCheck,
  BellOff,
  Camera,
  Eye,
  KeyRound,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useCurrentSession } from "@/hooks/use-current-session";

type ProfileData = {
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
  createdAt: string;
  updatedAt: string;
  pendingEmailChange?: {
    id: string;
    newEmail: string;
    expiresAt: string;
    createdAt: string;
  } | null;
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  PROJECT_MANAGER: "Project Manager",
  FINANCE: "Finance",
};

const roleCapabilities: Record<string, string[]> = {
  SUPER_ADMIN: ["All admin areas", "User and settings management", "Billing control access"],
  ADMIN: ["Operations oversight", "Settings access", "Cross-team visibility"],
  SALES: ["Lead and client management", "Quotation visibility", "Project handoff tracking"],
  PROJECT_MANAGER: ["Project delivery oversight", "Client visibility", "Invoice coordination"],
  FINANCE: ["Invoice and payment access", "Collections tracking", "Billing oversight"],
};

export default function ProfilePage() {
  const { data: session, status, setSessionData } = useCurrentSession();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [profileForm, setProfileForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    transactionalEmailsEnabled: true,
    marketingEmailsEnabled: true,
  });
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const inputClassName =
    "h-11 rounded-2xl border-slate-200 bg-slate-50";

  const textareaBlockClassName =
    "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3";

  const syncSessionUser = React.useCallback(
    (nextProfile: ProfileData) => {
      setSessionData((current) => {
        if (!current?.user) {
          return current;
        }

        return {
          ...current,
          user: {
            ...current.user,
            name: nextProfile.name,
            email: nextProfile.email,
            image: nextProfile.avatar,
            role: nextProfile.role,
            emailVerificationStatus: nextProfile.emailVerificationStatus,
          },
        };
      });
    },
    [setSessionData]
  );

  const fetchProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/profile", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch profile");
      }

      setProfile(result.data);
      setProfileForm({
        name: result.data.name || "",
        email: result.data.pendingEmailChange?.newEmail || result.data.email || "",
        phone: result.data.phone || "",
        transactionalEmailsEnabled: result.data.transactionalEmailsEnabled !== false,
        marketingEmailsEnabled: result.data.marketingEmailsEnabled !== false,
      });
      syncSessionUser(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [syncSessionUser]);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [fetchProfile, status]);

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setProfile(result.data);
      syncSessionUser(result.data);

      setProfileForm({
        name: result.data.name || "",
        email: result.data.pendingEmailChange?.newEmail || result.data.email || "",
        phone: result.data.phone || "",
        transactionalEmailsEnabled: result.data.transactionalEmailsEnabled !== false,
        marketingEmailsEnabled: result.data.marketingEmailsEnabled !== false,
      });
      toast({
        type: "success",
        title: "Profile updated",
        description: result.message || "Your profile details were saved.",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update profile",
        description:
          err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload profile photo");
      }

      setProfile(result.data);
      syncSessionUser(result.data);
      toast({
        type: "success",
        title: "Profile photo updated",
        description: result.message || "Your profile photo was updated.",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Could not upload profile photo",
        description:
          err instanceof Error ? err.message : "Failed to upload profile photo",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePasswordSave = async () => {
    try {
      setSavingPassword(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        type: "success",
        title: "Password updated",
        description: "Your password was changed successfully.",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Could not update password",
        description:
          err instanceof Error ? err.message : "Failed to update password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (status === "loading" || loading) {
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <section className="overflow-hidden rounded-[32px] border border-[#D9E8F6] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FBFF_48%,#EEF6FF_100%)] shadow-sm">
        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex items-start gap-5">
            <div className="space-y-3">
              <Avatar size="xl" className="h-20 w-20 rounded-[28px] border border-[#D9E8F6] bg-[#042042] shadow-lg">
                {profile?.avatar ? (
                  <AvatarImage src={profile.avatar} alt={profile?.name || "Profile"} />
                ) : null}
                <AvatarFallback className="rounded-[28px] bg-[#042042] text-2xl font-semibold text-white">
                  {session?.user?.name
                    ?.split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleAvatarUpload(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl"
              >
                <Camera className="mr-2 h-4 w-4" />
                {uploadingAvatar ? "Uploading..." : "Update Photo"}
              </Button>
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
                  My Profile
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#042042]">
                  {profile?.name || session?.user?.name || "Admin User"}
                </h1>
                <p className="text-sm leading-6 text-[#64748B]">
                  Manage your account details, contact information, and sign-in security.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-700">
                  {roleLabels[profile?.role || ""] || profile?.role || session?.user?.role}
                </Badge>
                <Badge
                  variant={profile?.isActive ? "success" : "outline"}
                  className="rounded-full px-3 py-1"
                >
                  {profile?.isActive ? "Active account" : "Inactive account"}
                </Badge>
                <Badge
                  variant={profile?.emailVerificationStatus === "VERIFIED" ? "success" : "outline"}
                  className="rounded-full px-3 py-1"
                >
                  {profile?.emailVerificationStatus === "VERIFIED" ? "Email verified" : "Email verification pending"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Member since</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {profile?.createdAt ? format(new Date(profile.createdAt), "dd MMM yyyy") : "N/A"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {profile?.updatedAt ? format(new Date(profile.updatedAt), "dd MMM yyyy") : "N/A"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Verified email</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {profile?.email || session?.user?.email || "N/A"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {profile?.phone || "Not added"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      {success && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Personal Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These details appear across your admin account and sign-in identity.
              </p>
            </div>
            <div className="space-y-5 p-6">
              {profile?.pendingEmailChange && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-medium text-amber-900">
                    Pending email verification
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    {profile.pendingEmailChange.newEmail} is waiting for verification until{" "}
                    {format(new Date(profile.pendingEmailChange.expiresAt), "dd MMM yyyy, hh:mm a")}.
                    Your current verified sign-in email stays active until then.
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClassName}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, email: event.target.value }))
                  }
                  helperText="Changing this sends a verification link to the new address before the login email updates."
                  className={inputClassName}
                />
                <Input
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className={inputClassName}
                />
                <div className={textareaBlockClassName}>
                  <p className="text-sm font-medium text-slate-900">Role</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {roleLabels[profile?.role || ""] || profile?.role || session?.user?.role}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Email Preferences
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Control whether this account receives system emails and broader promotional communication.
              </p>
            </div>
            <div className="space-y-4 p-6">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={profileForm.transactionalEmailsEnabled}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      transactionalEmailsEnabled: event.target.checked,
                    }))
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Transactional emails</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Receive account, billing, and other direct system communication.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={profileForm.marketingEmailsEnabled}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      marketingEmailsEnabled: event.target.checked,
                    }))
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Promotional emails</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Receive product updates, announcements, and campaign communication.
                  </p>
                </div>
              </label>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Password & Security
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Change your password here to keep this admin account secure.
              </p>
            </div>
            <div className="space-y-4 p-6">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className={inputClassName}
              />
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                helperText="Use at least 8 characters."
                className={inputClassName}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className={inputClassName}
              />

              <div className="flex justify-end">
                <Button onClick={handlePasswordSave} disabled={savingPassword}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Account Summary
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A quick view of your current account state and identity information.
              </p>
            </div>
            <div className="space-y-3 p-6">
              {[
                {
                  label: "Account status",
                  value: profile?.isActive ? "Active" : "Inactive",
                  icon: BadgeCheck,
                },
                {
                  label: "Role",
                  value: roleLabels[profile?.role || ""] || profile?.role || "N/A",
                  icon: Shield,
                },
                {
                  label: "Email verification",
                  value:
                    profile?.emailVerificationStatus === "VERIFIED"
                      ? profile?.emailVerifiedAt
                        ? `Verified ${format(new Date(profile.emailVerifiedAt), "dd MMM yyyy")}`
                        : "Verified"
                      : "Pending verification",
                  icon: ShieldCheck,
                },
                {
                  label: "Phone",
                  value: profile?.phone || "Not added",
                  icon: Phone,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-slate-100 p-2 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-slate-600">{item.label}</span>
                    </div>
                    <span className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Communication Controls
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preference and deliverability signals for this account.
              </p>
            </div>
            <div className="space-y-3 p-6">
              {[
                profile?.transactionalEmailsEnabled
                  ? "Transactional emails are enabled for this account."
                  : "Transactional emails are opted out for this account.",
                profile?.marketingEmailsEnabled
                  ? "Promotional emails are enabled for this account."
                  : "Promotional emails are opted out for this account.",
                ...(roleCapabilities[profile?.role || ""] || ["Admin access"]),
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {item.toLowerCase().includes("email") ? (
                    <BellOff className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  ) : (
                    <UserCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  )}
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
            <DialogTitle>{profile?.name || session?.user?.name || "Profile photo"}</DialogTitle>
            <DialogDescription>
              Full-size profile photo preview.
            </DialogDescription>
          </DialogHeader>
          {profile?.avatar ? (
            <div className="flex justify-end border-b border-slate-100 px-6 py-3">
              <a
                href={profile.avatar}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#0B6E99] transition hover:text-[#084c72]"
              >
                Open in new tab
              </a>
            </div>
          ) : null}
          <div className="flex items-center justify-center bg-slate-950/95 p-6">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile?.name || "Profile"}
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
