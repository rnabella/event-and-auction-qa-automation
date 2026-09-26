import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TicketsPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/admin/tickets.html');
  }

  async createTicket(name: string, price: number): Promise<void> {
    await this.page.fill('#ticket-name', name);
    await this.page.fill('#ticket-price', String(price));
    await this.page.click('#ticket-form button[type="submit"]');
  }

  get error(): Locator {
    return this.page.locator('#ticket-error');
  }
}
