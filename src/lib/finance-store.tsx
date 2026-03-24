
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import { API_BASE_URL } from "./api-config";

export type TransactionType = "CREDIT" | "DEBIT";

export interface LedgerEntry {
  _id: string;
  projectId: string;
  clientId: string;
  bankId?: string;
  transactionType: TransactionType;
  amount: number;
  description?: string;
  createdAt: string;
}

export interface BankBrief {
  _id: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  isActive: boolean;
}

interface FinanceContextType {
  ledger: LedgerEntry[];
  bankBriefs: BankBrief[];
  isLoading: boolean;
  addBank: (data: Omit<BankBrief, "_id" | "isActive" | "currentBalance"> & { openingBalance: number }) => Promise<void>;
  addTransaction: (data: Omit<LedgerEntry, "_id" | "createdAt"> & { source?: string }) => Promise<void>;
  fetchFinanceData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [bankBriefs, setBankBriefs] = useState<BankBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinanceData = useCallback(async () => {
    try {
      const t = localStorage.getItem("auth_token");
      if (!t) {
        setLedger([]);
        setBankBriefs([]);
        return;
      }

      const [ledgerRes, banksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/paymentledger`, {
          headers: { Authorization: `Bearer ${t}` }
        }),
        fetch(`${API_BASE_URL}/bankbrief`, {
          headers: { Authorization: `Bearer ${t}` }
        })
      ]);

      const ledgerData = await ledgerRes.json();
      const banksData = await banksRes.json();

      setLedger(ledgerData.PaymentLedgers || ledgerData.data || []);
      // backend returns direct array
      setBankBriefs(Array.isArray(banksData) ? banksData : (banksData.bankBriefs || banksData.data || []));
    } catch (err) {
      console.error("Fetch finance error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) fetchFinanceData();
  }, [user, fetchFinanceData]);

  const addBank = async (data: Omit<BankBrief, "_id" | "isActive" | "currentBalance"> & { openingBalance: number }) => {
    if (!token) throw new Error("Authentication required");
    try {
      const res = await fetch(`${API_BASE_URL}/bankbrief`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          currentBalance: data.openingBalance
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add bank account");
      }
      await fetchFinanceData(); // Refresh the list
    } catch (err) {
      console.error("Add bank error:", err);
      throw err;
    }
  };

  const addTransaction = async (data: Omit<LedgerEntry, "_id" | "createdAt"> & { source?: string }) => {
    try {
      if (!token) return;

      // 1. Add entry to ledger
      const res = await fetch(`${API_BASE_URL}/paymentledger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: data.clientId,
          projectId: data.projectId,
          transactionType: data.transactionType,
          amount: data.amount,
          description: data.description || data.source,
        })
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      // 3. Update Project Financials (SOP Step 6 & 16)
      if (data.projectId) {
        try {
          const resProj = await fetch(`${API_BASE_URL}/project/${data.projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resProj.ok) {
            const projData = await resProj.json();
            const p = projData;

            if (p && p._id) {
              const updateBody: any = {};
              if (data.transactionType === "CREDIT") {
                updateBody.totalReceived = (p.totalReceived || 0) + data.amount;
              } else {
                updateBody.totalExpense = (p.totalExpense || 0) + data.amount;
              }
              updateBody.balance = (updateBody.totalReceived ?? (p.totalReceived || 0)) - (updateBody.totalExpense ?? (p.totalExpense || 0));

              await fetch(`${API_BASE_URL}/project/${data.projectId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateBody)
              });
            }
          }
        } catch (projErr) {
          console.error("Error updating project financials:", projErr);
        }
      }
      
      await fetchFinanceData();
    } catch (err) {
      console.error("Add transaction error:", err);
      throw err;
    }
  };

  return (
    <FinanceContext.Provider value={{ ledger, bankBriefs, isLoading, addBank, addTransaction, fetchFinanceData }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
