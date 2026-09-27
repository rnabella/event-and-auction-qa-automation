import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BidPage extends BasePage {
  async open(lotId: string, guestId: string): Promise<void> {
    await this.goto(`/donor/bid.html?lotId=${lotId}&guestId=${guestId}`);
  }

  async placeBid(amount: number): Promise<void> {
    await this.page.fill('#bid-amount', String(amount));
    await this.page.click('#bid-form button[type="submit"]');
  }

  get error(): Locator {
    return this.page.locator('#bid-error');
  }
}
