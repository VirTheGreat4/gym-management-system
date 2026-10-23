"use client";

import React, { useState, useEffect } from "react";
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
import { SubscriptionPlan } from "@/types/database";
import { BackButton } from "@/components/BackButton";

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-1",
    name: "1 Month Regular",
    duration_days: 30,
    price: 1500,
    category: "Standard",
    description: "Standard monthly gym membership access with full equipment use.",
  },
  {
    id: "plan-2",
    name: "Student Monthly",
    duration_days: 30,
    price: 1200,
    category: "Student",
    description: "Discounted monthly access for valid students with ID.",
  },
  {
    id: "plan-3",
    name: "1 Year VIP Access",
    duration_days: 365,
    price: 14000,
    category: "VIP",
    description: "All-inclusive annual VIP access with locker and towel privileges.",
  },
  {
    id: "plan-4",
    name: "Day Pass Walk-in",
    duration_days: 1,
    price: 150,
    category: "Daily",
    description: "Single day walk-in gym pass for casual visitors.",
  },
];

export function getStoredPlans(): SubscriptionPlan[] {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIPTION_PLANS;
  try {
    const saved = localStorage.getItem("gym_subscription_plans");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load plans from localStorage", e);
  }
  return DEFAULT_SUBSCRIPTION_PLANS;
}

export function saveStoredPlans(plans: SubscriptionPlan[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("gym_subscription_plans", JSON.stringify(plans));
  } catch (e) {
    console.error("Failed to save plans to localStorage", e);
  }
}

export default function SubscriptionsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_SUBSCRIPTION_PLANS);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    duration_days: 30,
    price: 1500,
    category: "Standard" as SubscriptionPlan["category"],
    description: "",
  });

  useEffect(() => {
    const loaded = getStoredPlans();
    setPlans(loaded);
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

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0 || formData.duration_days <= 0) {
      setFeedback({ type: "error", message: "Please provide valid plan details." });
      return;
    }

    try {
      if (editingPlan) {
        const updated = plans.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: formData.name,
                duration_days: Number(formData.duration_days),
                price: Number(formData.price),
                category: formData.category,
                description: formData.description,
              }
            : p
        );
        setPlans(updated);
        saveStoredPlans(updated);
        setFeedback({ type: "success", message: `Plan "${formData.name}" updated successfully!` });
        setEditingPlan(null);
      } else {
        const newPlan: SubscriptionPlan = {
          id: `plan-${Date.now()}`,
          name: formData.name,
          duration_days: Number(formData.duration_days),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description,
        };
        const updated = [...plans, newPlan];
        setPlans(updated);
        saveStoredPlans(updated);
        setFeedback({ type: "success", message: `Plan "${formData.name}" created successfully!` });
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Operation failed" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingPlan) return;
    try {
      const updated = plans.filter((p) => p.id !== deletingPlan.id);
      setPlans(updated);
      saveStoredPlans(updated);
      setFeedback({ type: "success", message: `Plan "${deletingPlan.name}" deleted successfully!` });
      setDeletingPlan(null);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to delete plan" });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getCategoryBadgeStyle = (cat: SubscriptionPlan["category"]) => {
    switch (cat) {
      case "VIP":
        return "bg-purple-200 text-purple-950 border-slate-700";
      case "Student":
        return "bg-sky-200 text-sky-950 border-slate-700";
      case "Daily":
        return "bg-amber-200 text-amber-950 border-slate-700";
      case "Standard":
        return "bg-emerald-200 text-emerald-950 border-slate-700";
      default:
        return "bg-slate-200 text-slate-800 border-slate-700";
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-[#E2E8F0] p-8 rounded-2xl border-4 border-slate-700 font-comic font-bold text-center">
          Loading subscription plans...
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
            <CreditCard className="w-3.5 h-3.5" /> Membership Packages & Pricing
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Subscription Plans Management
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            Configure dynamic gym plans, pricing tiers, durations, and category discount tags.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 transition-all min-h-[56px]"
        >
          <Plus className="w-5 h-5" /> Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#E2E8F0] p-6 rounded-2xl shadow-soft border-4 border-slate-700 flex flex-col justify-between space-y-6 transition-transform hover:-translate-y-1"
            style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif" }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border-2 ${getCategoryBadgeStyle(plan.category)}`}>
                  {plan.category}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white text-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{plan.name}</h3>
                <p className="text-xs text-slate-600 font-bold mt-1 min-h-[32px]">
                  {plan.description || "Custom subscription plan for gym members."}
                </p>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border-2 border-slate-700 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600" /> Duration:
                  </span>
                  <span className="font-extrabold text-slate-900">{plan.duration_days} Days</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-emerald-900 pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1 text-xs text-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Price:
                  </span>
                  <span className="text-base text-emerald-800">₱{plan.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t-2 border-slate-300">
              <button
                onClick={() => handleOpenEditModal(plan)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-sky-200 text-slate-800 font-extrabold text-xs border-2 border-slate-700 flex items-center justify-center gap-1 transition shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setDeletingPlan(plan)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-200 text-slate-800 font-extrabold text-xs border-2 border-slate-700 flex items-center justify-center gap-1 transition shadow-xs"
                title="Delete Plan"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Plan Modal */}
      {(isAddModalOpen || editingPlan) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#E2E8F0] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg border-4 border-slate-700 space-y-6 my-8">
            <div className="flex items-center justify-between border-b-3 border-slate-700 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-sky-600" />
                {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPlan(null);
                }}
                className="p-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 border-2 border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6 Months Unlimited"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-bold focus:outline-none min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Duration in Days
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-bold focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Price in ₱
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-extrabold focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Category / Discount Tag
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-extrabold focus:outline-none min-h-[48px]"
                >
                  <option value="Standard">Standard</option>
                  <option value="Student">Student</option>
                  <option value="VIP">VIP</option>
                  <option value="Daily">Daily</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional description of plan benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t-3 border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPlan(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-3 border-slate-700 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-2xl shadow-soft border-3 border-slate-700 min-h-[48px]"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-soft-lg border-4 border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-3 bg-rose-200 rounded-2xl border-2 border-slate-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Confirm Plan Deletion
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-700">
              Are you sure you want to delete the subscription plan <strong className="text-slate-900">{deletingPlan.name}</strong>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPlan(null)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-3 border-slate-700 min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-soft border-3 border-slate-700 min-h-[48px]"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
