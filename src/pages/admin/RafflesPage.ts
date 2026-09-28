import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RafflesPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/admin/raffles.html');
  }

  async createRaffle(name: string, entryPrice: number): Promise<void> {
    await this.page.fill('#raffle-name', name);
    await this.page.fill('#raffle-entry-price', String(entryPrice));
    await this.page.click('#raffle-form button[type="submit"]');
  }

  get error(): Locator {
    return this.page.locator('#raffle-error');
  }
}
