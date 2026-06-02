import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const paymentService = {
  async getAllPayments() {
    return api.get(endPointApi.payments);
  },
  async getPaymentById(id: string) {
    return api.get(endPointApi.paymentById(id));
  },
  async createPayment(paymentData: any) {
    return api.post(endPointApi.payments, paymentData);
  },
  async updatePayment(id: string, paymentData: any) {
    return api.put(endPointApi.paymentById(id), paymentData);
  },
  async deletePayment(id: string) {
    return api.delete(endPointApi.paymentById(id));
  },
};
