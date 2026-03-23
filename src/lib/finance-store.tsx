
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TransactionType = "CREDIT" | "DEBIT";

export interface LedgerEntry {
  _id: string;
  projectId: string;
  clientId: string;
  bankId: string;
  transactionType: TransactionType;
  amount: number;
  source: string;
  description?: string;
  date: string;
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
  addTransaction: (data: Omit<LedgerEntry, "_id" | "date">) => Promise<void>;
  fetchFinanceData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [bankBriefs, setBankBriefs] = useState<BankBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const [ledgerRes, banksRes] = await Promise.all([
        fetch("http://localhost:9000/architecture/payment-ledger", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:9000/architecture/bank-brief", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const ledgerData = await ledgerRes.json();
      const banksData = await banksRes.json();

      setLedger(ledgerData.data || ledgerData || []);
      setBankBriefs(banksData.data || banksData || []);
    } catch (err) {
      console.error("Fetch finance error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const addTransaction = async (data: Omit<LedgerEntry, "_id" | "date">) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // 1. Add entry to ledger
      const res = await fetch("http://localhost:9000/architecture/payment-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      // 2. Sync Bank Balance (Single Source of Truth logic)
      if (data.bankId) {
        const bank = bankBriefs.find(b => b._id === data.bankId);
        if (bank) {
          const newBalance = data.transactionType === "CREDIT" 
            ? bank.currentBalance + data.amount 
            : bank.currentBalance - data.amount;

          await fetch(`http://localhost:9000/architecture/bank-brief/${data.bankId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ currentBalance: newBalance })
          });
        }
      }
      
      await fetchFinanceData();
    } catch (err) {
      console.error("Add transaction error:", err);
      throw err;
    }
  };

  return (
    <FinanceContext.Provider value={{ ledger, bankBriefs, isLoading, addTransaction, fetchFinanceData }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
