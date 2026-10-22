import React, { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  UserPlus,
  BellRing,
  TrendingUp,
  Activity,
  ChevronRight,
  Phone,
  Calendar,
} from "lucide-react";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import { getGymSettings } from "@/app/actions/settings";

export const instant = false;

async function DashboardMetricsSection() {
  const { data, error } = await getDashboardMetrics();

  const totalActive = data ? data.totalActiveMembers : 0;
  const monthlyRevenue = data ? data.monthlyRevenueEstimate : 0;
  const annualRevenue = monthlyRevenue * 12;
  const expiringThisWeek = data ? data.expiringThisWeek : 0;

  const metrics = [
    {
      title: "Active Members",
      value: totalActive.toString(),
      change: totalActive > 0 ? "0%" : "—",
      period: "vs last month",
      icon: Users,
      bgColor: "bg-pastel-blue",
      textColor: "text-sky-950",
      iconBg: "bg-white/95 text-sky-700",
    },
    {
      title: "Estimated Monthly Income",
      value: `₱${monthlyRevenue.toLocaleString()}`,
      change: monthlyRevenue > 0 ? "0%" : "—",
      period: "vs last month",
      icon: DollarSign,
      bgColor: "bg-pastel-green",
      textColor: "text-emerald-950",
      iconBg: "bg-white/95 text-emerald-700",
    },
    {
      title: "Projected Annual Income",
      value: `₱${annualRevenue.toLocaleString()}`,
      change: annualRevenue > 0 ? "0%" : "—",
      period: "12-month projection",
      icon: TrendingUp,
      bgColor: "bg-pastel-purple",
      textColor: "text-purple-950",
      iconBg: "bg-white/95 text-purple-700",
    },
    {
      title: "Expiring This Week",
      value: expiringThisWeek.toString(),
      subText: expiringThisWeek > 0 ? "Needs attention" : "All Clear",
      subTextBg: expiringThisWeek > 0 ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950",
      icon: Clock,
      bgColor: "bg-pastel-yellow",
      textColor: "text-amber-950",
      iconBg: "bg-white/95 text-amber-700",
      alert: expiringThisWeek > 0,
    },
  ];

  const recentMembers = data?.recentMembers || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className={`p-5 sm:p-6 rounded-2xl ${metric.bgColor} ${metric.textColor} shadow-soft border-4 border-slate-700 transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wide opacity-90">
                  {metric.title}
                </span>
                <div className={`p-3 rounded-2xl shadow-xs border-2 border-slate-700 ${metric.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold">{metric.value}</span>
                {metric.change && (
                  <span className="inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-white text-slate-900 border-2 border-slate-700 shadow-xs">
                    {metric.change}
                  </span>
                )}
                {metric.subText && (
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-2xl border-2 border-slate-700 shadow-xs ${metric.subTextBg}`}>
                    {metric.subText}
                  </span>
                )}
              </div>

              <p className="text-xs font-bold opacity-80 mt-2">
                {metric.period || "Updated real-time"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout for Activity and Retention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Members Section (2 cols) */}
        <div className="lg:col-span-2 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recently Joined Members</h2>
              <p className="text-xs font-bold text-slate-600">Newly registered gym members (Name, Phone, Expiration Date)</p>
            </div>
            <Link
              href="/members"
              className="text-xs font-extrabold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border-2 border-slate-700 self-start sm:self-auto shadow-xs"
            >
              View Directory <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-600 font-bold space-y-3 bg-slate-100 rounded-2xl border-3 border-dashed border-slate-400 p-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 text-sky-700 border-2 border-slate-700 flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-base font-extrabold text-slate-900">No recent members found</p>
              <p className="text-xs text-slate-600">Get started by registering your first member.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-300">
              {recentMembers.map((member) => (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pastel-blue text-sky-950 font-extrabold flex items-center justify-center text-sm border-2 border-slate-700 shadow-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{member.name}</p>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-700" /> {member.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                    <span className="inline-flex items-center text-xs font-extrabold px-3 py-1 rounded-2xl bg-slate-100 text-slate-800 border-2 border-slate-700">
                      <Calendar className="w-3 h-3 mr-1 text-slate-600" /> Exp: {member.expiration_date}
                    </span>
                    <p className="text-xs font-bold text-slate-600">Joined: {member.join_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Retention Spotlight Card */}
        <div className="bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-200 text-amber-950 text-xs font-extrabold border-2 border-slate-700">
                <BellRing className="w-3.5 h-3.5" /> Needs Reminder This Week
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-white text-slate-800 border-2 border-slate-700">{expiringThisWeek} Members</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">Expiring Soon (Within 7 Days)</h2>
            <p className="text-xs font-bold text-slate-600 mt-1">
              Send SMS reminders to members who are expiring soon or already expired.
            </p>

            <div className="mt-5 space-y-3">
              {expiringThisWeek > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-100/90 border-3 border-slate-700 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="font-extrabold text-sm text-amber-950">Expiring Soon</p>
                    <p className="text-xs font-bold text-amber-800 mt-0.5">{expiringThisWeek} member(s) require renewal follow-up</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-amber-300 text-amber-950 border-2 border-slate-700">
                    Action
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-100/90 border-3 border-slate-700 text-center shadow-xs">
                  <p className="text-xs font-extrabold text-emerald-900">Good Standing! All subscriptions are up to date 🎉</p>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/retention"
            className="w-full mt-4 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-center text-sm rounded-2xl shadow-soft border-3 border-slate-700 flex items-center justify-center gap-2 transition-all min-h-[52px]"
          >
            Notify Members <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-200 border-4 border-slate-700 h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-slate-200 p-8 rounded-2xl border-4 border-slate-700 h-64" />
        <div className="bg-slate-200 p-8 rounded-2xl border-4 border-slate-700 h-64" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { data: gymSettings } = await getGymSettings();
  const gymName = gymSettings?.name || "PowerFit Studio";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-200 text-sky-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
            <Activity className="w-3.5 h-3.5" /> Dashboard Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Welcome back, Gym Manager! 👋
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            Here is what is happening at {gymName} today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/members"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-soft border-3 border-slate-700 transition-all min-h-[52px]"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </Link>
          <Link
            href="/retention"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-sm shadow-soft border-3 border-slate-700 transition-all min-h-[52px]"
          >
            <BellRing className="w-4 h-4" /> Notify Members
          </Link>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetricsSection />
      </Suspense>
    </div>
  );
}
