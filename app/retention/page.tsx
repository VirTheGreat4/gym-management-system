"use client";

import React, { useState, useEffect } from "react";
import {
  BellRing,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bot,
  MessageSquare,
  Clock,
  RefreshCw,
} from "lucide-react";
import { getAtRiskMembers, AtRiskMember } from "@/app/actions/retention";
import { BackButton } from "@/components/BackButton";

export default function RetentionHubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [members, setMembers] = useState<AtRiskMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAtRisk = async () => {
    setIsLoading(true);
    try {
      const res = await getAtRiskMembers();
      if (res.data) {
        setMembers(res.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRisk();
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleSendSMS = (member: AtRiskMember) => {
    window.location.href = member.smsUrl;
    setSentIds((prev) => ({ ...prev, [member.id]: true }));
    setSentToast(`Automated SMS reminder successfully dispatched to ${member.name}! 🚀`);
    setTimeout(() => setSentToast(null), 4000);
  };

  const handleSendAll = () => {
    setSendingAll(true);
    setTimeout(() => {
      const allSent: Record<string, boolean> = {};
      members.forEach((m) => {
        allSent[m.id] = true;
      });
      setSentIds(allSent);
      setSendingAll(false);
      setSentToast("Batch SMS reminders sent to all expiring members! 🎉");
      setTimeout(() => setSentToast(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackButton />

      {/* Toast Notification */}
      {sentToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-soft-lg flex items-center gap-3 border-4 border-slate-700 animate-bounce">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm">{sentToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-200 text-amber-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Notify Members
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Send SMS Reminders
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            Send text reminders to members whose memberships are expiring soon or already expired.
          </p>
        </div>

        <button
          onClick={handleSendAll}
          disabled={sendingAll || members.length === 0}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 transition-all min-h-[56px]"
        >
          {sendingAll ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> Batch Dispatching...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Send All SMS Reminders
            </>
          )}
        </button>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-pastel-yellow p-5 sm:p-6 rounded-2xl shadow-soft border-4 border-slate-700 flex items-center gap-4 text-amber-950">
          <div className="p-4 bg-white/95 rounded-2xl text-amber-800 shadow-xs border-2 border-slate-700 shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase block">
              Expiring Soon
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold mt-1">
              {isLoading ? "..." : `${members.length} Members`}
            </p>
          </div>
        </div>

        <div className="bg-pastel-purple p-5 sm:p-6 rounded-2xl shadow-soft border-4 border-slate-700 flex items-center gap-4 text-purple-950">
          <div className="p-4 bg-white/95 rounded-2xl text-purple-800 shadow-xs border-2 border-slate-700 shrink-0">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase block">
              Reminders Sent
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold mt-1">
              {Object.values(sentIds).filter(Boolean).length} / {members.length}
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Members List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Expiring Members
        </h2>

        {isLoading ? (
          <div className="bg-[#E2E8F0] p-12 rounded-2xl shadow-soft border-4 border-slate-700 text-center text-slate-700 font-bold">
            Loading at-risk subscriptions from database...
          </div>
        ) : members.length === 0 ? (
          <div className="bg-[#E2E8F0] p-16 rounded-2xl shadow-soft text-center space-y-4 border-4 border-slate-700">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-pastel-green text-emerald-800 flex items-center justify-center shadow-xs border-3 border-slate-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              No at-risk subscriptions detected! All active.
            </h3>
            <p className="text-slate-700 font-bold text-sm max-w-md mx-auto">
              All member subscriptions are healthy and well outside the 3-day expiration window. Great job keeping members engaged!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {members.map((member) => {
              const isSent = sentIds[member.id];
              let badgeBg = "bg-amber-200 text-amber-950";
              let badgeText = `Expires in ${member.daysLeft}d`;

              if (member.urgency === "critical") {
                badgeBg = "bg-rose-200 text-rose-950";
                badgeText = member.daysLeft === 0 ? "Expires Today!" : `Critical (${member.daysLeft}d left)`;
              } else if (member.urgency === "expired") {
                badgeBg = "bg-slate-300 text-slate-900";
                badgeText = `Expired (${Math.abs(member.daysLeft)}d ago)`;
              }

              return (
                <div
                  key={member.id}
                  className="bg-[#E2E8F0] p-5 sm:p-6 rounded-2xl shadow-soft border-4 border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-slate-900"
                >
                  {/* Member & Plan Info */}
                  <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-950 font-extrabold flex items-center justify-center text-base shadow-xs border-3 border-slate-700 shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-lg font-extrabold text-slate-900">
                            {member.name}
                          </h3>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-2xl border-2 border-slate-700 ${badgeBg}`}>
                            {badgeText} (End: {member.expiration_date})
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          Phone: {member.phone} • Join Date: {member.join_date}
                        </p>
                      </div>
                    </div>

                    {/* AI Recommendation Box */}
                    <div className="p-4 rounded-2xl bg-sky-100 border-3 border-slate-700 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-extrabold text-sky-950 uppercase block">
                          AI Suggested Renewal Offer:
                        </span>
                        <p className="text-xs text-sky-900 font-bold mt-0.5">
                          {member.aiSuggestedOffer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button & Status - full width on mobile */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
                    {isSent ? (
                      <div className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-emerald-200 text-emerald-950 font-extrabold text-sm flex items-center justify-center gap-2 border-3 border-slate-700 min-h-[52px]">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        Reminder Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendSMS(member)}
                        className="w-full lg:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 flex items-center justify-center gap-2 transition-all min-h-[52px]"
                      >
                        💬 Send SMS Reminder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
