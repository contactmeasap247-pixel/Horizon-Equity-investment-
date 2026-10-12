"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Email Change States
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      setProfileSaving(true);
      const res = await api.put("/users/profile", {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
      });

      setUser(res.data);
      setProfileSuccess("Personal profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newEmail.trim() || !emailPassword) {
      setEmailError("Please enter your new email and account password.");
      return;
    }

    try {
      setEmailSaving(true);
      await api.post("/users/request-email-change", {
        new_email: newEmail.trim(),
        current_password: emailPassword,
      });

      if (user) {
        setUser({ ...user, email: newEmail.trim() });
      }
      setEmailSuccess(`Account email updated to ${newEmail.trim()}.`);
      setNewEmail("");
      setEmailPassword("");
      setTimeout(() => setEmailSuccess(""), 4000);
    } catch (err: any) {
      setEmailError(err.response?.data?.detail || "Failed to update email address.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      await api.post("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#4388F5]" />
            Account & Security Settings
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Manage your personal profile, email credentials, password security, and compliance standing.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm font-semibold self-start sm:self-auto"
        >
          <span>Return to Overview</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Profile */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="panel p-6 bg-[#111821] border-white/10 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <User className="h-5 w-5 text-[#4388F5]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Profile Information
              </h3>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="Residential address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Email Update Card */}
          <div className="panel p-6 bg-[#111821] border-white/10 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Mail className="h-5 w-5 text-[#27C58B]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Email Authentication Address
              </h3>
            </div>

            <div className="p-3 rounded bg-[#0B0F14] border border-white/10 flex justify-between items-center text-xs">
              <span className="text-[#7D8998]">Current Email:</span>
              <span className="font-mono font-bold text-white">{user?.email}</span>
            </div>

            {emailSuccess && (
              <div className="p-3 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="p-3 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  New Email Address *
                </label>
                <input
                  type="email"
                  placeholder="new.email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Confirm Current Password *
                </label>
                <input
                  type="password"
                  placeholder="Your current account password..."
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={emailSaving}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  {emailSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Update Email Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Password & Compliance Standing */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Change Password Card */}
          <div className="panel p-6 bg-[#111821] border-white/10 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Lock className="h-5 w-5 text-[#F3B94F]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Security & Password
              </h3>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Account Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Compliance Card */}
          <div className="panel p-5 bg-[#111821] border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#4388F5]" />
                KYC Regulatory Standing
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  user?.kyc_status === "verified" || user?.kyc_status === "approved"
                    ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                    : "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                }`}
              >
                {user?.kyc_status || "Pending"}
              </span>
            </div>
            <p className="text-[11px] text-[#A6B0BE] leading-relaxed">
              Maintain regulatory compliance to ensure unhindered capital movements and higher borrowing limits.
            </p>
            <Link
              href="/dashboard/verification"
              className="text-xs font-semibold text-[#4388F5] hover:underline flex items-center gap-1"
            >
              <span>Manage Identity Verification Documents →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
