import { APIRequestContext } from '@playwright/test';

export interface ChecklistItem {
  id: string;
  label: string;
  complete: boolean;
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
}

export interface Lot {
  id: string;
  name: string;
  startPrice: number;
  buyNowPrice: number | null;
  sold: boolean;
  soldTo: string | null;
}

export class AdminApi {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
  ) {}

  async login(username: string, password: string): Promise<void> {
    const res = await this.request.post(`${this.baseUrl}/admin/login`, {
      data: { username, password },
    });
    if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  }

  async getChecklist(): Promise<ChecklistItem[]> {
    const res = await this.request.get(`${this.baseUrl}/admin/checklist`);
    if (!res.ok()) throw new Error(`getChecklist failed: ${res.status()}`);
    return res.json();
  }

  async createTicket(name: string, price: number): Promise<Ticket> {
    const res = await this.request.post(`${this.baseUrl}/admin/tickets`, {
      data: { name, price },
    });
    if (!res.ok()) throw new Error(`createTicket failed: ${res.status()}`);
    return res.json();
  }

  async createLot(name: string, startPrice: number, buyNowPrice?: number): Promise<Lot> {
    const res = await this.request.post(`${this.baseUrl}/admin/lots`, {
      data: {
        name,
        startPrice,
        ...(buyNowPrice !== undefined ? { buyNowPrice } : {}),
      },
    });
    if (!res.ok()) throw new Error(`createLot failed: ${res.status()}`);
    return res.json();
  }

  async reset(): Promise<void> {
    await this.request.post(`${this.baseUrl}/test/reset`);
  }
}
