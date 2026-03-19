'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react';

interface ProfileData {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
}

const inputClassName =
  'w-full rounded-2xl border border-[#D7E3F0] bg-[#F8FBFF] px-4 py-3 text-[#042042] outline-none transition-all focus:border-[#1ABFAD] focus:bg-white focus:ring-2 focus:ring-[#1ABFAD]/20';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/portal/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const result = await response.json();
        setProfile(result);
        setFormData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const updated = await response.json();
      setProfile(updated);
      setFormData(updated);
      setEditMode(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/portal/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');
      setPasswordMode(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account and contact information"
      />

      {error && (
        <div className="flex items-start gap-4 rounded-3xl border border-red-200 bg-[linear-gradient(180deg,#FFF6F6_0%,#FFF1F1_100%)] p-6 shadow-sm">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">There was a problem</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-4 rounded-3xl border border-green-200 bg-[linear-gradient(180deg,#F3FFF9_0%,#ECFFF6_100%)] p-6 shadow-sm">
          <CheckCircle className="mt-0.5 text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Saved successfully</h3>
            <p className="mt-1 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[32px] border border-[#D9E8F6] bg-[linear-gradient(135deg,#06284A_0%,#0B3763_54%,#115A84_100%)] p-8 text-white shadow-[0_24px_80px_rgba(4,32,66,0.18)]">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Skeleton className="h-56 rounded-[28px] bg-white/10" />
            <Skeleton className="h-56 rounded-[28px] bg-white/10" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-[#7CE6DA]">
                <UserCircle2 className="h-4 w-4" />
                Account details
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">
                Keep your client profile accurate so billing, documents, and updates reach the right people.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
                Profile changes also update your linked sign-in identity, which keeps the portal
                and account access in sync.
              </p>

              {profile && (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: 'Company',
                      value: profile.companyName || 'Not added',
                      icon: Building2,
                    },
                    {
                      label: 'Primary contact',
                      value: profile.contactPerson || 'Not added',
                      icon: UserCircle2,
                    },
                    {
                      label: 'Portal email',
                      value: profile.email,
                      icon: Mail,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-white/10 bg-white/10 p-5"
                    >
                      <item.icon className="h-5 w-5 text-[#7CE6DA]" />
                      <p className="mt-4 text-sm text-white/65">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7CE6DA]">
                Workspace checklist
              </p>
              <div className="mt-5 space-y-4">
                {[
                  'Billing contact and company information',
                  'Phone, address, and GST details',
                  'Portal email aligned with sign-in access',
                  'Password updates for shared client accounts',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7CE6DA]" />
                    <p className="text-sm leading-6 text-white/75">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[32px] border-[#DDE8F2] bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-[#042042]">Contact Information</CardTitle>
              <p className="mt-1 text-sm text-[#64748B]">
                This information is used across your client workspace and communication flows.
              </p>
            </div>
            {!loading && !editMode && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-[#D7E3F0] text-[#042042] hover:bg-[#F8FBFF]"
                onClick={() => setEditMode(true)}
              >
                Edit Details
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
            ) : editMode ? (
              <form onSubmit={handleEditProfile} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPerson: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">Address</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className={`${inputClassName} min-h-[120px] resize-y`}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gst || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, gst: e.target.value })
                    }
                    className={inputClassName}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="submit"
                    className="rounded-2xl bg-[#042042] px-5 text-white hover:bg-[#07315F]"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-[#D7E3F0] text-[#042042] hover:bg-[#F8FBFF]"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(profile || {});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : profile ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label: 'Company Name',
                    value: profile.companyName || 'Not added',
                    icon: Building2,
                  },
                  {
                    label: 'Contact Person',
                    value: profile.contactPerson || 'Not added',
                    icon: UserCircle2,
                  },
                  {
                    label: 'Email',
                    value: profile.email,
                    icon: Mail,
                  },
                  {
                    label: 'Phone',
                    value: profile.phone || 'Not added',
                    icon: Phone,
                  },
                  {
                    label: 'Address',
                    value: profile.address || 'Not added',
                    icon: MapPin,
                    fullWidth: true,
                  },
                  {
                    label: 'GST Number',
                    value: profile.gst || 'Not added',
                    icon: ShieldCheck,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-3xl border border-[#E6EEF7] bg-[#F8FBFF] p-5 ${
                      item.fullWidth ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white p-3 text-[#0D6C62] shadow-sm">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-[#042042]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-[#DDE8F2] bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-[#042042]">Security</CardTitle>
              <p className="mt-1 text-sm text-[#64748B]">
                Update the password used to access this portal account.
              </p>
            </div>
            {!passwordMode && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-[#D7E3F0] text-[#042042] hover:bg-[#F8FBFF]"
                onClick={() => setPasswordMode(true)}
              >
                Change Password
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {passwordMode ? (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className={`${inputClassName} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className={`${inputClassName} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#94A3B8]">
                    Use at least 8 characters for a stronger client account password.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="submit"
                    className="rounded-2xl bg-[#042042] px-5 text-white hover:bg-[#07315F]"
                  >
                    Change Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-[#D7E3F0] text-[#042042] hover:bg-[#F8FBFF]"
                    onClick={() => {
                      setPasswordMode(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 rounded-3xl border border-[#E6EEF7] bg-[#F8FBFF] p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-[#0D6C62] shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#042042]">Portal account security</p>
                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      Use this section to rotate credentials for shared client access and keep your
                      billing and document workspace protected.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-[#CADBEF] bg-white px-4 py-3 text-sm text-[#64748B]">
                  Last password change: Not available
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
