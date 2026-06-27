import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  project: any;
  client: any;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export const invoiceService = {
  async getAllInvoices(): Promise<Invoice[]> {
    return api.get(endPointApi.invoices);
  },
  async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
    return api.get(`${endPointApi.invoices}?project=${projectId}`);
  },
  async createInvoice(data: any): Promise<Invoice> {
    return api.post(endPointApi.invoices, data);
  },
  async updateInvoice(id: string, data: any): Promise<Invoice> {
    return api.put(endPointApi.invoiceById(id), data);
  },
  async deleteInvoice(id: string): Promise<any> {
    return api.delete(endPointApi.invoiceById(id));
  }
};
