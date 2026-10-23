"use client";

import React, { useState, useEffect } from "react";
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
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Send,
  ExternalLink,
  Filter,
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
import { Member, SubscriptionPlan } from "@/types/database";
import { BackButton } from "@/components/BackButton";
import { getStoredPlans, DEFAULT_SUBSCRIPTION_PLANS } from "@/app/subscriptions/page";

export interface UIMember extends Member {
  status: "Active" | "Expired" | "Near Expiry" | "Recently Expired" | "Warnings" | "Banned";
  planDisplay: string;
  diffDays: number;
}

export default function MembersPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [members, setMembers] = useState<UIMember[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(DEFAULT_SUBSCRIPTION_PLANS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "All" | "Active" | "Near Expiry" | "Recently Expired" | "Warnings" | "Banned"
  >("All");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("All Plans");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UIMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<UIMember | null>(null);
  const [warningMember, setWarningMember] = useState<UIMember | null>(null);
  const [banMemberTarget, setBanMemberTarget] = useState<UIMember | null>(null);
  const [smsModalTarget, setSmsModalTarget] = useState<{ member?: UIMember; isBulk?: boolean } | null>(null);

  // Form inputs for Walk-in Registration / Edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    plan_type: "1 Month Regular",
    amount_paid: 1500,
    payment_method: "Cash" as 'Cash' | 'GCash' | 'Card' | 'Bank Transfer',
    join_date: "",
    expiration_date: "",
  });

  // Disciplinary Modal inputs
  const [warningNote, setWarningNote] = useState("");
  const [banReasonInput, setBanReasonInput] = useState("");

  // SMS Templates & Inputs
  const [smsTemplates, setSmsTemplates] = useState<Record<string, string>>({
    "Near Expiry": "Hi {name}! Your gym membership expires on {date}. Renew before then to keep your workout streak going! - Management",
    "Recently Expired": "Hi {name}! Your gym membership has expired. Drop by the front desk this week to renew and waive re-registration fees! - Management",
    "Warnings": "Hi {name}, this is a formal notice regarding gym policy rules. Please visit the front desk regarding your logged notice. - Management",
    "Banned": "Hi {name}, your gym membership has been suspended due to policy violations. - Management",
    "Active": "Hi {name}! Thanks for staying active with us at the gym. Keep crushing your fitness goals! - Management",
    "All": "Hi {name}! Drop by the front desk for exciting updates and promotions. - Management",
  });
  const [customSmsMessage, setCustomSmsMessage] = useState("");

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
      planDisplay: m.plan_type || "1 Month Regular",
      diffDays,
    };
  };

  const fetchMembersList = async () => {
    setIsLoading(true);
    try {
      const res = await getMembers();
      if (res.data) {
        const mapped = res.data.map(mapDbMember);
        setMembers(mapped);
      } else {
        setMembers([]);
        if (res.error) {
          setFeedback({ type: "error", message: res.error });
        }
      }
    } catch (err: any) {
      setMembers([]);
      setFeedback({ type: "error", message: err?.message || "Failed to fetch members" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersList();
    const loadedPlans = getStoredPlans();
    if (loadedPlans && loadedPlans.length > 0) {
      setSubscriptionPlans(loadedPlans);
    }
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
    const defaultPlan = subscriptionPlans[0] || DEFAULT_SUBSCRIPTION_PLANS[0];
    const expDateStr = new Date(Date.now() + defaultPlan.duration_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFormData({
      name: "",
      phone: "",
      plan_type: defaultPlan.name,
      amount_paid: defaultPlan.price,
      payment_method: "Cash",
      join_date: todayStr,
      expiration_date: expDateStr,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: UIMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      plan_type: member.plan_type || "1 Month Regular",
      amount_paid: member.amount_paid || 1500,
      payment_method: member.payment_method || "Cash",
      join_date: member.join_date,
      expiration_date: member.expiration_date,
    });
  };

  const handlePlanSelection = (selectedPlan: SubscriptionPlan) => {
    const joinDateObj = new Date(formData.join_date || Date.now());
    const calculatedExpiration = new Date(joinDateObj.getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setFormData(prev => ({
      ...prev,
      plan_type: selectedPlan.name,
      amount_paid: selectedPlan.price,
      expiration_date: calculatedExpiration,
    }));
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
        plan_type: formData.plan_type,
        amount_paid: Number(formData.amount_paid),
        payment_method: formData.payment_method,
        join_date: formData.join_date,
        expiration_date: formData.expiration_date,
      });

      if (res.success) {
        setFeedback({ type: "success", message: "Walk-in registration successful! Membership activated." });
        setIsAddModalOpen(false);
        await fetchMembersList();
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
        plan_type: formData.plan_type,
        amount_paid: Number(formData.amount_paid),
        payment_method: formData.payment_method,
        join_date: formData.join_date,
        expiration_date: formData.expiration_date,
      });

      if (res.success) {
        setFeedback({ type: "success", message: "Member record updated successfully!" });
        setEditingMember(null);
        await fetchMembersList();
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

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await deleteMember(deletingMember.id);
      if (res.success) {
        setFeedback({ type: "success", message: "Member deleted successfully!" });
        setDeletingMember(null);
        await fetchMembersList();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete member" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred" });
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
        await fetchMembersList();
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
        await fetchMembersList();
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
      selectedPlanFilter === "All Plans" || (member.plan_type || "1 Month Regular") === selectedPlanFilter;

    return matchesSearch && matchesTab && matchesPlan;
  });

  const getTemplateForTab = (tabName: string) => {
    return smsTemplates[tabName] || smsTemplates["All"];
  };

  const renderPersonalizedMessage = (template: string, member: UIMember) => {
    return template
      .replace(/{name}/g, member.name)
      .replace(/{date}/g, member.expiration_date);
  };

  const handleOpenSmsModal = (member?: UIMember, isBulk = false) => {
    const currentTemplate = getTemplateForTab(activeTab);
    if (!isBulk && member) {
      setCustomSmsMessage(renderPersonalizedMessage(currentTemplate, member));
      setSmsModalTarget({ member, isBulk: false });
    } else {
      setCustomSmsMessage(currentTemplate);
      setSmsModalTarget({ isBulk: true });
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-[#E2E8F0] p-8 rounded-2xl border-4 border-slate-700 font-comic font-bold text-center">
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
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl flex items-center gap-3 font-extrabold text-sm shadow-soft-lg transition-all border-4 border-slate-700 animate-bounce ${
            feedback.type === "success" ? "bg-emerald-900 text-white" : "bg-rose-900 text-white"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-200 text-sky-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
            <Users className="w-3.5 h-3.5" /> Front-Desk Operations & SMS Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Members Directory & Carrier-Load SMS Engine
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            Manage subscriptions, enforce disciplinary warnings/bans, and dispatch SMS via SIM carrier load.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 transition-all min-h-[56px]"
        >
          <UserPlus className="w-5 h-5" /> New Walk-in Registration
        </button>
      </div>

      {/* Categorized Filter Tabs with Count Badges */}
      <div className="bg-[#E2E8F0] p-4 sm:p-6 rounded-2xl shadow-soft border-4 border-slate-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "All", label: "All", badgeBg: "bg-slate-200 text-slate-900" },
                { key: "Active", label: "Active", badgeBg: "bg-emerald-200 text-emerald-950" },
                { key: "Near Expiry", label: "Near Expiry", badgeBg: "bg-amber-200 text-amber-950" },
                { key: "Recently Expired", label: "Recently Expired", badgeBg: "bg-rose-200 text-rose-950" },
                { key: "Warnings", label: "Warnings", badgeBg: "bg-orange-200 text-orange-950" },
                { key: "Banned", label: "Banned", badgeBg: "bg-red-300 text-red-950" },
              ] as const
            ).map((tab) => {
              const count = counts[tab.key];
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all border-3 min-h-[48px] ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-700 shadow-soft"
                      : "bg-white text-slate-800 border-slate-700/60 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-xl text-xs border border-slate-700 font-extrabold ${
                      isSelected ? "bg-white text-slate-900" : tab.badgeBg
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subscription Plan Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-700" />
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-xs font-extrabold focus:outline-none min-h-[48px] shadow-xs"
            >
              <option value="All Plans">All Subscription Plans</option>
              {subscriptionPlans.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} (₱{p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Actions Bar: Bulk SMS & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-3 border-slate-700">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold min-h-[48px]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleOpenSmsModal(undefined, true)}
              disabled={filteredMembers.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-2xl shadow-soft border-3 border-slate-700 transition-all disabled:opacity-50 min-h-[48px]"
            >
              <MessageSquare className="w-4 h-4" /> 📢 Send Bulk SMS to {activeTab} ({filteredMembers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-[#E2E8F0] rounded-2xl shadow-soft border-4 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-300 border-b-4 border-slate-700 text-slate-900 uppercase text-xs font-extrabold tracking-wider">
                <th className="py-4 px-6">Member & Badges</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Plan / Expiry</th>
                <th className="py-4 px-6">Disciplinary Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-300 text-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-600 font-bold">
                    Loading members from database...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-600 font-bold space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 text-sky-700 border-2 border-slate-700 flex items-center justify-center">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-base font-extrabold text-slate-900">No members found in {activeTab}</p>
                    <p className="text-xs font-bold text-slate-600">Try switching categories, plan filter, or adjusting your search query.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-100/80 transition-colors ${
                      member.is_banned ? "bg-red-50/60" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl font-extrabold flex items-center justify-center text-xs border-2 border-slate-700 shadow-xs shrink-0 ${
                            member.is_banned ? "bg-red-300 text-red-950" : "bg-pastel-blue text-sky-950"
                          }`}
                        >
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-[160px] sm:max-w-none">{member.name}</span>
                            {member.is_banned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-red-600 text-white text-[10px] font-extrabold border border-slate-700 shadow-xs animate-pulse">
                                BANNED
                              </span>
                            )}
                            {(member.warning_count || 0) > 0 && !member.is_banned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-amber-400 text-amber-950 text-[10px] font-extrabold border border-slate-700 shadow-xs">
                                Warnings: {member.warning_count}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-600 block mt-0.5">
                            Joined: {member.join_date}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-700" />
                        {member.phone}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <div>{member.planDisplay}</div>
                      <div className="text-xs font-bold text-slate-600">Exp: {member.expiration_date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-2xl font-extrabold border-2 border-slate-700 ${
                            member.is_banned
                              ? "bg-red-200 text-red-950"
                              : member.status === "Active"
                              ? "bg-emerald-200 text-emerald-950"
                              : member.status === "Near Expiry"
                              ? "bg-amber-200 text-amber-950"
                              : "bg-rose-200 text-rose-950"
                          }`}
                        >
                          {member.status}
                        </span>
                        {member.violation_notes && (
                          <p className="text-[11px] font-bold text-slate-600 max-w-[200px] truncate" title={member.violation_notes}>
                            Note: {member.violation_notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          onClick={() => handleOpenSmsModal(member, false)}
                          className="px-3 py-2 rounded-2xl bg-sky-200 hover:bg-sky-300 text-sky-950 border-2 border-slate-700 transition font-extrabold text-xs flex items-center gap-1 min-h-[40px]"
                          title="Send SMS via Carrier SIM"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> 💬 SMS
                        </button>

                        <button
                          onClick={() => {
                            setWarningMember(member);
                            setWarningNote("");
                          }}
                          className="px-3 py-2 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 border-2 border-slate-700 transition font-extrabold text-xs flex items-center gap-1 min-h-[40px]"
                          title="Issue Warning"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ Warn
                        </button>

                        <button
                          onClick={() => {
                            setBanMemberTarget(member);
                            setBanReasonInput(member.ban_reason || "");
                          }}
                          className={`px-3 py-2 rounded-2xl border-2 border-slate-700 transition font-extrabold text-xs flex items-center gap-1 min-h-[40px] ${
                            member.is_banned
                              ? "bg-emerald-300 hover:bg-emerald-400 text-emerald-950"
                              : "bg-red-200 hover:bg-red-300 text-red-950"
                          }`}
                          title={member.is_banned ? "Lift Ban" : "Ban Member"}
                        >
                          {member.is_banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {member.is_banned ? "✅ Unban" : "🚫 Ban"}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="p-2 rounded-2xl bg-white hover:bg-sky-200 text-slate-700 border-2 border-slate-700 transition min-h-[40px] min-w-[40px] flex items-center justify-center font-bold"
                          title="Edit Member"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingMember(member)}
                          className="p-2 rounded-2xl bg-white hover:bg-rose-200 text-slate-700 border-2 border-slate-700 transition min-h-[40px] min-w-[40px] flex items-center justify-center font-bold"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* SMS Compose & Dispatch Modal */}
      {smsModalTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#E2E8F0] rounded-3xl p-5 sm:p-8 w-[95vw] sm:w-full sm:max-w-xl shadow-soft-lg border-4 border-slate-700 space-y-5 my-8">
            <div className="flex items-center justify-between border-b-3 border-slate-700 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-sky-600" />
                {smsModalTarget.isBulk ? `📢 Bulk SMS Dispatch (${activeTab})` : `💬 1-on-1 SMS Dispatch`}
              </h2>
              <button
                onClick={() => setSmsModalTarget(null)}
                className="p-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 border-2 border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Recipient(s) ({smsModalTarget.isBulk ? filteredMembers.length : 1} member)
                </label>
                <div className="p-3 bg-white rounded-2xl border-3 border-slate-700 text-xs font-bold text-slate-700 max-h-24 overflow-y-auto">
                  {smsModalTarget.isBulk
                    ? filteredMembers.map((m) => `${m.name} (${m.phone})`).join(", ")
                    : `${smsModalTarget.member?.name} (${smsModalTarget.member?.phone})`}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Message Body (Editable Template for {activeTab})
                </label>
                <textarea
                  rows={4}
                  value={customSmsMessage}
                  onChange={(e) => setCustomSmsMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold"
                />
              </div>

              <div className="p-4 bg-sky-100 rounded-2xl border-2 border-slate-700 space-y-2">
                <p className="text-xs font-extrabold text-sky-950">Carrier SIM Dispatch Instructions:</p>
                <p className="text-xs text-sky-900 font-bold">
                  Clicking launch opens your device's native SMS app pre-loaded with the recipient number(s) and text. Uses your phone carrier SIM load.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t-3 border-slate-700">
                <button
                  onClick={() => setSmsModalTarget(null)}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-3 border-slate-700 min-h-[48px]"
                >
                  Cancel
                </button>

                {smsModalTarget.isBulk ? (
                  <a
                    href={`sms:${filteredMembers.map((m) => m.phone).join(",")}?&body=${encodeURIComponent(
                      customSmsMessage
                    )}`}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-soft border-3 border-slate-700 flex items-center justify-center gap-2 min-h-[48px]"
                    onClick={() => setSmsModalTarget(null)}
                  >
                    <Send className="w-4 h-4" /> Launch Bulk SMS Link
                  </a>
                ) : (
                  <a
                    href={`sms:${smsModalTarget.member?.phone}?&body=${encodeURIComponent(customSmsMessage)}`}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-soft border-3 border-slate-700 flex items-center justify-center gap-2 min-h-[48px]"
                    onClick={() => setSmsModalTarget(null)}
                  >
                    <Send className="w-4 h-4" /> Open Native SMS App
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disciplinary Warning Modal */}
      {warningMember && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-4 border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="p-3 bg-amber-200 rounded-2xl border-2 border-slate-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Issue Warning to {warningMember.name}
              </h2>
            </div>
            <form onSubmit={handleIssueWarningSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Violation / Incident Note
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Failure to rack weights / Gym rule infraction..."
                  value={warningNote}
                  onChange={(e) => setWarningNote(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-bold focus:outline-none"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setWarningMember(null)}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-sm border-3 border-slate-700 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-soft border-3 border-slate-700 disabled:opacity-50 min-h-[48px]"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-4 border-slate-700 space-y-4">
            <div className={`flex items-center gap-3 ${banMemberTarget.is_banned ? "text-emerald-700" : "text-rose-700"}`}>
              <div className={`p-3 rounded-2xl border-2 border-slate-700 ${banMemberTarget.is_banned ? "bg-emerald-200" : "bg-rose-200"}`}>
                {banMemberTarget.is_banned ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {banMemberTarget.is_banned ? `Lift Ban for ${banMemberTarget.name}` : `Suspend / Ban ${banMemberTarget.name}`}
              </h2>
            </div>
            <form onSubmit={handleBanToggleSubmit} className="space-y-4">
              {!banMemberTarget.is_banned && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Ban Reason / Justification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Repeated policy violations / misconduct"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-bold focus:outline-none"
                  />
                </div>
              )}
              {banMemberTarget.is_banned && (
                <p className="text-xs font-bold text-slate-700">
                  This will restore gym access and lift the suspension status for <strong className="text-slate-900">{banMemberTarget.name}</strong>.
                </p>
              )}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setBanMemberTarget(null)}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-sm border-3 border-slate-700 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-2xl text-white font-extrabold text-sm shadow-soft border-3 border-slate-700 disabled:opacity-50 min-h-[48px] ${
                    banMemberTarget.is_banned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#E2E8F0] rounded-3xl p-5 sm:p-8 w-[95vw] sm:w-full sm:max-w-xl shadow-soft-lg border-4 border-slate-700 space-y-6 my-8">
            <div className="flex items-center justify-between border-b-3 border-slate-700 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-sky-600" />
                {editingMember ? "Edit Member Record" : "New Walk-in Registration & Payment"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMember(null);
                }}
                className="p-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 border-2 border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold"
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-950 bg-sky-200 px-3 py-1.5 rounded-2xl inline-block border-2 border-slate-700">
                  Step 1: Member Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
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
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
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
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold min-h-[52px]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Dynamic Subscription Plan Selection & Dates */}
              <div className="space-y-3 pt-3 border-t-3 border-slate-700">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-950 bg-sky-200 px-3 py-1.5 rounded-2xl inline-block border-2 border-slate-700">
                  Step 2: Subscription Plan & Dates
                </span>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1.5">
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
                          className={`p-3.5 rounded-2xl text-left transition-all border-3 flex flex-col justify-between ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-700 shadow-soft"
                              : "bg-white text-slate-800 border-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm">{plan.name}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-xl border ${isSelected ? "bg-white text-slate-900 border-slate-700" : "bg-sky-100 text-sky-900 border-slate-700"}`}>
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
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.join_date}
                      onChange={(e) =>
                        setFormData({ ...formData, join_date: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
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
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold min-h-[52px]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Details */}
              <div className="space-y-3 pt-3 border-t-3 border-slate-700">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-950 bg-sky-200 px-3 py-1.5 rounded-2xl inline-block border-2 border-slate-700">
                  Step 3: Payment Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Amount Paid (₱)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.amount_paid}
                      onChange={(e) =>
                        setFormData({ ...formData, amount_paid: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-extrabold min-h-[52px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value as any })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-extrabold min-h-[52px]"
                    >
                      <option value="Cash">Cash</option>
                      <option value="GCash">GCash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t-3 border-slate-700 sticky bottom-0 bg-[#E2E8F0] pb-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-sm border-3 border-slate-700 min-h-[52px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px]"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-4 border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-200 rounded-2xl border-2 border-slate-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Confirm Member Deletion
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-700">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{deletingMember.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => setDeletingMember(null)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-sm border-3 border-slate-700 min-h-[48px]"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleDeleteMember}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-soft border-3 border-slate-700 disabled:opacity-50 min-h-[48px]"
              >
                {isSubmitting ? "Deleting..." : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
