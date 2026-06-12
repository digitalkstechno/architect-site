"use client";

import { useEffect, useState } from "react";
import { UserPlus, Calendar, Clock, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { guestLoginService, GuestLogin } from "@/services/guest-login.service";

export default function GuestLogPage() {
  const [logins, setLogins] = useState<GuestLogin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogins = async () => {
    setIsLoading(true);
    try {
      const data = await guestLoginService.getGuestLogins();
      setLogins(data);
    } catch (error) {
      console.error("Failed to load guest logins", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" />
            Guest Logins
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track mobile numbers of users who accessed the public showcase.
          </p>
        </div>
        <button
          onClick={fetchLogins}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-semibold disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Mobile Number</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Login Date</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading guest logs...
                  </td>
                </tr>
              ) : logins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No guest logins recorded yet.
                  </td>
                </tr>
              ) : (
                logins.map((login) => (
                  <tr key={login._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {login.mobile}
                    </td>
                    <td className="px-6 py-4">
                      {login.ipAddress || <span className="text-slate-400 italic">Unknown</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(login.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {format(new Date(login.createdAt), "hh:mm a")}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
