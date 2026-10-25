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
  const { data } = await getDashboardMetrics();

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
      bgColor: "bg-zinc-900",
      textColor: "text-zinc-100",
      iconBg: "bg-zinc-800 text-red-500",
    },
    {
      title: "Estimated Monthly Income",
      value: `₱${monthlyRevenue.toLocaleString()}`,
      change: monthlyRevenue > 0 ? "0%" : "—",
      period: "vs last month",
      icon: DollarSign,
      bgColor: "bg-zinc-900",
      textColor: "text-zinc-100",
      iconBg: "bg-zinc-800 text-emerald-400",
    },
    {
      title: "Projected Annual Income",
      value: `₱${annualRevenue.toLocaleString()}`,
      change: annualRevenue > 0 ? "0%" : "—",
      period: "12-month projection",
      icon: TrendingUp,
      bgColor: "bg-zinc-900",
      textColor: "text-zinc-100",
      iconBg: "bg-zinc-800 text-purple-400",
    },
    {
      title: "Expiring This Week",
      value: expiringThisWeek.toString(),
      subText: expiringThisWeek > 0 ? "Needs attention" : "All Clear",
      subTextBg: expiringThisWeek > 0 ? "bg-amber-950/80 text-amber-300 border-amber-700" : "bg-emerald-950/80 text-emerald-300 border-emerald-700",
      icon: Clock,
      bgColor: "bg-zinc-900",
      textColor: "text-zinc-100",
      iconBg: "bg-zinc-800 text-amber-400",
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
              className={`p-5 sm:p-6 rounded-2xl bg-[#121214] ${metric.textColor} shadow-md shadow-black/40 border border-zinc-800 transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">
                  {metric.title}
                </span>
                <div className={`p-3 rounded-2xl shadow-xs border border-zinc-800 ${metric.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100">{metric.value}</span>
                {metric.change && (
                  <span className="inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-zinc-900 text-zinc-200 border border-zinc-800 shadow-xs">
                    {metric.change}
                  </span>
                )}
                {metric.subText && (
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-2xl border shadow-xs ${metric.subTextBg}`}>
                    {metric.subText}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-zinc-400 mt-2">
                {metric.period || "Updated real-time"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout for Activity and Retention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Members Section (2 cols) */}
        <div className="lg:col-span-2 bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md shadow-black/40 border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-100">Recently Joined Members</h2>
              <p className="text-xs font-medium text-zinc-400">Newly registered gym members (Name, Phone, Expiration Date)</p>
            </div>
            <Link
              href="/members"
              className="text-xs font-extrabold text-red-400 hover:text-red-300 flex items-center gap-1 bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-700 self-start sm:self-auto shadow-xs"
            >
              View Directory <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 font-medium space-y-3 bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 p-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 text-red-500 border-2 border-zinc-700 flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-base font-extrabold text-zinc-100">No recent members found</p>
              <p className="text-xs text-zinc-400">Get started by registering your first member.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentMembers.map((member) => (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-100 font-extrabold flex items-center justify-center text-sm border-2 border-zinc-700 shadow-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-zinc-100">{member.name}</p>
                      <p className="text-xs font-medium text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-500" /> {member.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                    <span className="inline-flex items-center text-xs font-extrabold px-3 py-1 rounded-2xl bg-zinc-950 text-zinc-300 border border-zinc-700">
                      <Calendar className="w-3 h-3 mr-1 text-zinc-500" /> Exp: {member.expiration_date}
                    </span>
                    <p className="text-xs font-medium text-zinc-400">Joined: {member.join_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Retention Spotlight Card */}
        <div className="bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md shadow-black/40 border border-zinc-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-950/80 text-amber-300 text-xs font-extrabold border border-amber-700">
                <BellRing className="w-3.5 h-3.5" /> Needs Reminder This Week
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-zinc-800 text-zinc-200 border border-zinc-700">{expiringThisWeek} Members</span>
            </div>

            <h2 className="text-xl font-extrabold text-zinc-100">Expiring Soon (Within 7 Days)</h2>
            <p className="text-xs font-medium text-zinc-400 mt-1">
              Follow up with members who are expiring soon or already expired.
            </p>

            <div className="mt-5 space-y-3">
              {expiringThisWeek > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="font-extrabold text-sm text-amber-200">Expiring Soon</p>
                    <p className="text-xs font-medium text-amber-300 mt-0.5">{expiringThisWeek} member(s) require renewal follow-up</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-amber-900 text-amber-200 border border-amber-600">
                    Action
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-center shadow-xs">
                  <p className="text-xs font-extrabold text-emerald-300">Good Standing! All subscriptions are up to date 🎉</p>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/members"
            className="w-full mt-4 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-center text-sm rounded-2xl shadow-soft border-2 border-red-500/50 flex items-center justify-center gap-2 transition-all min-h-[52px]"
          >
            View Expiring Members <ArrowUpRight className="w-4 h-4" />
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
          <div key={i} className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-[#121214] p-8 rounded-2xl border border-zinc-800 h-64" />
        <div className="bg-[#121214] p-8 rounded-2xl border border-zinc-800 h-64" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { data: gymSettings } = await getGymSettings();
  const gymName = gymSettings?.name || "PowerFit Studio";

  return (
    <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md shadow-black/40 border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border-2 border-zinc-700">
            <Activity className="w-3.5 h-3.5 text-red-500" /> Dashboard Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">
            Welcome back, Gym Manager! 👋
          </h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">
            Here is what is happening at {gymName} today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/members"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-soft border-2 border-red-500/50 transition-all min-h-[52px]"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </Link>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetricsSection />
      </Suspense>
    </div>
  );
}
