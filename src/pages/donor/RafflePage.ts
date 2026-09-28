import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RafflePage extends BasePage {
  async open(raffleId: string, guestId: string): Promise<void> {
    await this.goto(`/donor/raffle.html?raffleId=${raffleId}&guestId=${guestId}`);
  }

  async enter(): Promise<void> {
    await this.page.click('#enter-raffle-button');
  }

  get summary(): Locator {
    return this.page.locator('#raffle-summary');
  }

  get error(): Locator {
    return this.page.locator('#enter-raffle-error');
  }
}
