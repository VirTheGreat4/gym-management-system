"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Tag,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { SubscriptionPlan, CustomBadge } from "@/types/database";
import { BackButton } from "@/components/BackButton";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/app/actions/subscriptions";
import {
  getCustomBadges,
  createCustomBadge,
  updateCustomBadge,
  deleteCustomBadge,
} from "@/app/actions/badges";

export function getBadgeColorStyle(color: CustomBadge["color"]) {
  switch (color) {
    case "green":
      return "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
    case "blue":
      return "bg-sky-950/80 text-sky-300 border-sky-700/60";
    case "yellow":
      return "bg-amber-950/80 text-amber-300 border-amber-700/60";
    case "purple":
      return "bg-purple-950/80 text-purple-300 border-purple-700/60";
    case "rose":
      return "bg-rose-950/80 text-rose-300 border-rose-700/60";
    case "slate":
    default:
      return "bg-zinc-800 text-zinc-300 border-zinc-600";
  }
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [badges, setBadgeList] = useState<CustomBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  // Badge Modals state
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<CustomBadge | null>(null);
  const [deletingBadge, setDeletingBadge] = useState<CustomBadge | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    duration_days: 30,
    price: 1500,
    category: "Standard" as SubscriptionPlan["category"],
    description: "",
  });

  // Badge Form data
  const [badgeFormData, setBadgeFormData] = useState({
    name: "",
    color: "blue" as CustomBadge["color"],
    discount_percent: 0,
    description: "",
  });

  const loadData = async () => {
    try {
      const [plansRes, badgesRes] = await Promise.all([
        getSubscriptionPlans(),
        getCustomBadges(),
      ]);
      if (plansRes.data) setPlans(plansRes.data);
      if (badgesRes.data) setBadgeList(badgesRes.data);
    } catch (e) {
      console.error("Failed to load subscription & badge data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();

    // Listen to real-time universal update event
    const handleRealtimeUpdate = () => {
      loadData();
    };

    window.addEventListener("supabase-realtime-update", handleRealtimeUpdate);
    return () => {
      window.removeEventListener("supabase-realtime-update", handleRealtimeUpdate);
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      duration_days: 30,
      price: 1500,
      category: "Standard",
      description: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      category: plan.category,
      description: plan.description || "",
    });
  };

  const handleOpenAddBadgeModal = () => {
    setBadgeFormData({
      name: "",
      color: "blue",
      discount_percent: 0,
      description: "",
    });
    setIsBadgeModalOpen(true);
  };

  const handleOpenEditBadgeModal = (badge: CustomBadge) => {
    setEditingBadge(badge);
    setBadgeFormData({
      name: badge.name,
      color: badge.color,
      discount_percent: badge.discount_percent ?? 0,
      description: badge.description || "",
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0 || formData.duration_days <= 0) {
      setFeedback({ type: "error", message: "Please provide valid plan details." });
      return;
    }

    try {
      if (editingPlan) {
        const res = await updateSubscriptionPlan(editingPlan.id, {
          name: formData.name,
          duration_days: Number(formData.duration_days),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description,
        });
        if (!res.success) throw new Error(res.error || "Failed to update plan");
        setFeedback({ type: "success", message: `Plan "${formData.name}" updated successfully!` });
        setEditingPlan(null);
      } else {
        const res = await createSubscriptionPlan({
          name: formData.name,
          duration_days: Number(formData.duration_days),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description,
        });
        if (!res.success) throw new Error(res.error || "Failed to create plan");
        setFeedback({ type: "success", message: `Plan "${formData.name}" created successfully!` });
        setIsAddModalOpen(false);
      }
      loadData();
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Operation failed" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    try {
      const res = await deleteSubscriptionPlan(deletingPlan.id);
      if (!res.success) throw new Error(res.error || "Failed to delete plan");
      setFeedback({ type: "success", message: `Plan "${deletingPlan.name}" deleted successfully!` });
      setDeletingPlan(null);
      loadData();
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to delete plan" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeFormData.name) {
      setFeedback({ type: "error", message: "Please provide a badge name." });
      return;
    }

    try {
      if (editingBadge) {
        const res = await updateCustomBadge(editingBadge.id, {
          name: badgeFormData.name,
          color: badgeFormData.color,
          discount_percent: Number(badgeFormData.discount_percent),
          description: badgeFormData.description,
        });
        if (!res.success) throw new Error(res.error || "Failed to update badge");
        setFeedback({ type: "success", message: `Badge "${badgeFormData.name}" updated successfully!` });
        setEditingBadge(null);
      } else {
        const res = await createCustomBadge({
          name: badgeFormData.name,
          color: badgeFormData.color,
          discount_percent: Number(badgeFormData.discount_percent),
          description: badgeFormData.description,
        });
        if (!res.success) throw new Error(res.error || "Failed to create badge");
        setFeedback({ type: "success", message: `Badge "${badgeFormData.name}" created successfully!` });
        setIsBadgeModalOpen(false);
      }
      loadData();
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Badge operation failed" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteBadgeConfirm = async () => {
    if (!deletingBadge) return;
    try {
      const res = await deleteCustomBadge(deletingBadge.id);
      if (!res.success) throw new Error(res.error || "Failed to delete badge");
      setFeedback({ type: "success", message: `Badge "${deletingBadge.name}" deleted successfully!` });
      setDeletingBadge(null);
      loadData();
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to delete badge" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getCategoryBadgeStyle = (cat: SubscriptionPlan["category"]) => {
    switch (cat) {
      case "VIP":
        return "bg-purple-950/80 text-purple-300 border-purple-700/60";
      case "Student":
        return "bg-sky-950/80 text-sky-300 border-sky-700/60";
      case "Daily":
        return "bg-amber-950/80 text-amber-300 border-amber-700/60";
      case "Standard":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700/60";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-600";
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-zinc-900 p-8 rounded-2xl border-3 border-zinc-700 text-zinc-300 font-bold text-center">
          Loading subscription plans and database badges...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
      <BackButton />

      {/* Feedback Toast */}
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
            <CreditCard className="w-3.5 h-3.5 text-red-500" /> Membership Packages & Pricing
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">
            Subscription Plans Management
          </h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">
            Configure live database gym plans, pricing tiers, durations, and category discount tags.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-soft border-2 border-red-500/50 transition-all min-h-[56px] cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div id="tutorial-plans-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-zinc-900 p-6 rounded-2xl shadow-soft border-3 border-zinc-700 flex flex-col justify-between space-y-6 transition-transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getCategoryBadgeStyle(plan.category)}`}>
                  {plan.category}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-200 border-2 border-zinc-700 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-red-500" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-100 leading-tight">{plan.name}</h3>
                <p className="text-xs text-zinc-400 font-medium mt-1 min-h-[32px]">
                  {plan.description || "Custom subscription plan for gym members."}
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border-2 border-zinc-800 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" /> Duration:
                  </span>
                  <span className="font-extrabold text-zinc-200">{plan.duration_days} Days</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-emerald-400 pt-1 border-t border-zinc-800">
                  <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Price:
                  </span>
                  <span className="text-base text-emerald-400">₱{plan.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => handleOpenEditModal(plan)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setDeletingPlan(plan)}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-red-950/80 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                title="Delete Plan"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Database Badges Management Section */}
      <div className="space-y-6 pt-6 border-t-3 border-zinc-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-5 sm:p-8 rounded-2xl shadow-soft border-3 border-zinc-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border-2 border-zinc-700">
              <Tag className="w-3.5 h-3.5 text-red-500" /> Live Database Client Classification
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-100">
              Custom Database Badges Management
            </h2>
            <p className="text-zinc-400 font-medium text-sm mt-1">
              Configure live database member badges with automatic discount percentages for check-in registrations.
            </p>
          </div>

          <button
            onClick={handleOpenAddBadgeModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-soft border-2 border-red-500/50 transition-all min-h-[56px] cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add Custom Badge
          </button>
        </div>

        {/* Badges Grid */}
        <div id="tutorial-badges-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-zinc-900 p-6 rounded-2xl shadow-soft border-3 border-zinc-700 flex flex-col justify-between space-y-6 transition-transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${getBadgeColorStyle(badge.color)} shadow-xs`}>
                    {badge.name}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-200 border-2 border-zinc-700 flex items-center justify-center shadow-xs font-extrabold text-xs">
                    {badge.discount_percent ?? 0}%
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-zinc-100 leading-tight">{badge.name}</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1 min-h-[32px]">
                    {badge.description || "Custom database client status badge."}
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border-2 border-zinc-800 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-red-500" /> Plan Discount:
                    </span>
                    <span className="font-extrabold text-emerald-400">{badge.discount_percent ?? 0}% OFF</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleOpenEditBadgeModal(badge)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeletingBadge(badge)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-red-950/80 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                  title="Delete Badge"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      {(isAddModalOpen || editingPlan) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg border-3 border-zinc-700 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-red-500" />
                {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPlan(null);
                }}
                className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-2 border-zinc-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6 Months Unlimited"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                    Duration in Days
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                    Price in ₱
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Category / Discount Tag
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none min-h-[48px]"
                >
                  <option value="Standard">Standard</option>
                  <option value="Student">Student</option>
                  <option value="VIP">VIP</option>
                  <option value="Daily">Daily</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional description of plan benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPlan(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 min-h-[48px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-soft border-2 border-red-500/50 min-h-[48px] cursor-pointer"
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-3 border-zinc-700 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/80 rounded-2xl border-2 border-red-700/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-zinc-100">
                Confirm Plan Deletion
              </h2>
            </div>
            <p className="text-sm font-medium text-zinc-400">
              Are you sure you want to delete the subscription plan <strong className="text-zinc-100">{deletingPlan.name}</strong>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPlan(null)}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 min-h-[48px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-soft border-2 border-red-500/50 min-h-[48px] cursor-pointer"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Custom Badge Modal */}
      {(isBadgeModalOpen || editingBadge) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg border-3 border-zinc-700 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-red-500" />
                {editingBadge ? "Edit Custom Client Badge" : "Create New Custom Badge"}
              </h2>
              <button
                onClick={() => {
                  setIsBadgeModalOpen(false);
                  setEditingBadge(null);
                }}
                className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-2 border-zinc-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Badge Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Citizen, VIP, Student"
                  value={badgeFormData.name}
                  onChange={(e) => setBadgeFormData({ ...badgeFormData, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                    Badge Color Tone
                  </label>
                  <select
                    value={badgeFormData.color}
                    onChange={(e) => setBadgeFormData({ ...badgeFormData, color: e.target.value as any })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none min-h-[48px]"
                  >
                    <option value="blue">Blue Pastel</option>
                    <option value="green">Green Pastel</option>
                    <option value="yellow">Yellow Pastel</option>
                    <option value="purple">Purple Pastel</option>
                    <option value="rose">Rose Pastel</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                    Discount Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={badgeFormData.discount_percent}
                    onChange={(e) => setBadgeFormData({ ...badgeFormData, discount_percent: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase mb-1">
                  Description / Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional description of badge privileges..."
                  value={badgeFormData.description}
                  onChange={(e) => setBadgeFormData({ ...badgeFormData, description: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsBadgeModalOpen(false);
                    setEditingBadge(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 min-h-[48px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-soft border-2 border-red-500/50 min-h-[48px] cursor-pointer"
                >
                  {editingBadge ? "Save Changes" : "Create Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Badge Confirmation Modal */}
      {deletingBadge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-3 border-zinc-700 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/80 rounded-2xl border-2 border-red-700/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-zinc-100">
                Confirm Badge Deletion
              </h2>
            </div>
            <p className="text-sm font-medium text-zinc-400">
              Are you sure you want to delete the custom badge <strong className="text-zinc-100">{deletingBadge.name}</strong>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingBadge(null)}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs border-2 border-zinc-700 min-h-[48px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBadgeConfirm}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-soft border-2 border-red-500/50 min-h-[48px] cursor-pointer"
              >
                Delete Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
