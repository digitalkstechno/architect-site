import { api } from "./api";

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
    return api.get("/invoices");
  },
  async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
    return api.get(`/invoices?project=${projectId}`);
  },
  async createInvoice(data: any): Promise<Invoice> {
    return api.post("/invoices", data);
  },
  async updateInvoice(id: string, data: any): Promise<Invoice> {
    return api.put(`/invoices/${id}`, data);
  },
  async deleteInvoice(id: string): Promise<any> {
    return api.delete(`/invoices/${id}`);
  }
};
