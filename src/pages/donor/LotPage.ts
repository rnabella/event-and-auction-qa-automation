import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LotPage extends BasePage {
  async open(lotId: string, guestId: string): Promise<void> {
    await this.goto(`/donor/lot.html?lotId=${lotId}&guestId=${guestId}`);
  }

  async buyNow(): Promise<void> {
    await this.page.click('#buy-now-button');
  }

  get summary(): Locator {
    return this.page.locator('#lot-summary');
  }

  get error(): Locator {
    return this.page.locator('#buy-now-error');
  }
}
