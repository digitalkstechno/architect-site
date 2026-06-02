import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    return api.get(endPointApi.clients);
  },
  async getClientById(id: string): Promise<Client> {
    return api.get(endPointApi.clientById(id));
  },
  async createClient(clientData: any): Promise<Client> {
    return api.post(endPointApi.clients, clientData);
  },
};
