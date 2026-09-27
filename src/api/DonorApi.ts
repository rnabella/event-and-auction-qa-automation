import { APIRequestContext } from '@playwright/test';

export interface Guest {
  id: string;
  name: string;
  email: string;
}

export interface Donation {
  id: string;
  guestId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
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

export class DonorApi {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
  ) {}

  async registerGuest(name: string, email: string): Promise<Guest> {
    const res = await this.request.post(`${this.baseUrl}/guests`, { data: { name, email } });
    if (!res.ok()) throw new Error(`registerGuest failed: ${res.status()}`);
    return res.json();
  }

  async createDonation(guestId: string, amount: number): Promise<Donation> {
    const res = await this.request.post(`${this.baseUrl}/donations`, { data: { guestId, amount } });
    if (!res.ok()) throw new Error(`createDonation failed: ${res.status()}`);
    return res.json();
  }

  async payDonation(donationId: string): Promise<Donation> {
    const res = await this.request.post(`${this.baseUrl}/donations/${donationId}/pay`);
    if (!res.ok()) throw new Error(`payDonation failed: ${res.status()}`);
    return res.json();
  }

  async getDonation(donationId: string): Promise<Donation> {
    const res = await this.request.get(`${this.baseUrl}/donations/${donationId}`);
    if (!res.ok()) throw new Error(`getDonation failed: ${res.status()}`);
    return res.json();
  }

  async getTotals(): Promise<{ totalRaised: number }> {
    const res = await this.request.get(`${this.baseUrl}/totals`);
    if (!res.ok()) throw new Error(`getTotals failed: ${res.status()}`);
    return res.json();
  }

  async buyNow(lotId: string, guestId: string): Promise<Lot> {
    const res = await this.request.post(`${this.baseUrl}/lots/${lotId}/buy-now`, {
      data: { guestId },
    });
    if (!res.ok()) throw new Error(`buyNow failed: ${res.status()}`);
    return res.json();
  }

  async placeBid(
    lotId: string,
    guestId: string,
    amount: number,
  ): Promise<{ id: string; guestId: string; amount: number }> {
    const res = await this.request.post(`${this.baseUrl}/lots/${lotId}/bid`, {
      data: { guestId, amount },
    });
    if (!res.ok()) throw new Error(`placeBid failed: ${res.status()}`);
    return res.json();
  }

  async reset(): Promise<void> {
    await this.request.post(`${this.baseUrl}/test/reset`);
  }
}
