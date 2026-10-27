"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Calendar,
  Phone,
  UserCheck,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Tag,
  Lock,
} from "lucide-react";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  issueWarning,
  banMember,
  unbanMember,
} from "@/app/actions/members";
import { Member, SubscriptionPlan, CustomBadge } from "@/types/database";
import { BackButton } from "@/components/BackButton";
import { getSubscriptionPlans } from "@/app/actions/subscriptions";
import { getCustomBadges } from "@/app/actions/badges";
import { getBadgeColorStyle } from "@/app/subscriptions/page";

export interface UIMember extends Member {
  status: "Active" | "Expired" | "Near Expiry" | "Recently Expired" | "Warnings" | "Banned";
  planDisplay: string;
  diffDays: number;
}

export default function MembersPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [members, setMembers] = useState<UIMember[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [customBadges, setCustomBadges] = useState<CustomBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "All" | "Active" | "Near Expiry" | "Recently Expired" | "Warnings" | "Banned"
  >("All");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("All Plans");
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>("All Badges");
  const [discountIndicator, setDiscountIndicator] = useState<string>("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UIMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<UIMember | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [warningMember, setWarningMember] = useState<UIMember | null>(null);
  const [banMemberTarget, setBanMemberTarget] = useState<UIMember | null>(null);

  // Form inputs for Walk-in Registration / Edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    badges: [] as string[],
    plan_type: "",
    amount_paid: 1500,
    payment_method: "Cash" as 'Cash' | 'GCash' | 'Card' | 'Bank Transfer',
    join_date: "",
    expiration_date: "",
  });

  // Disciplinary Modal inputs
  const [warningNote, setWarningNote] = useState("");
  const [banReasonInput, setBanReasonInput] = useState("");

  const mapDbMember = (m: Member): UIMember => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(m.expiration_date);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let status: UIMember["status"] = "Active";
    if (m.is_banned) {
      status = "Banned";
    } else if ((m.warning_count || 0) > 0 && diffDays >= 0) {
      status = "Warnings";
    } else if (diffDays >= 0 && diffDays <= 3) {
      status = "Near Expiry";
    } else if (diffDays < 0 && diffDays >= -30) {
      status = "Recently Expired";
    } else if (diffDays < 0) {
      status = "Expired";
    } else {
      status = "Active";
    }

    return {
      ...m,
      status,
      planDisplay: m.plan_type || "Standard Plan",
      diffDays,
    };
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, plansRes, badgesRes] = await Promise.all([
        getMembers(),
        getSubscriptionPlans(),
        getCustomBadges(),
      ]);

      if (membersRes.data) {
        setMembers(membersRes.data.map(mapDbMember));
      }
      if (plansRes.data) {
        setSubscriptionPlans(plansRes.data);
      }
      if (badgesRes.data) {
        setCustomBadges(badgesRes.data);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to fetch data" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleRealtime = () => {
      loadData();
    };
    window.addEventListener("supabase-realtime-update", handleRealtime);
    return () => {
      window.removeEventListener("supabase-realtime-update", handleRealtime);
    };
  }, []);

  // Counts for tabs
  const counts = {
    All: members.length,
    Active: members.filter((m) => !m.is_banned && m.diffDays >= 0).length,
    "Near Expiry": members.filter((m) => !m.is_banned && m.diffDays >= 0 && m.diffDays <= 3).length,
    "Recently Expired": members.filter((m) => !m.is_banned && m.diffDays < 0 && m.diffDays >= -30).length,
    Warnings: members.filter((m) => !m.is_banned && (m.warning_count || 0) > 0).length,
    Banned: members.filter((m) => m.is_banned).length,
  };

  const handleOpenAddModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultPlan = subscriptionPlans[0] || { name: "Standard Plan", duration_days: 30, price: 1500 };
    const expDateStr = new Date(Date.now() + defaultPlan.duration_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFormData({
      name: "",
      phone: "",
      badges: [],
      plan_type: defaultPlan.name,
      amount_paid: defaultPlan.price,
      payment_method: "Cash",
      join_date: todayStr,
      expiration_date: expDateStr,
    });
    setDiscountIndicator("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: UIMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      badges: member.badges || [],
      plan_type: member.plan_type || (subscriptionPlans[0]?.name ?? "Standard Plan"),
      amount_paid: member.amount_paid || 1500,
      payment_method: member.payment_method || "Cash",
      join_date: member.join_date,
      expiration_date: member.expiration_date,
    });
    setDiscountIndicator("");
  };

  const handleBadgeToggle = (badgeName: string) => {
    const currentBadges = formData.badges || [];
    const isAlreadySelected = currentBadges.includes(badgeName);
    const updatedBadges = isAlreadySelected
      ? currentBadges.filter((b) => b !== badgeName)
      : [...currentBadges, badgeName];

    const currentPlan = subscriptionPlans.find((p) => p.name === formData.plan_type) || subscriptionPlans[0];
    let basePrice = currentPlan ? currentPlan.price : 1500;

    let maxDiscount = 0;
    let appliedBadgeName = "";
    updatedBadges.forEach((bName) => {
      const bObj = customBadges.find((cb) => cb.name === bName);
      if (bObj && (bObj.discount_percent || 0) > maxDiscount) {
        maxDiscount = bObj.discount_percent || 0;
        appliedBadgeName = bObj.name;
      }
    });

    const finalPrice = Math.round(basePrice * (1 - maxDiscount / 100));
    const indicator = maxDiscount > 0 ? `${maxDiscount}% ${appliedBadgeName} Discount Applied!` : "";

    setFormData((prev) => ({
      ...prev,
      badges: updatedBadges,
      amount_paid: finalPrice,
    }));
    setDiscountIndicator(indicator);
  };

  const handlePlanSelection = (selectedPlan: SubscriptionPlan) => {
    const joinDateObj = new Date(formData.join_date || Date.now());
    const calculatedExpiration = new Date(joinDateObj.getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let maxDiscount = 0;
    let appliedBadgeName = "";
    (formData.badges || []).forEach((bName) => {
      const bObj = customBadges.find((cb) => cb.name === bName);
      if (bObj && (bObj.discount_percent || 0) > maxDiscount) {
        maxDiscount = bObj.discount_percent || 0;
        appliedBadgeName = bObj.name;
      }
    });

    const finalPrice = Math.round(selectedPlan.price * (1 - maxDiscount / 100));
    const indicator = maxDiscount > 0 ? `${maxDiscount}% ${appliedBadgeName} Discount Applied!` : "";

    setFormData((prev) => ({
      ...prev,
      plan_type: selectedPlan.name,
      amount_paid: finalPrice,
      expiration_date: calculatedExpiration,
    }));
    setDiscountIndicator(indicator);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await createMember({
        name: formData.name,
        phone: formData.phone,
        badges: formData.badges,
        plan_type: formData.plan_type,
        amount_paid: Number(formData.amount_paid),
        payment_method: formData.payment_method,
        join_date: formData.join_date,
        expiration_date: formData.expiration_date,
      });

      if (res.success) {
        setFeedback({ type: "success", message: "Walk-in registration successful! Membership activated." });
        setIsAddModalOpen(false);
        await loadData();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to register walk-in member" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await updateMember(editingMember.id, {
        name: formData.name,
        phone: formData.phone,
        badges: formData.badges,
        plan_type: formData.plan_type,
        amount_paid: Number(formData.amount_paid),
        payment_method: formData.payment_method,
        join_date: formData.join_date,
        expiration_date: formData.expiration_date,
      });

      if (res.success) {
        setFeedback({ type: "success", message: "Member record updated successfully!" });
        setEditingMember(null);
        await loadData();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update member" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!deletingMember) return;

    if (!deletePassword) {
      setDeleteError("Admin password is required to confirm deletion.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setDeleteError(null);
    try {
      const res = await deleteMember(deletingMember.id, deletePassword);
      if (res.success) {
        setFeedback({ type: "success", message: `Member record for "${deletingMember.name}" deleted successfully!` });
        setDeletingMember(null);
        setDeletePassword("");
        setDeleteError(null);
        await loadData();
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete member. Incorrect admin password.");
      }
    } catch (err: any) {
      setDeleteError(err?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleIssueWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningMember || !warningNote) return;

    setIsSubmitting(true);
    try {
      const res = await issueWarning(warningMember.id, warningNote);
      if (res.success) {
        setFeedback({ type: "success", message: `Warning issued to ${warningMember.name} successfully!` });
        setWarningMember(null);
        setWarningNote("");
        await loadData();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to issue warning" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleBanToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banMemberTarget) return;

    setIsSubmitting(true);
    try {
      let res;
      if (banMemberTarget.is_banned) {
        res = await unbanMember(banMemberTarget.id);
      } else {
        res = await banMember(banMemberTarget.id, banReasonInput || "Policy Violation");
      }

      if (res.success) {
        setFeedback({
          type: "success",
          message: banMemberTarget.is_banned
            ? `Ban lifted for ${banMemberTarget.name}.`
            : `${banMemberTarget.name} has been banned successfully.`,
        });
        setBanMemberTarget(null);
        setBanReasonInput("");
        await loadData();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update ban status" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);

    let matchesTab = true;
    if (activeTab === "Active") {
      matchesTab = !member.is_banned && member.diffDays >= 0;
    } else if (activeTab === "Near Expiry") {
      matchesTab = !member.is_banned && member.diffDays >= 0 && member.diffDays <= 3;
    } else if (activeTab === "Recently Expired") {
      matchesTab = !member.is_banned && member.diffDays < 0 && member.diffDays >= -30;
    } else if (activeTab === "Warnings") {
      matchesTab = !member.is_banned && (member.warning_count || 0) > 0;
    } else if (activeTab === "Banned") {
      matchesTab = !!member.is_banned;
    }

    const matchesPlan =
      selectedPlanFilter === "All Plans" || (member.plan_type || "") === selectedPlanFilter;

    const matchesBadge =
      selectedBadgeFilter === "All Badges" || (member.badges && member.badges.includes(selectedBadgeFilter));

    return matchesSearch && matchesTab && matchesPlan && matchesBadge;
  });

  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-zinc-900 p-8 rounded-2xl border-3 border-zinc-700 text-zinc-300 font-bold text-center">
          Loading members directory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
      <BackButton />

      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl flex items-center gap-3 font-extrabold text-sm shadow-soft-lg transition-all border-3 border-zinc-700 animate-bounce ${
            feedback.type === "success" ? "bg-emerald-900 text-emerald-100" : "bg-red-900 text-red-100"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-5 sm:p-8 rounded-2xl shadow-soft border-3 border-zinc-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border-2 border-zinc-700">
            <Users className="w-3.5 h-3.5 text-red-500" /> Front-Desk Operations
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">
            Members Directory
          </h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">
            Manage subscriptions, live database badges, and enforce disciplinary warnings/bans.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-soft border-2 border-red-500/50 transition-all min-h-[56px] cursor-pointer"
        >
          <UserPlus className="w-5 h-5" /> New Walk-in Registration
        </button>
      </div>

      {/* Categorized Filter Tabs with Count Badges */}
      <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-soft border-3 border-zinc-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "All", label: "All", badgeBg: "bg-zinc-800 text-zinc-300" },
                { key: "Active", label: "Active", badgeBg: "bg-emerald-950/80 text-emerald-300" },
                { key: "Near Expiry", label: "Near Expiry", badgeBg: "bg-amber-950/80 text-amber-300" },
                { key: "Recently Expired", label: "Recently Expired", badgeBg: "bg-rose-950/80 text-rose-300" },
                { key: "Warnings", label: "Warnings", badgeBg: "bg-orange-950/80 text-orange-300" },
                { key: "Banned", label: "Banned", badgeBg: "bg-red-950/80 text-red-300" },
              ] as const
            ).map((tab) => {
              const count = counts[tab.key];
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all border-2 min-h-[48px] cursor-pointer ${
                    isSelected
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-xl text-xs border font-extrabold ${
                      isSelected ? "bg-white/20 text-white border-white/30" : tab.badgeBg
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subscription Plan & Badge Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-200 text-xs font-extrabold focus:outline-none min-h-[48px] shadow-xs"
              >
                <option value="All Plans">All Subscription Plans</option>
                {subscriptionPlans.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} (₱{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-400" />
              <select
                value={selectedBadgeFilter}
                onChange={(e) => setSelectedBadgeFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-200 text-xs font-extrabold focus:outline-none min-h-[48px] shadow-xs"
              >
                <option value="All Badges">All Badges</option>
                {customBadges.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.discount_percent ?? 0}% off)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold min-h-[48px]"
            />
          </div>
        </div>
      </div>

      {/* Members Data Table */}
      <div id="tutorial-members-table" className="bg-zinc-900 rounded-2xl shadow-soft border-3 border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-950 border-b-3 border-zinc-700 text-zinc-400 uppercase text-xs font-extrabold tracking-wider">
                <th className="py-4 px-6">Member & Badges</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Plan / Expiry</th>
                <th className="py-4 px-6">Disciplinary Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-400 font-medium">
                    Loading members from live database...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-zinc-400 font-medium space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 text-red-500 border-2 border-zinc-700 flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-base font-extrabold text-zinc-100">No members found in {activeTab}</p>
                    <p className="text-xs text-zinc-400 font-medium">Try switching categories, plan filter, or adjusting your search query.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-zinc-800/60 transition-colors ${
                      member.is_banned ? "bg-red-950/30" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-extrabold text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl font-extrabold flex items-center justify-center text-xs border-2 border-zinc-700 shadow-xs shrink-0 ${
                            member.is_banned ? "bg-red-950 text-red-300" : "bg-zinc-800 text-zinc-200"
                          }`}
                        >
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-[160px] sm:max-w-none">{member.name}</span>
                            {member.is_banned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-red-600 text-white text-[10px] font-extrabold border border-red-500 shadow-xs animate-pulse">
                                BANNED
                              </span>
                            )}
                            {(member.warning_count || 0) > 0 && !member.is_banned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-amber-950 text-amber-300 text-[10px] font-extrabold border border-amber-700 shadow-xs">
                                Warnings: {member.warning_count}
                              </span>
                            )}
                          </div>
                          {member.badges && member.badges.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {member.badges.map((bName) => {
                                const foundBadge = customBadges.find((b) => b.name === bName || b.id === bName);
                                const colorClass = foundBadge ? getBadgeColorStyle(foundBadge.color) : "bg-zinc-800 text-zinc-300 border-zinc-700";
                                return (
                                  <span
                                    key={bName}
                                    className={`rounded-xl border font-bold text-xs px-2.5 py-0.5 ${colorClass}`}
                                  >
                                    {foundBadge ? foundBadge.name : bName}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <span className="text-xs font-medium text-zinc-400 block mt-0.5">
                            Joined: {member.join_date}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-zinc-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        {member.phone}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-zinc-100">
                      <div>{member.planDisplay}</div>
                      <div className="text-xs font-medium text-zinc-400">Exp: {member.expiration_date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-2xl font-extrabold border ${
                            member.is_banned
                              ? "bg-red-950/80 text-red-300 border-red-700/60"
                              : member.status === "Active"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                              : member.status === "Near Expiry"
                              ? "bg-amber-950/80 text-amber-300 border-amber-700/60"
                              : "bg-rose-950/80 text-rose-300 border-rose-700/60"
                          }`}
                        >
                          {member.status}
                        </span>
                        {member.violation_notes && (
                          <p className="text-[11px] font-medium text-zinc-400 max-w-[200px] truncate" title={member.violation_notes}>
                            Note: {member.violation_notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td id="tutorial-members-actions" className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          onClick={() => {
                            setWarningMember(member);
                            setWarningNote("");
                          }}
                          className="px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700 transition font-extrabold text-xs flex items-center gap-1 min-h-[40px] cursor-pointer"
                          title="Issue Warning"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Warn
                        </button>

                        <button
                          onClick={() => {
                            setBanMemberTarget(member);
                            setBanReasonInput(member.ban_reason || "");
                          }}
                          className={`px-3 py-2 rounded-lg border transition font-extrabold text-xs flex items-center gap-1 min-h-[40px] cursor-pointer ${
                            member.is_banned
                              ? "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700"
                              : "bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700"
                          }`}
                          title={member.is_banned ? "Lift Ban" : "Ban Member"}
                        >
                          {member.is_banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {member.is_banned ? "Unban" : "Ban"}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="p-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition min-h-[40px] min-w-[40px] flex items-center justify-center font-bold cursor-pointer"
                          title="Edit Member"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingMember(member);
                            setDeletePassword("");
                            setDeleteError(null);
                          }}
                          className="p-2 rounded-2xl bg-zinc-800 hover:bg-red-950 text-zinc-200 border border-zinc-700 transition min-h-[40px] min-w-[40px] flex items-center justify-center font-bold cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disciplinary Warning Modal */}
      {warningMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-3 border-zinc-700 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-3 bg-amber-950/80 rounded-2xl border-2 border-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-zinc-100">
                Issue Warning to {warningMember.name}
              </h2>
            </div>
            <form onSubmit={handleIssueWarningSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Violation / Incident Note
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Failure to rack weights / Gym rule infraction..."
                  value={warningNote}
                  onChange={(e) => setWarningNote(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setWarningMember(null)}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-sm border-2 border-zinc-700 min-h-[48px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-soft border-2 border-amber-500 disabled:opacity-50 min-h-[48px] cursor-pointer"
                >
                  {isSubmitting ? "Issuing..." : "Confirm Warning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disciplinary Ban / Unban Modal */}
      {banMemberTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-3 border-zinc-700 space-y-4">
            <div className={`flex items-center gap-3 ${banMemberTarget.is_banned ? "text-emerald-400" : "text-red-400"}`}>
              <div className={`p-3 rounded-2xl border-2 ${banMemberTarget.is_banned ? "bg-emerald-950/80 border-emerald-700" : "bg-red-950/80 border-red-700"}`}>
                {banMemberTarget.is_banned ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-extrabold text-zinc-100">
                {banMemberTarget.is_banned ? `Lift Ban for ${banMemberTarget.name}` : `Suspend / Ban ${banMemberTarget.name}`}
              </h2>
            </div>
            <form onSubmit={handleBanToggleSubmit} className="space-y-4">
              {!banMemberTarget.is_banned && (
                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                    Ban Reason / Justification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Repeated policy violations / misconduct"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none"
                  />
                </div>
              )}
              {banMemberTarget.is_banned && (
                <p className="text-xs font-medium text-zinc-400">
                  This will restore gym access and lift the suspension status for <strong className="text-zinc-100">{banMemberTarget.name}</strong>.
                </p>
              )}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setBanMemberTarget(null)}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-sm border-2 border-zinc-700 min-h-[48px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-2xl text-white font-extrabold text-sm shadow-soft border-2 disabled:opacity-50 min-h-[48px] cursor-pointer ${
                    banMemberTarget.is_banned ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500" : "bg-red-600 hover:bg-red-700 border-red-500"
                  }`}
                >
                  {isSubmitting ? "Processing..." : banMemberTarget.is_banned ? "Confirm Lift Ban" : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-in Registration / Edit Modal */}
      {(isAddModalOpen || editingMember) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-3xl p-5 sm:p-8 w-[95vw] sm:w-full sm:max-w-xl shadow-soft-lg border-3 border-zinc-700 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-red-500" />
                {editingMember ? "Edit Member Record" : "New Walk-in Registration & Payment"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMember(null);
                }}
                className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-2 border-zinc-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingMember ? handleEditMember : handleAddMember}
              className="space-y-5"
            >
              {/* Step 1: Member Details */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-2xl inline-block border-2 border-zinc-700">
                  Step 1: Member Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-bold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +639170000000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-bold min-h-[52px]"
                    />
                  </div>
                </div>
              </div>

              {/* Client Badges Multi-select Section */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-2xl inline-block border-2 border-zinc-700">
                  Live Database Badges & Automatic Discounts
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {customBadges.map((badge) => {
                    const isChecked = (formData.badges || []).includes(badge.name);
                    const colorStyle = getBadgeColorStyle(badge.color);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => handleBadgeToggle(badge.name)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isChecked
                            ? "bg-red-600 text-white border-red-500 shadow-soft"
                            : "bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold truncate">{badge.name}</span>
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${isChecked ? "bg-white text-red-600 font-extrabold border-white" : "bg-zinc-900 border-zinc-700"}`}>
                            {isChecked ? "✓" : ""}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold mt-1 px-2 py-0.5 rounded-xl border ${isChecked ? "bg-white/20 text-white border-white/30" : colorStyle}`}>
                          {badge.discount_percent ? `${badge.discount_percent}% OFF` : "Standard"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {discountIndicator && (
                  <div className="p-3 bg-emerald-950/80 text-emerald-300 font-extrabold text-xs rounded-2xl border border-emerald-700 flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{discountIndicator}</span>
                  </div>
                )}
              </div>

              {/* Step 2: Dynamic Subscription Plan Selection & Dates */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-2xl inline-block border-2 border-zinc-700">
                  Step 2: Subscription Plan & Dates
                </span>

                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1.5">
                    Select Gym Subscription Plan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subscriptionPlans.map((plan) => {
                      const isSelected = formData.plan_type === plan.name;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => handlePlanSelection(plan)}
                          className={`p-3.5 rounded-2xl text-left transition-all border-2 flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? "bg-red-600 text-white border-red-500 shadow-soft"
                              : "bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm">{plan.name}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-xl border ${isSelected ? "bg-white/20 text-white border-white/30" : "bg-zinc-900 text-zinc-400 border-zinc-700"}`}>
                              {plan.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-2 opacity-90 font-bold">
                            <span>{plan.duration_days} days</span>
                            <span className="text-emerald-400 font-extrabold">₱{plan.price.toLocaleString()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.join_date}
                      onChange={(e) =>
                        setFormData({ ...formData, join_date: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-bold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Expiration Date (Auto-calculated)
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiration_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiration_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-bold min-h-[52px]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Details */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-2xl inline-block border-2 border-zinc-700">
                  Step 3: Payment Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Amount Paid (₱)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.amount_paid}
                      onChange={(e) =>
                        setFormData({ ...formData, amount_paid: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-extrabold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value as any })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-extrabold min-h-[52px]"
                    >
                      <option value="Cash">Cash</option>
                      <option value="GCash">GCash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-zinc-800 sticky bottom-0 bg-zinc-900 pb-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-sm border-2 border-zinc-700 min-h-[52px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-soft border-2 border-red-500 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  {isSubmitting ? "Processing..." : "Confirm Payment & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-3 border-zinc-700 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/80 rounded-2xl border-2 border-red-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-zinc-100">
                Confirm Member Deletion
              </h2>
            </div>
            <p className="text-sm font-medium text-zinc-400">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-100">{deletingMember.name}</strong>?
              This action cannot be undone.
            </p>

            <form onSubmit={handleDeleteMember} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-extrabold text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Confirm Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter admin password (e.g. admin123)"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    if (deleteError) setDeleteError(null);
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none focus:border-red-500 min-h-[48px]"
                />
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-red-950/90 border border-red-700 text-red-200 font-extrabold text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setDeletingMember(null);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-sm border-2 border-zinc-700 min-h-[48px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !deletePassword}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-soft border-2 border-red-500 disabled:opacity-50 min-h-[48px] cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {isSubmitting ? "Deleting..." : "Confirm & Delete Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

