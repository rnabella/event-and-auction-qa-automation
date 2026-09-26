import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LotsPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/admin/lots.html');
  }

  async createLot(name: string, startPrice: number): Promise<void> {
    await this.page.fill('#lot-name', name);
    await this.page.fill('#lot-start-price', String(startPrice));
    await this.page.click('#lot-form button[type="submit"]');
  }

  get error(): Locator {
    return this.page.locator('#lot-error');
  }
}
