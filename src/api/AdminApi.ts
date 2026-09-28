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
  winningBid: number | null;
}

export interface Raffle {
  id: string;
  name: string;
  entryPrice: number;
  drawn: boolean;
  winnerGuestId: string | null;
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

  async closeLot(lotId: string): Promise<Lot> {
    const res = await this.request.post(`${this.baseUrl}/admin/lots/${lotId}/close`);
    if (!res.ok()) throw new Error(`closeLot failed: ${res.status()}`);
    return res.json();
  }

  async createRaffle(name: string, entryPrice: number): Promise<Raffle> {
    const res = await this.request.post(`${this.baseUrl}/admin/raffles`, {
      data: { name, entryPrice },
    });
    if (!res.ok()) throw new Error(`createRaffle failed: ${res.status()}`);
    return res.json();
  }

  async drawRaffle(raffleId: string): Promise<Raffle> {
    const res = await this.request.post(`${this.baseUrl}/admin/raffles/${raffleId}/draw`);
    if (!res.ok()) throw new Error(`drawRaffle failed: ${res.status()}`);
    return res.json();
  }

  async reset(): Promise<void> {
    await this.request.post(`${this.baseUrl}/test/reset`);
  }
}
