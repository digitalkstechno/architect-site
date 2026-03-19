
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TransactionType = "CREDIT" | "DEBIT";

export interface LedgerEntry {
  id: string;
  tenantId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceNo?: string;
  date: string;
  balanceAfter: number;
}

export interface BankBrief {
  id: string;
  tenantId: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  isActive: boolean;
}

interface FinanceContextType {
  ledger: LedgerEntry[];
  bankBriefs: BankBrief[];
  addTransaction: (data: Omit<LedgerEntry, "id" | "balanceAfter">) => void;
  updateBankBalance: (bankId: string, amount: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [bankBriefs, setBankBriefs] = useState<BankBrief[]>([
    {
      id: "bank-1",
      tenantId: "tenant-1",
      bankName: "HDFC Bank",
      accountNumber: "XXXX XXXX 1234",
      currentBalance: 50000,
      isActive: true,
    }
  ]);

  const addTransaction = (data: Omit<LedgerEntry, "id" | "balanceAfter">) => {
    const lastBalance = ledger.length > 0 ? ledger[0].balanceAfter : bankBriefs[0]?.currentBalance || 0;
    const newBalance = data.type === "CREDIT" ? lastBalance + data.amount : lastBalance - data.amount;
    
    const newEntry: LedgerEntry = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      balanceAfter: newBalance,
    };

    setLedger([newEntry, ...ledger]);
    
    // Auto-update first active bank for demo
    if (bankBriefs.length > 0) {
      updateBankBalance(bankBriefs[0].id, data.type === "CREDIT" ? data.amount : -data.amount);
    }
  };

  const updateBankBalance = (bankId: string, amount: number) => {
    setBankBriefs(prev => prev.map(b => 
      b.id === bankId ? { ...b, currentBalance: b.currentBalance + amount } : b
    ));
  };

  return (
    <FinanceContext.Provider value={{ ledger, bankBriefs, addTransaction, updateBankBalance }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
